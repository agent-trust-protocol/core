export class PolicyEngine {
    rules = new Map();
    addRule(rule) {
        if (rule.active) {
            this.rules.set(rule.id, rule);
        }
    }
    removeRule(ruleId) {
        this.rules.delete(ruleId);
    }
    async evaluate(context) {
        const applicableRules = Array.from(this.rules.values())
            .filter(rule => rule.active)
            .sort((a, b) => b.priority - a.priority);
        for (const rule of applicableRules) {
            try {
                const result = this.evaluateRule(rule, context);
                if (result !== null) {
                    return {
                        allowed: rule.effect === 'allow',
                        reason: `Policy rule '${rule.name}' ${rule.effect}ed access`,
                    };
                }
            }
            catch (error) {
                console.warn(`Error evaluating policy rule ${rule.id}:`, error);
            }
        }
        return {
            allowed: true,
            reason: 'No applicable policy rules found - default allow',
        };
    }
    evaluateRule(rule, context) {
        try {
            const safeContext = this.createSafeContext(context);
            const func = new Function('context', `return ${rule.condition}`);
            const result = func(safeContext);
            return typeof result === 'boolean' ? result : null;
        }
        catch (error) {
            return null;
        }
    }
    createSafeContext(context) {
        return {
            subject: context.subject,
            action: context.action,
            resource: context.resource,
            grant: {
                id: context.grant.id,
                grantor: context.grant.grantor,
                grantee: context.grant.grantee,
                scopes: context.grant.scopes,
                resource: context.grant.resource,
                createdAt: context.grant.createdAt,
                expiresAt: context.grant.expiresAt,
            },
            context: context.context || {},
            now: Date.now(),
        };
    }
    getDefaultRules() {
        return [
            {
                id: 'default-time-check',
                name: 'Check Grant Expiration',
                condition: '!context.grant.expiresAt || context.grant.expiresAt > context.now',
                effect: 'allow',
                priority: 1000,
                active: true,
            },
            {
                id: 'admin-override',
                name: 'Admin Override',
                condition: 'context.grant.scopes.includes("admin")',
                effect: 'allow',
                priority: 900,
                active: true,
            },
            {
                id: 'self-access',
                name: 'Self Access',
                condition: 'context.subject === context.resource',
                effect: 'allow',
                priority: 800,
                active: true,
            },
        ];
    }
}
