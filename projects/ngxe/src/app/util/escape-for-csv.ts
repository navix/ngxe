export function escapeForCsv(input: string | undefined) {
  if (!input) {
    return '';
  }
  const v = input
    .replaceAll('\n', '\\n')
    .replaceAll('"', '""');
  return `"${v}"`;
}

export function removeEscapeForCsv(input: string | undefined) {
  if (!input) {
    return '';
  }
  return input
    .replaceAll('\\n', '\n')
    .replaceAll('""', '"');
}
