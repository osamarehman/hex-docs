import { fetchDataGet, fetchDataPost, API_ENDPOINTS } from '../api';

describe('API Module', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('fetchDataGet', () => {
        it('should successfully fetch data', async () => {
            const mockData = { test: 'data' };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const result = await fetchDataGet('test-url');
            expect(result).toEqual(mockData);
        });

        it('should throw error on failed request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(fetchDataGet('test-url')).rejects.toThrow('HTTP error, status = 404');
        });
    });

    describe('API_ENDPOINTS', () => {
        it('should have all required endpoints', () => {
            expect(API_ENDPOINTS).toHaveProperty('possibleAddress');
            expect(API_ENDPOINTS).toHaveProperty('houseInfo');
            expect(API_ENDPOINTS).toHaveProperty('calculation');
        });
    });
});
