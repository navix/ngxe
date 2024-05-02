import {Component, HostBinding, inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { saveAs } from 'file-saver';
import {EMPTY} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {formatExchangeFile} from '../../../meta/format-exchange-file';
import { environment } from '../environments/environment';
import {ExchangeService} from './exchange.service';
import { Project } from './project';

const themeStorageKey = '_THEME';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  exchange = inject(ExchangeService);
  route = inject(ActivatedRoute);

  backendless = environment.backendless;

  loading = false;

  themeClass = '-light';

  constructor(
    public project: Project,
  ) {
    // load local settings
    const theme = localStorage.getItem(themeStorageKey);
    if (theme) {
      this.themeClass = theme;
    }
  }

  ngOnInit() {
    const {exp, exb} = this.route.snapshot.queryParams;
    if (exp && exb) {
      this.loadFromExchange(exp, exb, true);
      return;
    }

    if (!this.backendless) {
      this.loadFromBackend();
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
      this.project.mergeImport(JSON.parse(files[0].data));
    } catch (e: any) {
      alert('Error: ' + e.error);
    }
  }

  loadFromFile(files: any[]) {
    try {
      this.project.loadFromFile(JSON.parse(files[0].data));
    } catch (e: any) {
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

  saveToExchange() {
    this.exchange
      .saveProject({
        project: this.project.data!.config.name,
        branch: this.project.data!.branch || '',
        body: this.project.data,
      })
      .pipe(
        catchError(err => {
          alert(`Exchange API error!`);
          console.error(err);
          return EMPTY;
        }),
      )
      .subscribe(res => {
        if (res) {
          alert(`Project saved. Sharing URL: https://ngxe.oleksanovyk.com/?exp=${formatExchangeFile(this.project.data!.config.name)}&exb=${formatExchangeFile(this.project.data!.branch)}`);
        } else {
          alert('Save failed!');
        }
      });
  }

  loadFromExchange(project?: string, branch?: string, force = false) {
    if (!force && !confirm('Current unsaved changes will be lost. Continue?')) {
      return;
    }
    this.loading = true;
    this.exchange
      .loadProject({
        project: project || this.project.data!.config.name,
        branch: branch || this.project.data!.branch || '',
      })
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          alert(`Exchange API error!`);
          console.error(err);
          return EMPTY;
        }),
      )
      .subscribe(res => {
        if (res.success) {
          this.project.fullImport(res)
        } else {
          alert(`Exchange API error!`);
        }
      });
  }
}
