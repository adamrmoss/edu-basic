import { appConfig } from '../src/app/app.config';

describe('appConfig', () => {
    it('should export ApplicationConfig with providers', () => {
        expect(appConfig).toBeTruthy();
        expect(Array.isArray(appConfig.providers)).toBe(true);
        expect(appConfig.providers.length).toBeGreaterThan(0);
    });
});
