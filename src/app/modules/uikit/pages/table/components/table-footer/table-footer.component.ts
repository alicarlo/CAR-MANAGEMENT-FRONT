import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-table-footer',
  imports: [AngularSvgIconModule, CommonModule, FormsModule],
  templateUrl: './table-footer.component.html',
  styleUrl: './table-footer.component.css',
})
export class TableFooterComponent {
  pageSize: number = 10;
  @Input() hasNext: boolean = false;
  @Input() hasPrev: boolean = true;
  @Input() total: number = 0;
  @Input() totalPages: number = 0;

  _activateSearch: boolean = true;
  @Input() set activateSearch(v: boolean) {
    this._activateSearch = v ?? true;
    this.cdr.markForCheck();  
  }

  pagesArray: any[] = []; 
  @Input() set pages(v: any[]) {
    this.pagesArray = v ?? [];
    this.cdr.markForCheck();  
  }

  anchorsNextArray: any[] = [];
  @Input() set anchorsNext(v: any[]) {
    this.anchorsNextArray = v ?? [];
    this.cdr.markForCheck();     
  }

  currentPageSelect: number = 1;
  @Input() set currentPage(v: any) {
    this.currentPageSelect = v ?? 1;
    this.cdr.markForCheck();  
  }

  @Output() pageSizeSelectChild = new EventEmitter<{}>();
  @Output() changePageNextPrevChild = new EventEmitter<{}>();
  @Output() currentPageChild = new EventEmitter<{}>();


  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 
  get showItems() {
    return this.pageSize * this.currentPageSelect;
  }

  @Output() changePageChild = new EventEmitter<{}>();
  trackByPage = (_: number, p: number) => p;

  constructor(private cdr: ChangeDetectorRef) {}

  onPageSizeChange(value: number) {
    this.pageSizeSelectChild.emit(value);
  }

  goToPage(page: number) {
    this.currentPageSelect = page;
    this.currentPageChild.emit(page);
  }

  // Next | prev
  changePageNextPrev(action: string) {
    this.changePageNextPrevChild.emit(action);
  }
}
