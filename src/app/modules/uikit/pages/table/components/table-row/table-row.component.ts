import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { User } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import { RowAction } from 'src/app/core/models/actions.model';
import { MatIconModule } from '@angular/material/icon';

export interface ColumnDef<T = any> {
  key: string;
  label?: string;
  className?: string;
  width?: string;
  format?: (row: T, value: any) => any;
}

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule,CommonModule, MatIconModule],
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
  constructor() {}

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value);
  }

   getValue(col: string) {
    return col.split('.').reduce((acc, k) => acc?.[k], this.data) ?? '—';
  }

  trackByCol = (_: number, col: ColumnDef) => col.key;
  trackByAction = (_: number, a: RowAction) => a.id;

  onAction(id: string) {
    this.action.emit({ id, row: this.data });
  }

  emitAction(a: RowAction) {
    this.action.emit({ id: a.id, row: this.data });
  }
}
