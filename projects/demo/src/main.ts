import { enableProdMode } from '@angular/core';
import { loadTranslations } from '@angular/localize';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

loadT()
  .then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule);
  })
  .catch(err => console.error(err));

async function loadT() {
  const m = await import('../../../messages.uk.json');
  loadTranslations(m.translations);
}
