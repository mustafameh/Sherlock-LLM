'use client';

import { parseStoryBlocks, type StoryBlock } from '@/lib/shared/story/parser';
import type { ChatMessage } from '@/lib/shared/types';

export function deriveStreamingHint(buffer: string): string {
    const markerMatch = buffer.match(/\*{0,2}\[\s*(NARRATOR|SHERLOCK|WATSON|CHARACTER\s*:\s*([^\]]+)|DECISION|AWAITING_INPUT|CHAPTER\s*:\s*[^\]]+|MOOD\s*:\s*[^\]]+|SCENE_BREAK)\s*\]\*{0,2}\s*$/i);
    if (markerMatch) {
        const tag = markerMatch[1].toUpperCase();
        if (tag === 'NARRATOR') return 'Narrating';
        if (tag === 'SHERLOCK') return 'Sherlock Holmes speaking';
        if (tag === 'WATSON') return 'Dr. Watson speaking';
        if (tag.startsWith('CHARACTER')) return `${markerMatch[2]?.trim()} speaking`;
        if (tag === 'DECISION') return 'Presenting choices';
        if (tag === 'AWAITING_INPUT') return 'Waiting for your response';
        if (tag.startsWith('CHAPTER')) return 'New chapter';
        if (tag.startsWith('MOOD')) return 'Setting the mood';
        if (tag === 'SCENE_BREAK') return 'Next scene';
    }
    const trailingMarker = buffer.match(/\[([A-Z_:\s]+[^\]]*?)$/i);
    if (trailingMarker) return 'The story continues';
    return 'The story continues';
}

export interface StreamStoryApiOpts {
    selectedModel: string;
    apiKey: string;
    temperature: number;
    signal?: AbortSignal;
    onBlocksUpdate: (blocks: StoryBlock[]) => void;
    onStreamingHint: (hint: string | null) => void;
    promptParams?: Record<string, unknown>;
}

export async function streamStoryApi(
    messages: ChatMessage[],
    baseBlocks: StoryBlock[],
    opts: StreamStoryApiOpts,
): Promise<string> {
    const { selectedModel, apiKey, temperature, signal, onBlocksUpdate, onStreamingHint, promptParams } = opts;

    if (!apiKey) throw new Error('Please set your OpenRouter API key first.');

    const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: selectedModel,
            messages,
            temperature,
            apiKey,
            ...(promptParams ? { promptParams } : {}),
        }),
        signal,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `API error ${res.status}`);
    }

    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let sseLineBuffer = '';
    let lastBlockCount = 0;
    let lastUpdateTime = 0;
    const THROTTLE_MS = 80;

    onStreamingHint('The story continues');

    const processSSELine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;

        try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
                buffer += delta;

                const parsed = parseStoryBlocks(buffer);
                const now = Date.now();
                const newBlockAppeared = parsed.length > lastBlockCount;

                if (newBlockAppeared) {
                    const newBlocks = parsed.slice(lastBlockCount);
                    onBlocksUpdate([...baseBlocks, ...parsed]);
                    lastBlockCount = parsed.length;
                    lastUpdateTime = now;

                    const lastNew = newBlocks[newBlocks.length - 1];
                    if (lastNew.type === 'narrator') onStreamingHint('Narrating');
                    else if (lastNew.type === 'dialogue') onStreamingHint(`${lastNew.character} speaking`);
                } else if (now - lastUpdateTime >= THROTTLE_MS) {
                    onBlocksUpdate([...baseBlocks, ...parsed]);
                    lastUpdateTime = now;
                }

                onStreamingHint(deriveStreamingHint(buffer));
            }
        } catch { /* incomplete JSON line */ }
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            sseLineBuffer += chunk;

            const lines = sseLineBuffer.split('\n');
            sseLineBuffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed) processSSELine(trimmed);
            }
        }

        if (sseLineBuffer.trim()) {
            processSSELine(sseLineBuffer.trim());
        }
    } finally {
        reader.releaseLock();
    }

    const finalBlocks = parseStoryBlocks(buffer);
    onBlocksUpdate([...baseBlocks, ...finalBlocks]);
    onStreamingHint(null);

    return buffer;
}
