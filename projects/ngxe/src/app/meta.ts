export type TableRowType = 'same' | 'new' | 'changed' | 'deleted';

export interface TableRow {
  id: string;
  type: TableRowType;
  prev: string;
  current: string;
  target: string;
  suggestions: string[];
  placeholders: string[];
}

export interface TableStats {
  total?: number;
  new?: number;
  changed?: number;
  deleted?: number;
  emptyTarget?: number;
}
