import type { StoryBlock } from '@/lib/shared/story/parser';

function esc(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const S = {
    root: 'font-family:Georgia,Times New Roman,serif;color:#1a1a1a;width:700px;padding:40px 32px;line-height:1.8;font-size:14px;background:#fdf8f0;',
    h1: 'text-align:center;font-size:28px;font-weight:700;margin:0 0 4px;color:#2c1810;',
    subtitle: 'text-align:center;font-size:14px;color:#6b5a4e;margin:0 0 32px;font-style:italic;',
    chapter: 'text-align:center;font-size:20px;font-weight:700;margin:36px 0 4px;letter-spacing:0.02em;color:#4a3728;',
    chapterRule: 'border:none;border-top:1px solid #c9b99a;width:40%;margin:0 auto 20px;',
    narrator: 'font-style:italic;color:#3d3d3d;margin:0 0 14px;padding-left:12px;border-left:3px solid #c9b99a;',
    dialogue: 'margin:0 0 14px;',
    dialogueName: 'color:#8b5e3c;font-weight:bold;',
    userAction: 'color:#2563eb;margin:0 0 14px;font-style:italic;',
    decision: 'color:#888;font-size:12px;margin:0 0 14px;',
};

function blocksToHtml(blocks: StoryBlock[]): string {
    return blocks.map(block => {
        switch (block.type) {
            case 'chapter':
                return `<h2 style="${S.chapter}">${esc(block.title)}</h2><hr style="${S.chapterRule}">`;
            case 'narrator':
                return `<p style="${S.narrator}">${esc(block.content)}</p>`;
            case 'dialogue':
                return `<p style="${S.dialogue}"><span style="${S.dialogueName}">${esc(block.character)}:</span> \u201c${esc(block.content)}\u201d</p>`;
            case 'user_action':
                return `<p style="${S.userAction}"><em>${esc(block.content)}</em></p>`;
            case 'decision':
                return `<p style="${S.decision}"><em>Choices presented: ${block.options.map(o => esc(o)).join(' / ')}</em></p>`;
            case 'mood':
            case 'awaiting_input':
            case 'scene_break':
            default:
                return '';
        }
    }).filter(Boolean).join('');
}

export async function exportStoryAsPdf(
    blocks: StoryBlock[],
    title: string,
    character: string,
): Promise<void> {
    const root = document.createElement('div');
    root.style.cssText = S.root;

    root.innerHTML =
        `<h1 style="${S.h1}">${esc(title)}</h1>` +
        `<p style="${S.subtitle}">An interactive adventure \u2014 playing as ${esc(character)}</p>` +
        blocksToHtml(blocks);

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:0;top:0;width:700px;z-index:99999;overflow:hidden;height:0;';
    wrapper.appendChild(root);
    document.body.appendChild(wrapper);

    wrapper.style.height = 'auto';

    try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf()
            .set({
                margin: [10, 10, 10, 10],
                filename: `${title.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'story'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fdf8f0', logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(root)
            .save();
    } finally {
        document.body.removeChild(wrapper);
    }
}
