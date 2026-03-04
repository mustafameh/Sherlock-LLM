import 'server-only';

export interface ChatMessage {
    role: string;
    content: string;
}

/**
 * Folds a system-role message into the first user message when the model
 * provider rejects system-role messages (e.g. some Google AI Studio models).
 */
export function foldSystemIntoUser(messages: ChatMessage[]): ChatMessage[] {
    const systemMsg = messages.find(m => m.role === 'system');
    if (!systemMsg) return messages;

    const rest = messages.filter(m => m.role !== 'system');
    const firstUserIdx = rest.findIndex(m => m.role === 'user');
    if (firstUserIdx !== -1) {
        rest[firstUserIdx] = {
            ...rest[firstUserIdx],
            content: `[System Instructions]\n${systemMsg.content}\n\n[User Message]\n${rest[firstUserIdx].content}`,
        };
    } else {
        rest.unshift({ role: 'user', content: systemMsg.content });
    }
    return rest;
}
