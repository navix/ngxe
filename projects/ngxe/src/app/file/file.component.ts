import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { FileHolderDirective } from './file-holder.directive';

@Component({
  selector: 'input[appFile]',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
})
export class FileComponent {
  @Output() select = new EventEmitter<any[]>();

  @Output() error = new EventEmitter<string>();

  constructor(
    private elementRef: ElementRef,
    private holder: FileHolderDirective,
  ) {
    this.holder.file = this;
  }

  @HostListener('change', ['$event']) changeHandler(event: any) {
    if (event && event.target) {
      forkJoin(Array.from(event.target.files as FileList).map(f => this.loadFile(f)))
        .subscribe(files => {
          this.select.emit(files);
        }, error => {
          this.error.next(error);
        });
    }
  }

  emitClick() {
    this.elementRef.nativeElement.click();
  }

  reset() {
    this.elementRef.nativeElement.value = '';
  }

  private loadFile(file: File): Observable<any> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next({
          file,
          data: e.target.result,
        });
        observer.complete();
      };
      reader.onerror = () => {
        observer.error('Read data error');
      };
      reader.readAsText(file);
    });
  }
}
