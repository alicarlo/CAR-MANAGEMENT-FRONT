import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, effect, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { dummyData } from 'src/app/shared/dummy/user.dummy';
import { TableActionComponent } from './components/table-action/table-action.component';
import { TableFooterComponent } from './components/table-footer/table-footer.component';
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { TableRowComponent } from './components/table-row/table-row.component';
import { User } from './model/user.model';
import { TableFilterService } from './services/table-filter.service';
import { CommonModule } from '@angular/common';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-table',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableHeaderComponent,
    TableFooterComponent,
    TableRowComponent,
    TableActionComponent,
    LoadingComponent,
    CommonModule
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {  
  flag : boolean = false;
  @Input() actions: RowAction[] = [];
  @Output() action = new EventEmitter<RowActionEvent>();
  @Input() hasNext: boolean = false;
  @Input() hasPrev: boolean = false;
  @Input() total: number = 0;
  @Input() pages: any
  @Input() totalPages: number = 0;

  @Input() loading: boolean = false;
  @Input() error: boolean = false;
  @Input() headers!: any[];

  private _data: any[] = [];
  @Input() set data(v: any[]) {
    this._data = v ?? [];
    this.cdr.markForCheck(); 
    this.dataSignal.set(this._data);
  }
  get data() { return this._data; }

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

  @Input() dataFilterColumns: string[] = []; 
  @Output() pageSizeSelectReturn = new EventEmitter<{}>();
  @Output() currentPageReturn = new EventEmitter<{}>();
  @Output() changePageNextPrevReturn = new EventEmitter<{}>();
  @Output() searchData = new EventEmitter<string>(true);
  
  private first = true;
  private last = '__init__';
  activateSearch: boolean = true;
  dataSignal = signal<any[]>([]);
  constructor(private http: HttpClient, private filterService: TableFilterService, private cdr: ChangeDetectorRef) {}

  // Emiter checkbox in table header
  public toggleUsers(checked: boolean) {
    this.dataSignal.update((users) => {
      return users.map((user) => {
        return { ...user, selected: checked };
      });
    });
  }

  searchEffect = effect(() => {
    const s = this.filterService.searchField().trim().toLowerCase();
    if (this.first) { this.first = false; return; }

    if (s === this.last) return;
    this.last = s;
    // this.activateSearch = s.length > 0 ? false : true;
    this.searchData.emit(s);
  });

  filteredData = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    const status = this.filterService.statusField();
    const order = this.filterService.orderField();
    return this.dataSignal()
  });


  async pageSizeSelect(event: any) {
    this.pageSizeSelectReturn.emit(event);
  }

  async currentPageTable(event: any) {
    this.currentPageReturn.emit(event);
  }
    

  async changePageNextPrev(event: any) {
    this.changePageNextPrevReturn.emit(event);
  }

  onRowAction(e: RowActionEvent) {
    this.action.emit(e); 
  }
}