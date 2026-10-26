import { registerLocaleData } from "@angular/common";
import localeFrCh from "@angular/common/locales/fr-CH";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { mockApiInterceptor } from "./mock-api/mock-api.interceptor";

registerLocaleData(localeFrCh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors(environment.useMockApi ? [mockApiInterceptor] : []),
    ),
    { provide: LOCALE_ID, useValue: "fr-CH" },
  ],
};
