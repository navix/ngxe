import { Component } from '@angular/core';
import { loadTranslations } from '@angular/localize';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title4 = $localize`:@@LOC_MGS_ID3:Localize msg`;

  title2 = $localize`:@@LOC_MGS_ID:Localize with ID`;
  title = $localize`Localize msg`;
  title5 = $localize`Localize msg`;

  title3 = $localize`:@@LOC_MGS_ID3:Localize msg`;

  title_with_ph = $localize`:@@CSV_EXPORT_TOO_MANY_LINES_TEXT:It is not supported to retrieve more than ${20}:maxLinesCount: lines. Please define some filters or redefine your search to retrieve all searched rows.`


  constructor() {
    this.loadT();
//    const lang = localStorage.getItem('lang');
//    if (lang) {
//      loadTranslations();
//    }
  }

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    location.reload();
  }

  clearLang() {
    localStorage.removeItem('lang');
  }

  private async loadT() {
  }
}
