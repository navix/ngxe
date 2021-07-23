import { extractPlaceholders } from './extract-placeholders';

describe('extractPlaceholders', () => {
  it('should extract one placeholder', () => {
    const res = extractPlaceholders('{$PLACEHOLDER}');
    expect(res).toEqual(['{$PLACEHOLDER}']);
  });

  it('should extract one placeholder surrounded with text', () => {
    const res = extractPlaceholders('Prev text {$PLACEHOLDER}after text');
    expect(res).toEqual(['{$PLACEHOLDER}']);
  });

  it('should extract multiple placeholders', () => {
    const res = extractPlaceholders('{$PLACEHOLDER1}{$PLACEHOLDER2}');
    expect(res).toEqual(['{$PLACEHOLDER1}', '{$PLACEHOLDER2}']);
  });

  it('should extract multiple placeholders surrounded with text', () => {
    const res = extractPlaceholders('Prev text {$PLACEHOLDER1} middle text{$PLACEHOLDER2}after text');
    expect(res).toEqual(['{$PLACEHOLDER1}', '{$PLACEHOLDER2}']);
  });
});
