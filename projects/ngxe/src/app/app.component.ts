import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Project } from './project';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;

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
}
