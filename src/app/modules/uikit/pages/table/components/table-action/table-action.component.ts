import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableFilterService } from '../../services/table-filter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-action',
  imports: [AngularSvgIconModule, CommonModule, FormsModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableActionComponent {
  search: string = '';
  constructor(public filterService: TableFilterService) {}

  clearSearch() {
    this.search = '';
    this.filterService.searchField.set('');  
  }
  
  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.search = input.value;
    this.filterService.searchField.set(input.value);
  }

  onStatusChange(value: Event) {
    const selectElement = value.target as HTMLSelectElement;
    this.filterService.statusField.set(selectElement.value);
  }

  onOrderChange(value: Event) {
    const selectElement = value.target as HTMLSelectElement;
    this.filterService.orderField.set(selectElement.value);
  }
}
