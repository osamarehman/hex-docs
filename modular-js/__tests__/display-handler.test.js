import { displayCalculationResults, updateDhpDisplay } from '../display-handler';

describe('Display Handler Module', () => {
    let mockElement;
    
    beforeEach(() => {
        mockElement = {
            textContent: '',
            style: {
                display: ''
            }
        };
        
        global.document.getElementById = jest.fn((id) => mockElement);
    });

    describe('displayCalculationResults', () => {
        it('should update all display elements with calculation results', () => {
            const testData = {
                totalCosts: '10000',
                totalCostsWithoutSubvention: '12000',
                subventionFederal: '1000',
                subventionCanton: '500',
                subventionMunicipality: '500',
                subventionTotal: '2000',
                financingAmount: '8000',
                anzahlung: '2000',
                monthlyPayment: '150',
                monthlyInterest: '50'
            };

            displayCalculationResults(testData);

            expect(document.getElementById).toHaveBeenCalledWith('totalCosts');
            expect(document.getElementById).toHaveBeenCalledWith('subventionTotal');
            expect(mockElement.textContent).toBe(expect.any(String));
        });

        it('should handle missing data gracefully', () => {
            const incompleteData = {
                totalCosts: '10000'
            };

            expect(() => displayCalculationResults(incompleteData)).not.toThrow();
        });
    });

    describe('updateDhpDisplay', () => {
        it('should show DHP div when heating place is dhp', () => {
            const mockHeatingPlace = {
                value: 'dhp'
            };
            
            document.getElementById.mockImplementation((id) => {
                if (id === 'newHeatingPlace') return mockHeatingPlace;
                if (id === 'dhp') return mockElement;
                return null;
            });

            updateDhpDisplay();
            expect(mockElement.style.display).toBe('block');
        });

        it('should hide DHP div when heating place is not dhp', () => {
            const mockHeatingPlace = {
                value: 'other'
            };
            
            document.getElementById.mockImplementation((id) => {
                if (id === 'newHeatingPlace') return mockHeatingPlace;
                if (id === 'dhp') return mockElement;
                return null;
            });

            updateDhpDisplay();
            expect(mockElement.style.display).toBe('none');
        });
    });
});
