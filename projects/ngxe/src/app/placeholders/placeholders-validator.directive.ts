import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { extractPlaceholders } from './extract-placeholders';

@Directive({
  selector: '[appPlaceholders]',
  providers: [{provide: NG_VALIDATORS, useExisting: PlaceholdersValidatorDirective, multi: true}],
})
export class PlaceholdersValidatorDirective implements Validator {
  @Input() originalPlaceholders!: string[];

  constructor() {
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const placeholders = extractPlaceholders(control.value);
    const misses: string[] = [];
    for (const original of this.originalPlaceholders) {
      const ind = placeholders.indexOf(original);
      if (ind !== -1) {
        placeholders.splice(ind, 1);
      } else {
        misses.push(original);
      }
    }
    return {
      placeholders: misses.length > 0 ? misses : null,
    };
  }
}
