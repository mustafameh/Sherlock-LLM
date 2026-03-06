export type StoryBlock =
    | { type: 'narrator'; content: string }
    | { type: 'dialogue'; character: string; content: string }
    | { type: 'decision'; options: string[] }
    | { type: 'awaiting_input'; context: string }
    | { type: 'user_action'; content: string }
    | { type: 'chapter'; title: string }
    | { type: 'mood'; mood: string }
    | { type: 'scene_break' };

const BLOCK_PATTERN = /\*{0,2}\[\s*(NARRATOR|SHERLOCK|WATSON|CHARACTER\s*:\s*([^\]]+)|DECISION|AWAITING_INPUT|CHAPTER\s*:\s*([^\]]+)|MOOD\s*:\s*([^\]]+)|SCENE_BREAK)\s*\]\*{0,2}/gi;

export function parseStoryBlocks(raw: string): StoryBlock[] {
    const blocks: StoryBlock[] = [];
    const markers: { type: string; character?: string; index: number; fullMatchLength: number }[] = [];

    BLOCK_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BLOCK_PATTERN.exec(raw)) !== null) {
        const tag = match[1].toUpperCase();
        if (tag.startsWith('CHAPTER')) {
            markers.push({ type: 'chapter', character: match[3].trim(), index: match.index, fullMatchLength: match[0].length });
        } else if (tag.startsWith('MOOD')) {
            markers.push({ type: 'mood', character: match[4].trim().toLowerCase(), index: match.index, fullMatchLength: match[0].length });
        } else if (tag.startsWith('CHARACTER')) {
            markers.push({ type: 'dialogue', character: match[2].trim(), index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'SHERLOCK') {
            markers.push({ type: 'dialogue', character: 'Sherlock Holmes', index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'WATSON') {
            markers.push({ type: 'dialogue', character: 'Dr. Watson', index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'NARRATOR') {
            markers.push({ type: 'narrator', index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'DECISION') {
            markers.push({ type: 'decision', index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'AWAITING_INPUT') {
            markers.push({ type: 'awaiting_input', index: match.index, fullMatchLength: match[0].length });
        } else if (tag === 'SCENE_BREAK') {
            markers.push({ type: 'scene_break', index: match.index, fullMatchLength: match[0].length });
        }
    }

    if (markers.length === 0) {
        const trimmed = raw.trim();
        if (trimmed) {
            blocks.push({ type: 'narrator', content: trimmed });
        }
        return blocks;
    }

    for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        const tagEnd = marker.index + marker.fullMatchLength;
        const contentEnd = i + 1 < markers.length ? markers[i + 1].index : raw.length;
        const content = raw.slice(tagEnd, contentEnd).trim();

        if (marker.type === 'scene_break') {
            blocks.push({ type: 'scene_break' });
            continue;
        }

        if (marker.type === 'chapter') {
            blocks.push({ type: 'chapter', title: marker.character! });
            continue;
        }

        if (marker.type === 'mood') {
            blocks.push({ type: 'mood', mood: marker.character! });
            continue;
        }

        if (marker.type === 'awaiting_input') {
            blocks.push({ type: 'awaiting_input', context: content || 'What do you do?' });
            continue;
        }

        if (!content) continue;

        switch (marker.type) {
            case 'narrator':
                blocks.push({ type: 'narrator', content });
                break;
            case 'dialogue':
                blocks.push({ type: 'dialogue', character: marker.character!, content });
                break;
            case 'decision': {
                const options = content
                    .split('\n')
                    .map(line => line.replace(/^[-•*]\s*/, '').trim())
                    .filter(line => line.length > 0);
                if (options.length > 0) {
                    blocks.push({ type: 'decision', options });
                }
                break;
            }
            case 'awaiting_input':
                blocks.push({ type: 'awaiting_input', context: content });
                break;
        }
    }

    return blocks;
}

export interface Scene {
    blocks: StoryBlock[];
    userAction?: string;
}

export function deriveScenes(blocks: StoryBlock[]): Scene[] {
    const scenes: Scene[] = [];
    let current: StoryBlock[] = [];

    for (const block of blocks) {
        if (block.type === 'user_action') {
            scenes.push({ blocks: current, userAction: block.content });
            current = [];
        } else if (block.type === 'scene_break') {
            if (current.length > 0) {
                scenes.push({ blocks: current });
                current = [];
            }
        } else {
            current.push(block);
        }
    }

    if (current.length > 0) {
        scenes.push({ blocks: current });
    }

    if (scenes.length === 0) {
        scenes.push({ blocks: [] });
    }

    return scenes;
}
