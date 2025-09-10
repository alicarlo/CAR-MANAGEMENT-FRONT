import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { User } from '../../model/user.model';
import { CommonModule } from '@angular/common';


export interface ColumnDef<T = any> {
  /** Propiedad a leer en el row. Soporta anidados: 'direccion.ciudad' */
  key: string;
  /** Etiqueta de header (por si la usas también en el thead) */
  label?: string;
  /** Clases opcionales para el <td> */
  className?: string;
  /** Ancho opcional */
  width?: string;
  /** Formateador opcional */
  format?: (row: T, value: any) => any;
}

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule,CommonModule],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {
  @Input() user: User = <User>{};
  @Input() data!: any;
  @Output() onCheck = new EventEmitter<boolean>();

  selected: boolean = false;
  dataValues: any[] = [];
  constructor() {

    setTimeout(() => {
      console.log('ali')
      // this.data.forEach(obj => delete obj.id);
      console.log(this.data);
      const { id, ...rest } = this.data; // extrae id y deja el resto   
      console.log(rest);
      this.dataValues = Object.values(rest);
    }, 2000);
  }

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value);
  }
}
