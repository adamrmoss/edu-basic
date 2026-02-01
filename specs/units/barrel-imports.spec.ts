import * as expressions from '@/lang/expressions';
import * as expressionHelpers from '@/lang/expressions/helpers';
import * as specialExpressions from '@/lang/expressions/special';
import * as statements from '@/lang/statements';

describe('Barrel imports', () => {
    it('should load expression barrels', () => {
        expect(expressions).toBeTruthy();
        expect(expressionHelpers).toBeTruthy();
        expect(specialExpressions).toBeTruthy();
    });

    it('should load statement barrels', () => {
        expect(statements).toBeTruthy();
    });
});

