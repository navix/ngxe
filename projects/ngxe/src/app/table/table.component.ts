import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { JsonFile } from '../../../../meta/formats';
import { TableRow, TableStats } from '../meta';

const perPageStorageKey = '_PER_PAGE';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() table!: TableRow[];

  @Input() stats!: TableStats;

  @Input() currentTranslation!: JsonFile;

  @ViewChild('mainEl', {static: true}) mainEl!: ElementRef;

  @ViewChild('headForm', {static: true}) headForm!: NgForm;

  idFilter = '';

  typeFilter = '';

  prevFilter = '';

  currentFilter = '';

  targetFilter = '';

  emptyTargetFilter = false;

  filteredTable: TableRow[] = [];

  totalPages = 0;

  page = 1;

  perPage = 25;

  pageStartIndex = 0;

  pageEndIndex = 0;

  pageRows: TableRow[] = [];

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
    // load local settings
    const perPage = localStorage.getItem(perPageStorageKey);
    if (perPage) {
      this.perPage = +perPage;
    }
  }

  ngOnChanges() {
    this.filterTable();
  }

  ngOnDestroy() {
    this.#destroy.next();
    this.#destroy.complete();
  }

  pickPage(page: number) {
    this.page = page;
    if (!this.filteredTable) {
      this.pageRows = [];
      this.totalPages = 1;
      return;
    }
    this.totalPages = Math.ceil(this.filteredTable.length / this.perPage);
    if (this.perPage === 0) {
      this.pageRows = this.filteredTable;
      this.pageStartIndex = 1;
      this.pageEndIndex = this.pageRows.length;
    } else {
      this.pageStartIndex = (this.page - 1) * this.perPage;
      this.pageEndIndex = this.pageStartIndex + this.perPage;
      if (this.pageEndIndex > this.filteredTable.length) {
        this.pageEndIndex = this.filteredTable.length;
      }
      this.pageRows = this.filteredTable.slice(this.pageStartIndex, this.pageEndIndex);
    }
    this.mainEl.nativeElement.scroll({top: 0});
  }

  savePerPage(perPage: string) {
    this.perPage = +perPage;
    localStorage.setItem(perPageStorageKey, perPage);
  }

  private filterTable() {
    if (!this.table) {
      this.filteredTable = [];
      return;
    }
    const idFilter = this.idFilter.toLowerCase();
    const prevFilter = this.prevFilter.toLowerCase();
    const currentFilter = this.currentFilter.toLowerCase();
    const targetFilter = this.targetFilter.toLowerCase();

    this.filteredTable = this.table
      .filter(row => !this.idFilter || row.id.toLowerCase().indexOf(idFilter) !== -1)
      .filter(row => !this.prevFilter || (row.prev && row.prev.toLowerCase().indexOf(prevFilter) !== -1))
      .filter(row => !this.currentFilter || (row.current && row.current.toLowerCase().indexOf(currentFilter) !== -1))
      .filter(row => !this.targetFilter
        || (
          this.currentTranslation.translations[row.id]
          && this.currentTranslation.translations[row.id].toLowerCase().indexOf(targetFilter) !== -1
        ))
      .filter(row => !this.typeFilter || row.type === this.typeFilter)
      .filter(row => !this.emptyTargetFilter || !this.currentTranslation.translations[row.id]);

    this.pickPage(1);
  }
}
