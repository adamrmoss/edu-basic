import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Application entrypoint.
 *
 * Bootstraps the root `AppComponent` with the shared `appConfig`.
 */
bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
