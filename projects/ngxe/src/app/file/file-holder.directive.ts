import { Directive, HostListener } from '@angular/core';
import { FileComponent } from './file.component';

@Directive({
  selector: '[appFileHolder]',
})
export class FileHolderDirective {
  file?: FileComponent;

  constructor() {
  }

  @HostListener('click', ['$event']) clickHandler(event: any) {
    if (this.file) {
      this.file.emitClick();
    }
  }

}
