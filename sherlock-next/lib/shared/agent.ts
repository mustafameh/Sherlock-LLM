/**
 * Parse the LLM response into ReAct steps.
 */
export function parseReActResponse(text: string): { steps: Array<{ type: 'thought' | 'action' | 'observation' | 'final_answer'; content: string; toolName?: string; toolArgs?: Record<string, unknown> }>; finalAnswer: string } {
    const steps: Array<{ type: 'thought' | 'action' | 'observation' | 'final_answer'; content: string; toolName?: string; toolArgs?: Record<string, unknown> }> = [];
    let finalAnswer = '';

    const lines = text.split('\n');
    let currentType: 'thought' | 'action' | 'observation' | 'final_answer' | null = null;
    let currentContent = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Thought:')) {
            if (currentType && currentContent.trim()) {
                pushStep();
            }
            currentType = 'thought';
            currentContent = trimmed.slice('Thought:'.length).trim();
        } else if (trimmed.startsWith('Action:')) {
            if (currentType && currentContent.trim()) {
                pushStep();
            }
            currentType = 'action';
            currentContent = trimmed.slice('Action:'.length).trim();
        } else if (trimmed.startsWith('Observation:')) {
            if (currentType && currentContent.trim()) {
                pushStep();
            }
            currentType = 'observation';
            currentContent = trimmed.slice('Observation:'.length).trim();
        } else if (trimmed.startsWith('Final Answer:')) {
            if (currentType && currentContent.trim()) {
                pushStep();
            }
            currentType = 'final_answer';
            currentContent = trimmed.slice('Final Answer:'.length).trim();
        } else if (currentType) {
            currentContent += '\n' + line;
        } else {
            currentType = 'final_answer';
            currentContent += line + '\n';
        }
    }

    if (currentType && currentContent.trim()) {
        pushStep();
    }

    if (!finalAnswer) {
        finalAnswer = text.trim();
    }

    function pushStep() {
        if (currentType === 'action') {
            const parsed = parseAction(currentContent);
            steps.push({
                type: 'action',
                content: currentContent,
                toolName: parsed.toolName,
                toolArgs: parsed.args,
            });
        } else if (currentType === 'final_answer') {
            finalAnswer = currentContent.trim();
            steps.push({
                type: 'final_answer',
                content: currentContent.trim(),
            });
        } else if (currentType) {
            steps.push({
                type: currentType,
                content: currentContent.trim(),
            });
        }
        currentContent = '';
        currentType = null;
    }

    return { steps, finalAnswer };
}

function parseAction(action: string): { toolName: string; args: Record<string, unknown> } {
    const match = action.match(/^(\w+)\s*\(([\s\S]*)\)\s*$/);
    if (match) {
        const toolName = match[1];
        try {
            const args = JSON.parse(match[2]);
            return { toolName, args };
        } catch {
            return { toolName, args: { raw: match[2] } };
        }
    }
    return { toolName: action.trim(), args: {} };
}
