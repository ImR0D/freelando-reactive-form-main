import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeftBold,
  phosphorArrowRightBold,
  phosphorPlusCircleBold,
  phosphorTrashBold,
} from '@ng-icons/phosphor-icons/bold';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideIcons({
      phosphorPlusCircleBold,
      phosphorTrashBold,
      phosphorArrowLeftBold,
      phosphorArrowRightBold,
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
