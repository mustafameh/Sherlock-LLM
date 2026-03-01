import { Character } from './types';

/**
 * Generate the Sherlock Holmes system prompt based on character and context.
 * Includes ReAct format instructions for tool use.
 */
export function generateSystemPrompt(
    character: Character | null,
    context: string,
    toolDescriptions: string
): string {
    let message = `You are Sherlock Holmes, the famous detective known for your proficiency in observation, deduction, forensic science, and logical reasoning that borders on the fantastic, which you employ when investigating cases for a wide variety of clients. Respond in character. Sherlock Holmes typically speaks in a direct, analytical, and often brusque manner. His conversational style is characterized by keen observations, logical deductions, and a tendency to be blunt or even impatient with those who can't follow his rapid thought processes. Holmes often delivers his insights in a confident, sometimes dramatic fashion, punctuated by moments of dry wit or sarcasm. He's prone to making sharp, incisive remarks and can be dismissive of ideas he finds illogical. While brilliant in his deductions, Holmes can come across as aloof or detached in social interactions, focusing intensely on the intellectual aspects of a case rather than emotional nuances.`;

    if (context) {
        message += ` Context: ${context}`;
    }

    message += ` You are currently in a conversation with `;

    if (character) {
        message += `${character.name}. ${character.description} `;
        if (character.relationship) message += `Their relationship to you is ${character.relationship}. `;
        if (character.traits && character.traits.length > 0) message += `They have the following traits: ${character.traits.join(', ')}. `;
        if (character.speakingStyle) message += `Their speaking style: ${character.speakingStyle}. `;
        if (character.sherlockApproach) message += `Your approach to them: ${character.sherlockApproach}. `;
        message += `Adjust your tone and manner of speaking accordingly.`;
    } else {
        message += `an unknown individual. Treat them as a stranger who has come to seek your help.`;
    }

    // ReAct instructions
    if (toolDescriptions) {
        message += `\n\nYou have access to the following tools:\n${toolDescriptions}\n\nTo use a tool, you MUST follow this exact format:\n\nThought: [your reasoning about what to do next]\nAction: tool_name({"param": "value"})\n\nAfter the tool returns a result, you will see:\nObservation: [the tool's output]\n\nYou can then continue thinking and using tools as needed.\nWhen you have enough information to give a final response, use:\n\nThought: I now have enough information to respond.\nFinal Answer: [your response to the user in character as Sherlock Holmes]`;
    } else {
        message += `\n\nRespond directly to the user in character as Sherlock Holmes. If you reason through a problem, you may optionally show your thinking process using:\n\nThought: [your reasoning]\nFinal Answer: [your response]`;
    }

    return message;
}

/**
 * Parse the LLM response into ReAct steps.
 */
export function parseReActResponse(text: string): { steps: Array<{ type: 'thought' | 'action' | 'observation' | 'final_answer'; content: string; toolName?: string; toolArgs?: Record<string, unknown> }>; finalAnswer: string } {
    const steps: Array<{ type: 'thought' | 'action' | 'observation' | 'final_answer'; content: string; toolName?: string; toolArgs?: Record<string, unknown> }> = [];
    let finalAnswer = '';

    // Split by the markers
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
            // No markers found — treat entire response as final answer
            currentType = 'final_answer';
            currentContent += line + '\n';
        }
    }

    // Push last step
    if (currentType && currentContent.trim()) {
        pushStep();
    }

    // If no final answer was found, use the full text
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

/**
 * Parse an action string like: tool_name({"arg": "value"})
 */
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
