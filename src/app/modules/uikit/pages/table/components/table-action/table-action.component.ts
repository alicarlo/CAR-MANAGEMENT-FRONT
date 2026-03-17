import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TableFilterService } from '../../services/table-filter.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-action',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './table-action.component.html',
  styleUrl: './table-action.component.css',
})
export class TableActionComponent {
  search: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'auto' = 'md';
  @Input() searchable: boolean = false;
  @Input() labelName: string = '';
  @Input() select: boolean = false;
  @Input() selectValue: string = '';
  @Input() selectPlaceholder: string = 'Seleccionar';
  @Input() selectId: string = '';
  
  _selectData: any[] = []; 
  @Input() set selectData(v: any[]) {
    this._selectData = v ?? [];
    this.filteredData = [...this._selectData]
    this.cdr.markForCheck();  
  }

  @Input() set selectValueDefault(v: string | number | boolean | null) {
    this.currentSelect = !v ? '' : v;
    this.cdr.markForCheck();
  }

  currentSelect: string | number | boolean | null = null;
  @Output() selectOption = new EventEmitter<{}>();

  filterControl = new FormControl('');
  filteredData: any[] = [];
  dropdownOpen = false;
  currentSelectLabel: string = '';
  constructor(public filterService: TableFilterService, private cdr: ChangeDetectorRef) {}

  get triggerClasses() {
    switch (this.size) {
      case 'sm': return 'h-[34px] text-[11px]';
      case 'lg': return 'h-[34px] text-[11px]';
      case 'auto': return 'h-[34px] text-[11px]';
      default: return 'h-[34px] text-[11px]';
    }
  }

  get optionClasses() {
    switch (this.size) {
      case 'sm': return 'px-3 py-1.5 text-[11px]';
      case 'lg': return 'px-3 py-2.5 text-[11px]';
      default: return 'px-3 py-2 text-[11px]';
    }
  }

  ngOnInit() {
    this.filterControl.valueChanges.subscribe((value) => {
      const val = (value || '').toLowerCase();
      this.filteredData = this._selectData.filter((item) =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(val)
      );
    });  
  }

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

  onSelectChange(value: any) {    
    const send = this._selectData.find(e => e[this.selectId] === value); 
    this.selectOption.emit(send);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.filterControl.setValue('');
      this.filteredData = [...this._selectData];
    }
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  selectOptionClick(item: any) {
    this.currentSelect = item[this.selectId];
    this.currentSelectLabel = item[this.selectValue];
    this.selectOption.emit(item);
    this.closeDropdown();
  }
}
