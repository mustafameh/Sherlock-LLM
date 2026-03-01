export type StoryBlock =
    | { type: 'narrator'; content: string }
    | { type: 'dialogue'; character: string; content: string }
    | { type: 'decision'; options: string[] }
    | { type: 'awaiting_input'; context: string }
    | { type: 'user_action'; content: string };

const BLOCK_PATTERN = /\[(NARRATOR|SHERLOCK|WATSON|CHARACTER:([^\]]+)|DECISION|AWAITING_INPUT)\]/g;

export function parseStoryBlocks(raw: string): StoryBlock[] {
    const blocks: StoryBlock[] = [];
    const markers: { type: string; character?: string; index: number }[] = [];

    BLOCK_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BLOCK_PATTERN.exec(raw)) !== null) {
        const tag = match[1];
        if (tag.startsWith('CHARACTER:')) {
            markers.push({ type: 'dialogue', character: match[2].trim(), index: match.index });
        } else if (tag === 'SHERLOCK') {
            markers.push({ type: 'dialogue', character: 'Sherlock Holmes', index: match.index });
        } else if (tag === 'WATSON') {
            markers.push({ type: 'dialogue', character: 'Dr. Watson', index: match.index });
        } else if (tag === 'NARRATOR') {
            markers.push({ type: 'narrator', index: match.index });
        } else if (tag === 'DECISION') {
            markers.push({ type: 'decision', index: match.index });
        } else if (tag === 'AWAITING_INPUT') {
            markers.push({ type: 'awaiting_input', index: match.index });
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
        const tagEnd = raw.indexOf(']', marker.index) + 1;
        const contentEnd = i + 1 < markers.length ? markers[i + 1].index : raw.length;
        const content = raw.slice(tagEnd, contentEnd).trim();

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
