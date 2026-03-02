import type { StoryBlock } from './storyParser';

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function blocksToHtml(blocks: StoryBlock[]): string {
    return blocks.map(block => {
        switch (block.type) {
            case 'chapter':
                return `<h2 class="chapter">${escapeHtml(block.title)}</h2><hr class="chapter-rule">`;
            case 'narrator':
                return `<p class="narrator">${escapeHtml(block.content)}</p>`;
            case 'dialogue':
                return `<p class="dialogue"><strong>${escapeHtml(block.character)}:</strong> \u201c${escapeHtml(block.content)}\u201d</p>`;
            case 'user_action':
                return `<p class="user-action"><em>${escapeHtml(block.content)}</em></p>`;
            case 'decision':
                return `<p class="decision"><em>Choices presented: ${block.options.map(o => escapeHtml(o)).join(' / ')}</em></p>`;
            case 'mood':
            case 'awaiting_input':
            default:
                return '';
        }
    }).filter(Boolean).join('\n');
}

const PDF_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .pdf-root {
      font-family: Georgia, 'Times New Roman', serif;
      color: #1a1a1a;
      max-width: 700px;
      margin: 0 auto;
      padding: 40px 32px;
      line-height: 1.8;
      font-size: 14px;
      background: #fdf8f0;
  }
  h1 { text-align: center; font-size: 28px; font-weight: 700; margin-bottom: 4px; color: #2c1810; }
  .subtitle { text-align: center; font-size: 14px; color: #6b5a4e; margin-bottom: 32px; font-style: italic; }
  h2.chapter { text-align: center; font-size: 20px; font-weight: 700; margin-top: 36px; margin-bottom: 4px; letter-spacing: 0.02em; color: #4a3728; }
  hr.chapter-rule { border: none; border-top: 1px solid #c9b99a; width: 40%; margin: 0 auto 20px; }
  .narrator { font-style: italic; color: #3d3d3d; margin-bottom: 14px; padding-left: 12px; border-left: 3px solid #c9b99a; }
  .dialogue { margin-bottom: 14px; }
  .dialogue strong { color: #8b5e3c; }
  .user-action { color: #2563eb; margin-bottom: 14px; font-style: italic; }
  .decision { color: #888; font-size: 12px; margin-bottom: 14px; }
`;

function buildContent(blocks: StoryBlock[], title: string, character: string): string {
    return `<style>${PDF_STYLES}</style>
<div class="pdf-root">
<h1>${escapeHtml(title)}</h1>
<p class="subtitle">An interactive adventure \u2014 playing as ${escapeHtml(character)}</p>
${blocksToHtml(blocks)}
</div>`;
}

export async function exportStoryAsPdf(
    blocks: StoryBlock[],
    title: string,
    character: string,
): Promise<void> {
    const container = document.createElement('div');
    container.innerHTML = buildContent(blocks, title, character);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '700px';
    document.body.appendChild(container);

    try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf()
            .set({
                margin: [10, 10, 10, 10],
                filename: `${title.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'story'}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fdf8f0' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(container)
            .save();
    } finally {
        document.body.removeChild(container);
    }
}
