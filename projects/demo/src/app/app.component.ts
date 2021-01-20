import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = $localize`Localize msg`;

  title2 = $localize`:@@LOC_MGS_ID:Localize with ID`;
}
