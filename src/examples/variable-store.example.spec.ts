/**
 * Example: Testing a Variable Store for EduBASIC
 * Demonstrates testing data structures and type management
 */

describe('Variable Store (Example)', () =>
{
    enum DataType
    {
        INTEGER = 'INTEGER',
        REAL = 'REAL',
        STRING = 'STRING',
        COMPLEX = 'COMPLEX'
    }

    interface Variable
    {
        name: string;
        type: DataType;
        value: number | string | ComplexNumber;
    }

    interface ComplexNumber
    {
        real: number;
        imag: number;
    }

    class VariableStore
    {
        private variables: Map<string, Variable> = new Map();

        public set(name: string, type: DataType, value: number | string | ComplexNumber): void
        {
            const normalizedName = name.toLowerCase();

            this.variables.set(normalizedName, {
                name: normalizedName,
                type,
                value
            });
        }

        public get(name: string): Variable | undefined
        {
            const normalizedName = name.toLowerCase();
            return this.variables.get(normalizedName);
        }

        public has(name: string): boolean
        {
            const normalizedName = name.toLowerCase();
            return this.variables.has(normalizedName);
        }

        public delete(name: string): boolean
        {
            const normalizedName = name.toLowerCase();
            return this.variables.delete(normalizedName);
        }

        public clear(): void
        {
            this.variables.clear();
        }

        public getAll(): Variable[]
        {
            return Array.from(this.variables.values());
        }

        public getByType(type: DataType): Variable[]
        {
            return this.getAll().filter(v => v.type === type);
        }
    }

    let store: VariableStore;

    beforeEach(() =>
    {
        store = new VariableStore();
    });

    describe('Basic Operations', () =>
    {
        it('should store integer variable', () =>
        {
            store.set('count%', DataType.INTEGER, 42);

            const variable = store.get('count%');
            expect(variable).toBeDefined();
            expect(variable?.value).toBe(42);
            expect(variable?.type).toBe(DataType.INTEGER);
        });

        it('should store real variable', () =>
        {
            store.set('temperature#', DataType.REAL, 98.6);

            const variable = store.get('temperature#');
            expect(variable).toBeDefined();
            expect(variable?.value).toBe(98.6);
            expect(variable?.type).toBe(DataType.REAL);
        });

        it('should store string variable', () =>
        {
            store.set('name$', DataType.STRING, 'Alice');

            const variable = store.get('name$');
            expect(variable).toBeDefined();
            expect(variable?.value).toBe('Alice');
            expect(variable?.type).toBe(DataType.STRING);
        });

        it('should store complex variable', () =>
        {
            const complex: ComplexNumber = { real: 3, imag: 4 };
            store.set('impedance&', DataType.COMPLEX, complex);

            const variable = store.get('impedance&');
            expect(variable).toBeDefined();
            expect(variable?.value).toEqual({ real: 3, imag: 4 });
            expect(variable?.type).toBe(DataType.COMPLEX);
        });
    });

    describe('Case Insensitivity', () =>
    {
        it('should treat variable names as case-insensitive', () =>
        {
            store.set('Count%', DataType.INTEGER, 10);

            expect(store.get('count%')?.value).toBe(10);
            expect(store.get('COUNT%')?.value).toBe(10);
            expect(store.get('CouNT%')?.value).toBe(10);
        });

        it('should overwrite variable with different case', () =>
        {
            store.set('Value%', DataType.INTEGER, 10);
            store.set('value%', DataType.INTEGER, 20);

            expect(store.get('VALUE%')?.value).toBe(20);
        });
    });

    describe('Variable Updates', () =>
    {
        it('should update existing variable', () =>
        {
            store.set('count%', DataType.INTEGER, 10);
            store.set('count%', DataType.INTEGER, 20);

            expect(store.get('count%')?.value).toBe(20);
        });

        it('should allow changing value type (dynamic typing)', () =>
        {
            store.set('x%', DataType.INTEGER, 10);

            const firstValue = store.get('x%');
            expect(firstValue?.value).toBe(10);
            expect(firstValue?.type).toBe(DataType.INTEGER);
        });
    });

    describe('Variable Existence', () =>
    {
        it('should check if variable exists', () =>
        {
            store.set('test%', DataType.INTEGER, 5);

            expect(store.has('test%')).toBe(true);
            expect(store.has('nonexistent%')).toBe(false);
        });

        it('should return undefined for non-existent variable', () =>
        {
            expect(store.get('missing%')).toBeUndefined();
        });
    });

    describe('Variable Deletion', () =>
    {
        it('should delete variable', () =>
        {
            store.set('temp%', DataType.INTEGER, 100);
            expect(store.has('temp%')).toBe(true);

            const deleted = store.delete('temp%');
            expect(deleted).toBe(true);
            expect(store.has('temp%')).toBe(false);
        });

        it('should return false when deleting non-existent variable', () =>
        {
            const deleted = store.delete('nonexistent%');
            expect(deleted).toBe(false);
        });
    });

    describe('Store Management', () =>
    {
        it('should clear all variables', () =>
        {
            store.set('a%', DataType.INTEGER, 1);
            store.set('b%', DataType.INTEGER, 2);
            store.set('c%', DataType.INTEGER, 3);

            expect(store.getAll().length).toBe(3);

            store.clear();

            expect(store.getAll().length).toBe(0);
            expect(store.has('a%')).toBe(false);
        });

        it('should get all variables', () =>
        {
            store.set('x%', DataType.INTEGER, 10);
            store.set('y#', DataType.REAL, 3.14);
            store.set('name$', DataType.STRING, 'Test');

            const all = store.getAll();
            expect(all.length).toBe(3);
        });

        it('should filter variables by type', () =>
        {
            store.set('a%', DataType.INTEGER, 1);
            store.set('b%', DataType.INTEGER, 2);
            store.set('c#', DataType.REAL, 3.14);
            store.set('d$', DataType.STRING, 'test');

            const integers = store.getByType(DataType.INTEGER);
            expect(integers.length).toBe(2);

            const reals = store.getByType(DataType.REAL);
            expect(reals.length).toBe(1);

            const strings = store.getByType(DataType.STRING);
            expect(strings.length).toBe(1);
        });
    });

    describe('Multiple Variables', () =>
    {
        it('should store multiple variables independently', () =>
        {
            store.set('count%', DataType.INTEGER, 42);
            store.set('sum%', DataType.INTEGER, 100);
            store.set('average#', DataType.REAL, 50.5);

            expect(store.get('count%')?.value).toBe(42);
            expect(store.get('sum%')?.value).toBe(100);
            expect(store.get('average#')?.value).toBe(50.5);
        });

        it('should handle many variables', () =>
        {
            for (let i = 0; i < 100; i++)
            {
                store.set(`var${i}%`, DataType.INTEGER, i);
            }

            expect(store.getAll().length).toBe(100);
            expect(store.get('var50%')?.value).toBe(50);
        });
    });

    describe('Complex Number Operations', () =>
    {

        it('should store and retrieve complex numbers', () =>
        {
            const z1: ComplexNumber = { real: 3, imag: 4 };
            const z2: ComplexNumber = { real: -2, imag: 1 };

            store.set('z1&', DataType.COMPLEX, z1);
            store.set('z2&', DataType.COMPLEX, z2);

            expect(store.get('z1&')?.value).toEqual({ real: 3, imag: 4 });
            expect(store.get('z2&')?.value).toEqual({ real: -2, imag: 1 });
        });

        it('should handle zero complex number', () =>
        {
            const zero: ComplexNumber = { real: 0, imag: 0 };
            store.set('zero&', DataType.COMPLEX, zero);

            expect(store.get('zero&')?.value).toEqual({ real: 0, imag: 0 });
        });
    });
});
