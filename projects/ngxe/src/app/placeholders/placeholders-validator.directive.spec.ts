import { PlaceholdersValidatorDirective } from './placeholders-validator.directive';

describe('PlaceholdersValidatorDirective', () => {
  let directive: PlaceholdersValidatorDirective;

  beforeEach(() => {
    directive = new PlaceholdersValidatorDirective();
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should be valid without original and value placeholders', () => {
    directive.originalPlaceholders = [];
    const err = directive.validate({value: 'No placeholder text'} as any);
    expect(err).toEqual({placeholders: null});
  });

  it('should be valid without original placeholder', () => {
    directive.originalPlaceholders = [];
    const err = directive.validate({value: '{$PLACEHOLDER}'} as any);
    expect(err).toEqual({placeholders: null});
  });

  it('should be valid when placeholders are equal', () => {
    directive.originalPlaceholders = ['{$PLACEHOLDER}'];
    const err = directive.validate({value: '{$PLACEHOLDER}'} as any);
    expect(err).toEqual({placeholders: null});
  });

  it('should be invalid when placeholder are different', () => {
    directive.originalPlaceholders = ['{$PLACEHOLDER_ORIG}'];
    const err = directive.validate({value: '{$PLACEHOLDER_VAL}'} as any);
    expect(err).toEqual({placeholders: ['{$PLACEHOLDER_ORIG}']});
  });

  it('should be invalid when multiple placeholder are different', () => {
    directive.originalPlaceholders = ['{$PLACEHOLDER_1}', '{$PLACEHOLDER_2}', '{$PLACEHOLDER_3}', '{$PLACEHOLDER_4}'];
    const err = directive.validate({value: '{$PLACEHOLDER_1}, {$PLACEHOLDER_3}'} as any);
    expect(err).toEqual({placeholders: ['{$PLACEHOLDER_2}', '{$PLACEHOLDER_4}']});
  });

  it('should be invalid when similar placeholder in original have another count in content', () => {
    directive.originalPlaceholders = ['{$PLACEHOLDER_ORIG}', '{$PLACEHOLDER_ORIG}', '{$PLACEHOLDER_ORIG}'];
    const err = directive.validate({value: '{$PLACEHOLDER_ORIG}{$PLACEHOLDER_ORIG}'} as any);
    expect(err).toEqual({placeholders: ['{$PLACEHOLDER_ORIG}']});
  });

  it('should be invalid when multiple similar placeholder in original have another count in content', () => {
    directive.originalPlaceholders = ['{$PLACEHOLDER_ORIG}', '{$PLACEHOLDER_ORIG_2}', '{$PLACEHOLDER_ORIG}', '{$PLACEHOLDER_ORIG_2}', '{$PLACEHOLDER_ORIG_3}', '{$PLACEHOLDER_ORIG}'];
    const err = directive.validate({value: '{$PLACEHOLDER_ORIG}{$PLACEHOLDER_ORIG}{$PLACEHOLDER_ORIG_2}{$PLACEHOLDER_ORIG_3}'} as any);
    expect(err).toEqual({placeholders: ['{$PLACEHOLDER_ORIG_2}', '{$PLACEHOLDER_ORIG}']});
  });
});
