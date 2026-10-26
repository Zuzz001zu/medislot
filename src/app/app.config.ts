import { registerLocaleData } from "@angular/common";
import localeFrCh from "@angular/common/locales/fr-CH";
import { provideHttpClient, withFetch } from "@angular/common/http";
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";

registerLocaleData(localeFrCh);
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: "fr-CH" },
  ],
};
