export function formatExchangeFile(file: string = '') {
  return file.replace(/[^a-z0-9]/gi, '_');
}
