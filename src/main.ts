import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Application entrypoint.
 *
 * Bootstraps the root `AppComponent` with the shared `appConfig`.
 */
// Bootstrap Angular with the root component and config; log any startup error.
bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
