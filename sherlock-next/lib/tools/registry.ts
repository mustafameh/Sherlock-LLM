import { Tool } from '../types';

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    register(tool: Tool): void {
        this.tools.set(tool.name, tool);
    }

    unregister(name: string): void {
        this.tools.delete(name);
    }

    get(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    list(): Tool[] {
        return Array.from(this.tools.values());
    }

    has(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Generate a description of all registered tools for the system prompt.
     * Returns empty string if no tools are registered.
     */
    getToolDescriptions(): string {
        if (this.tools.size === 0) return '';

        const descriptions: string[] = [];
        for (const tool of this.tools.values()) {
            let desc = `- ${tool.name}: ${tool.description}`;
            const params = Object.entries(tool.parameters);
            if (params.length > 0) {
                desc += '\n  Parameters:';
                for (const [paramName, paramDef] of params) {
                    desc += `\n    - ${paramName} (${paramDef.type}${paramDef.required ? ', required' : ''}): ${paramDef.description}`;
                }
            }
            descriptions.push(desc);
        }

        return descriptions.join('\n');
    }

    /**
     * Execute a tool by name with the given arguments.
     */
    async execute(name: string, args: Record<string, unknown>): Promise<string> {
        const tool = this.tools.get(name);
        if (!tool) {
            return `Error: Tool "${name}" not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}`;
        }
        try {
            return await tool.execute(args);
        } catch (error) {
            return `Error executing tool "${name}": ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}

// Global registry instance
export const toolRegistry = new ToolRegistry();
