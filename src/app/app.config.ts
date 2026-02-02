import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

/**
 * Root Angular application configuration.
 */
export const appConfig: ApplicationConfig = {
    providers: [ provideZoneChangeDetection({ eventCoalescing: true }) ]
};
