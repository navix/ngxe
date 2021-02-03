import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { JsonFile } from '../../../../meta/formats';
import { TableRow, TableStats } from '../meta';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() table!: TableRow[];

  @Input() stats!: TableStats;

  @Input() currentTranslation!: JsonFile;

  @ViewChild('headForm', {static: true}) headForm!: NgForm;

  idFilter = '';

  typeFilter = '';

  emptyTargetFilter = false;

  filteredTable?: TableRow[];

  #destroy = new Subject();

  constructor() {
  }

  ngOnInit() {
    this.headForm.valueChanges
      ?.pipe(
        takeUntil(this.#destroy),
        debounceTime(250),
      )
      .subscribe(() => this.filterTable());
  }

  ngOnChanges() {
    this.filterTable();
  }

  ngOnDestroy() {
    this.#destroy.next();
    this.#destroy.complete();
  }

  private filterTable() {
    if (!this.table) {
      this.filteredTable = undefined;
      return;
    }
    this.filteredTable = this.table
      .filter(row => !this.idFilter || row.id.toLowerCase().indexOf(this.idFilter.toLowerCase()) !== -1)
      .filter(row => !this.typeFilter || row.type === this.typeFilter)
      .filter(row => !this.emptyTargetFilter || !this.currentTranslation.translations[row.id]);
  }

}
