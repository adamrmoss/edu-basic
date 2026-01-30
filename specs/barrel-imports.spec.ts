import * as expressions from '../src/lang/expressions';
import * as expressionHelpers from '../src/lang/expressions/helpers';
import * as specialExpressions from '../src/lang/expressions/special';
import * as statements from '../src/lang/statements';

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

