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
    const changes = this
      .originalPlaceholders
      .filter(op => placeholders.indexOf(op) === -1);
    return {
      placeholders: changes.length > 0 ? changes : null,
    };
  }
}
