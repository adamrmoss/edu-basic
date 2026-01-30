import { StatementHelpRegistry as CommandHelpRegistry } from '@/lang/statements/misc/command-help-registry';
import { StatementHelpRegistry as StatementHelpRegistry } from '@/lang/statements/misc/statement-help-registry';

describe('Help registries', () => {
    it('command help registry should return forms for known statements', () => {
        const forms = CommandHelpRegistry.getHelpForms('print');

        expect(forms.length).toBeGreaterThan(0);
        expect(forms[0]).toContain('PRINT');
    });

    it('statement help registry should return forms for HELP itself', () => {
        const forms = StatementHelpRegistry.getHelpForms('help');

        expect(forms).toEqual(['HELP keyword']);
    });

    it('should return empty array for unknown keyword', () => {
        expect(CommandHelpRegistry.getHelpForms('not-a-keyword')).toEqual([]);
        expect(StatementHelpRegistry.getHelpForms('not-a-keyword')).toEqual([]);
    });
});
