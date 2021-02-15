import { Component, HostBinding, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Project } from './project';

const themeStorageKey = '_THEME';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;

  themeClass = '-light';

  @HostBinding('class') get classBinding() {
    return this.themeClass;
  }

  constructor(
    public project: Project,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.project
      .load()
      .pipe(
        finalize(() => this.loading = false),
      )
      .subscribe(
        () => {
        },
        err => {
          alert(`API error! The ngxe is still running?`);
          console.error(err);
        },
      );
    // load local settings
    const theme = localStorage.getItem(themeStorageKey);
    if (theme) {
      this.themeClass = theme;
    }
  }

  save() {
    this.project
      .save()
      .subscribe(res => {
        if (res) {
          alert(`Project saved.`);
        } else {
          alert('Save failed!');
        }
      }, err => {
        alert(`API error! The ngxe is still running?`);
        console.error(err);
      });
  }

  saveTheme(theme: string) {
    localStorage.setItem(themeStorageKey, theme);
  }
}
