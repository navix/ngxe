import { Component, HostBinding, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { finalize } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Project } from './project';

const themeStorageKey = '_THEME';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  backendless = environment.backendless;

  loading = false;

  themeClass = '-light';

  constructor(
    public project: Project,
  ) {
  }

  ngOnInit() {
    if (!this.backendless) {
      this.loadFromBackend();
    }
    // load local settings
    const theme = localStorage.getItem(themeStorageKey);
    if (theme) {
      this.themeClass = theme;
    }
  }

  @HostBinding('class') get classBinding() {
    return this.themeClass;
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

  export() {
    const dataJson = JSON.stringify(this.project.data);
    const blob = new Blob([dataJson], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, `${this.project.data?.config.name}.ngxe-project.json`);
  }

  async import(files: any[]) {
    try {
      this.project.import(JSON.parse(files[0].data));
    } catch (e) {
      alert('Error: ' + e.error);
    }
  }

  loadFromFile(files: any[]) {
    try {
      this.project.loadFromFile(JSON.parse(files[0].data));
    } catch (e) {
      alert('Error: ' + e.error);
    }
  }

  exportCsv() {
    const blob = new Blob([this.project.getCsvFromTable()], {
      type: 'text/csv;charset=utf-8',
    });
    saveAs(blob, `${this.project.data!.config.name}_${this.project.currentTranslation!.locale}.csv`);
  }

  importCsv(files: any[]) {
    try {
      const changed = this.project.importFromCsv(files[0].data);
      alert(`Import completed. Changed ${changed} rows.`);
    } catch (e) {
      alert('Error: ' + e.error);
    }
  }

  private loadFromBackend() {
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
  }
}
