export interface RowAction {
  id: string;           
  icon: string;      
  label?: string;
  scope?: string | string[];
}
export interface RowActionEvent<T = any> {
  id: string;
  row: T;
}
