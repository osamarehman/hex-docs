import { validateCalculationParams, validateAddressInput, validateHouseInfo } from '../validation';

describe('Validation Module', () => {
    describe('validateCalculationParams', () => {
        it('should validate correct parameters', () => {
            const validParams = {
                eingangId: '123',
                heatingType: 'gas',
                newHeatingPlace: 'indoor',
                buildingType: 'house',
                constructionYear: 2000,
                heatedArea: 150
            };

            expect(() => validateCalculationParams(validParams)).not.toThrow();
        });

        it('should throw error on missing required fields', () => {
            const invalidParams = {
                eingangId: '123',
                heatingType: 'gas'
            };

            expect(() => validateCalculationParams(invalidParams)).toThrow();
        });

        it('should throw error on invalid numeric values', () => {
            const invalidParams = {
                eingangId: '123',
                heatingType: 'gas',
                newHeatingPlace: 'indoor',
                buildingType: 'house',
                constructionYear: 1700, // Too old
                heatedArea: 150
            };

            expect(() => validateCalculationParams(invalidParams)).toThrow();
        });
    });

    describe('validateAddressInput', () => {
        it('should validate correct address input', () => {
            expect(validateAddressInput('Test Street 123')).toBe(true);
        });

        it('should reject short address input', () => {
            expect(validateAddressInput('Ab')).toBe(false);
        });

        it('should handle empty input', () => {
            expect(validateAddressInput('')).toBe(false);
        });
    });

    describe('validateHouseInfo', () => {
        it('should validate complete house info', () => {
            const validHouseInfo = {
                dkodeE: 123,
                dkodeN: 456
            };
            expect(validateHouseInfo(validHouseInfo)).toBe(true);
        });

        it('should reject incomplete house info', () => {
            const invalidHouseInfo = {
                dkodeE: 123
            };
            expect(validateHouseInfo(invalidHouseInfo)).toBe(false);
        });
    });
});
