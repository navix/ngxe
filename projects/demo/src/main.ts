import { enableProdMode, LOCALE_ID, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: [
      {
        provide: TRANSLATIONS,
        useFactory: (locale: string) => {
          console.log('TRAN FAC', locale);
          if (locale === 'uk-UA') {
            const xlf = `
            <xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="en-US" trgLang="uk-UA">
  <file id="ngi18n">
    <unit id="7775616172860357796">
      <segment>
        <source>Localize msg</source>
        <target>undefined</target>
        <note>projects/demo/src/app/app.component.ts:9</note>
      </segment>
    </unit>
    <unit id="LOC_MGS_ID">
      <segment>
        <source>Localize with ID</source>
        <target>undefined</target>
        <note>projects/demo/src/app/app.component.ts:11</note>
      </segment>
    </unit>
    <unit id="7550278962652999906">
      <segment>
        <source>Text sample</source>
        <target>kokoko</target>
        <note>projects/demo/src/app/app.component.html:2</note>
      </segment>
    </unit>
    <unit id="9029508364748807640">
      <segment>
        <source>Text with double</source>
        <target>undefined</target>
        <note>projects/demo/src/app/app.component.html:4</note>
      </segment>
    </unit>
    <unit id="MSG_ID">
      <segment>
        <source>Text sample with ID</source>
        <target>undefined</target>
        <note>projects/demo/src/app/app.component.html:5</note>
      </segment>
    </unit>
  </file>
</xliff>            `;
            console.log('REQV', xlf);
            return xlf;
          }
          return '';
        },
        deps: [LOCALE_ID],
      },
      {
        provide: LOCALE_ID,
        useFactory: () => {
          const lang = localStorage.getItem('lang');
          console.log('USE FAC', lang);
          return lang || 'en-US';
        },
      },
      {
        provide: TRANSLATIONS_FORMAT,
        useValue: 'xlf',
      },
    ],
  })
  .catch(err => console.error(err));
