import { Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { User } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import { RowAction } from 'src/app/core/models/actions.model';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapitalizePipe } from 'src/app/core/pipes/capitalize.pipe';

type ShowRule = {
  id: string;        
  hide?: boolean;      
  value?: string[];
};
export interface ColumnDef<T = any> {
  key: string;
  label?: string;
  className?: string;
  width?: string;
  format?: (row: T, value: any) => any;
  show?: ShowRule[];
}



@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule,CommonModule, MatIconModule, MatTooltipModule, CapitalizePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() stickyActions: boolean = true;
  @Input() actions: RowAction[] = [];
  @Input() user: User = <User>{};
  @Input() data!: any;
  @Input() dataFilterColumns: any[] = [];
  @Output() onCheck = new EventEmitter<boolean>();
  @Output() action = new EventEmitter<{ id: string; row: any }>();

  selected: boolean = false;
  dataValues: any[] = [];
  constructor() {
    
  }

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value);
  }

  getValue(col: string): any {
  if (!col || this.data == null) return null;
    
  const value = col.split('.').reduce<any>((acc, k) => {
    if (acc == null) return undefined;

    if (typeof acc !== 'object') return undefined;
    return (acc as any)[k];
  }, this.data);

  return value ?? null;
}

isFiniteNumber(val: any): val is number {
  return typeof val === 'number' && isFinite(val);
}

  trackByCol = (_: number, col: ColumnDef) => col.key;
  trackByAction = (_: number, a: RowAction) => a.id;

  onAction(id: string) {
    this.action.emit({ id, row: this.data });
  }

  emitAction(a: RowAction) {
    this.action.emit({ id: a.id, row: this.data });
  }

  filter() {
  }

  private getByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
  }


  canShowActionForRow(actionId: string, data: any): boolean {
  for (const col of this.dataFilterColumns) {
    const rules = col.show?.filter((r: any) => r.id === actionId) ?? [];
    if (!rules.length) continue;

    const rawVal = this.getByPath(data, col.key);

    for (const rule of rules) {
      if (!('value' in rule)) {
        let hasValue = false;

        if (rawVal == null) {
          hasValue = false;
        } else if (Array.isArray(rawVal)) {
          hasValue = rawVal.length > 0;
        } else if (typeof rawVal === 'object') {
          hasValue = Object.keys(rawVal).length > 0;
        } else if (typeof rawVal === 'string') {
          hasValue = rawVal.trim().length > 0;
        } else {
          hasValue = Boolean(rawVal);
        }

        return hasValue;
      }

      const list = rule.value ?? [];

      if (Array.isArray(rawVal)) {
        if (rawVal.some(v => list.includes(v))) return false;
        continue;
      }

      if (list.includes(rawVal)) return false;

      const cellVal = String(rawVal ?? '');
      if (list.some((v: any) => typeof v === 'string') && list.includes(cellVal)) {
        return false;
      }
    }
  }

  return true;
}


  canShowActionForRow3(actionId: string, data: any): boolean {
    for (const col of this.dataFilterColumns) {
      const rules = col.show?.filter((r: any) => r.id === actionId) ?? [];
      if (!rules.length) continue;

      const rawVal = this.getByPath(data, col.key);

      for (const rule of rules) {

        if (!('value' in rule)) {
          let hasValue = false;

          if (rawVal == null) {
            hasValue = false;
          } else if (Array.isArray(rawVal)) {
            hasValue = rawVal.length > 0;
          } else if (typeof rawVal === 'object') {
            hasValue = Object.keys(rawVal).length > 0; 
          } else if (typeof rawVal === 'string') {
            hasValue = rawVal.trim().length > 0;
          } else {
            hasValue = Boolean(rawVal);
          }

          return hasValue; 
        }

        const cellVal = String(rawVal ?? '');
        const list = rule.value ?? [];

        if (list.includes(cellVal)) return false;
      }
    }
    return true;
  }

  canShowActionForRow2(actionId: string, data: any): boolean {
    for (const col of this.dataFilterColumns) {
      const rules = col.show?.filter((r: any) => r.id === actionId) ?? [];
      if (!rules.length) continue;
      const cellVal = String(this.getByPath(data, col.key) ?? '');
      for (const rule of rules) {
        const list = rule.value ?? [];
        if (list.includes(cellVal)) return false;
      }
    }
    return true;
  }

  formatPhone(v: unknown, country: 'MX' | 'US' = 'MX'): string {
    const digits = String(v ?? '').replace(/\D+/g, '');
    if (!digits) return '';

    if (country === 'MX') {
      const d = digits.endsWith('10') ? digits : digits.slice(-10);
      if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)} ${d.slice(6)}`;
    } else {
      const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
      if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
    }
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

}
