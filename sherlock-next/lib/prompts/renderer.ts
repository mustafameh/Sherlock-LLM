/**
 * Lightweight Jinja-style template renderer.
 * Supports: {{ variable }}, {% if variable %}...{% endif %}, {% for item in list %}...{% endfor %}
 */
export function render(template: string, vars: Record<string, unknown>): string {
    let result = template;

    result = result.replace(
        /\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g,
        (_, itemName, listName, body) => {
            const list = vars[listName];
            if (!Array.isArray(list)) return '';
            return list.map(item => {
                const loopVars = { ...vars, [itemName]: item };
                return render(body, loopVars);
            }).join('');
        },
    );

    result = result.replace(
        /\{%\s*if\s+(not\s+)?(\w+)\s*%\}([\s\S]*?)(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/g,
        (_, negated, varName, ifBody, elseBody) => {
            const val = vars[varName];
            const truthy = negated ? !val : !!val;
            return truthy ? render(ifBody, vars) : (elseBody ? render(elseBody, vars) : '');
        },
    );

    result = result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
        const parts = key.split('.');
        let val: unknown = vars;
        for (const p of parts) {
            if (val == null || typeof val !== 'object') return '';
            val = (val as Record<string, unknown>)[p];
        }
        return val != null ? String(val) : '';
    });

    return result.trim();
}
