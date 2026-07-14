import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { TypeExpense } from 'src/app/core/models/typeExpense.model';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { PaymentsAddModalComponent } from '../../modals/payments-add-modal/payments-add-modal.component';
import { ArrivalreviewService } from 'src/app/core/services/arrivalReview/arrivalreview.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { LayawayShowModalComponent } from '../../modals/layaway-show-modal/layaway-show-modal.component';
import { SalesModalComponent } from '../../modals/sales-modal/sales-modal.component';
import { SalesService } from 'src/app/core/services/sales/sales.service';
import moment from 'moment';
import { TicketPrintModalComponent } from '../../modals/ticket-print-modal/ticket-print-modal.component';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';
import { StoreService } from 'src/app/core/services/store/store.service';

@Component({
  selector: 'app-sales',
  imports: [TableComponent, MatDialogModule, CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {
  sales: any[] = [];
  store: any[] = [];
  filteredStore: any[] = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';
  store_id: any = null;

  clientNameFilterControl = new FormControl('');
  clientPhoneFilterControl = new FormControl('');
  clientRfcFilterControl = new FormControl('');
  keyFilterControl = new FormControl('');
  makeFilterControl = new FormControl('');
  modelFilterControl = new FormControl('');
  versionFilterControl = new FormControl('');
  colorFilterControl = new FormControl('');
  date_from: string = '';
  date_to: string = '';
  filterSelects: any = {};
  laywaySelected: TypeExpense | undefined;
  salesHeader: string[] = ['Asesor','Cliente', 'Auto','Fecha de entrega', 'Hora de entrega', 'Precio de venta'];
  columns: any = [

    { key: 'advisor', type: 'text' },
    { key: 'clientName', type: 'text' },
    { key: 'carData', type: 'text' },
    { key: 'date_delivery_aux', type: 'dob' },
    { key: 'hour_delivery_aux', type: 'text' },
    { key: 'amount_sale', type: 'money' },
    { key: 'salesTypeStatus1', type: '',
      show: [
        { id: 'ticketContado', value: [2] },
      ] 
     },
     { key: 'salesTypeStatus2', type: '',
      show: [
        { id: 'ticketCredito', value: [2] },
      ] 
     },
    
  ]
  readonly actions: RowAction[] = [
    { icon: 'delete', id: 'delete', label: 'Eliminar venta', scope: 'SALE.DELETE' },
    // { icon: 'file_copy', id: 'contract', label: 'Descargar contrato' },
    // { icon: 'print', id: 'print', label: 'Imprimir ticket' },
    { icon: 'receipt_long', id: 'saleTicket', label: 'Descargar ticket', scope: 'SALE.GET' },
    { icon: 'description',  id: 'ticketContado',  label: 'Contrato de venta a contado', scope: 'SALE.GET' },
    { icon: 'file_copy',  id: 'ticketCredito',  label: 'Contrato de venta a credito', scope: 'SALE.GET' },
  ];
  items: any[] = [];
  nextCursor: { name: string; idDocStudent: string } | null | undefined = null;
  prevCursor: { name: string; idDocStudent: string } | null = null;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  currentPage = 1;

  loading: boolean = true;
  error: boolean = false;
  hasNext: boolean = false
  hasPrev: boolean = false;

  anchorsNext: Array<any | undefined> = []; 
  anchorsPrev: Array<any | undefined> = []; 

  private query$ = new Subject<string>();

  pages: number = 0;
  constructor(
    private _MatDialog: MatDialog,
    private _ToastrService: ToastrService,
    private _SalesService : SalesService,
    private _StoreService: StoreService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.getStore();
    this.getSale();

    this.storeFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredStore = this.store.filter((data: any) =>
        `${data.name}`.toLowerCase().includes(value)
      );
    });
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    // if (e.id === 'contract') this.actionModal(e.id,e.row, 'Desea descargar el contrato?', '!text-blue-500', 'description');
    if (e.id === 'saleTicket')  this.openTicketModal(e.id,e.row,6);
    if (e.id === 'ticketContado')  this.openTicketModal(e.id,e.row,3);
    if (e.id === 'ticketCredito')  this.openTicketModal(e.id,e.row,4);
  }

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(LayawayShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSale();
      }
    });
  }

  openAddModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 1};
    const dialogRef = this._MatDialog.open(PaymentsAddModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSale();
      }
    });
  }

  actionModal(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {
    let dataSend = {action, row: data, msg, color, icon};
    const ref: any = this._MatDialog.open(ActionMessageComponent, {
      data: dataSend,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-40'],
      width: '40vw',
      height: '40vh',
      maxWidth: '40vw'
    });

    ref.componentInstance.accept.subscribe(async () => {
      ref.componentInstance.loading = true;
      try {
        if (action === 'delete') {
          await this.deleteSale(data.id);
        }

        if (action === 'contract') {
          await this.contractSale(data.id);
        }
        
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getSale();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async deleteSale(id: string) {
    return new Promise((resolve, reject) => {
      this._SalesService.deleteSale(id).subscribe({
      next: async (response: any) => {
        if(response) {
          this._ToastrService.success('Eliminado con exito', 'Exito');
          resolve(true);
        }
      },
      error: (err) => {
        reject(err);
        // this._ToastrService.error(err.error, 'Error');
      },
    })
    })
  }

  async searchData(event: any) {
    if (!event) {

      return;
    }

    if (event.length < 3) return;
    this.query$.next((event));
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? ++this.currentPage : --this.currentPage;
    this.getSale();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getSale();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getSale();
  }

  getStore() {
    this._StoreService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStore = [...this.store];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  toggleStoreDropdown() {
    this.storeDropdownOpen = !this.storeDropdownOpen;
    if (this.storeDropdownOpen) {
      this.storeFilterControl.setValue('');
      this.filteredStore = [...this.store];
    }
  }

  closeStoreDropdown() {
    this.storeDropdownOpen = false;
  }

  selectStore(data: any) {
    this.selectedStoreLabel = data !== null ? `${data.name}` : 'Todos';
    this.store_id = data !== null ? data.id : '';
    this.closeStoreDropdown();
  }

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  filterGo() {
    const carFilter = Object.fromEntries(
      Object.entries({
        store_id: this.store_id,
        key: this.keyFilterControl.value,
        make: this.makeFilterControl.value,
        model: this.modelFilterControl.value,
        version: this.versionFilterControl.value,
        color: this.colorFilterControl.value,
      }).filter(([_, v]) => v != null && v !== '')
    );

    const clientFilter = Object.fromEntries(
      Object.entries({
        full_name: this.clientNameFilterControl.value,
        phone: this.clientPhoneFilterControl.value,
        rfc: this.clientRfcFilterControl.value,
      }).filter(([_, v]) => v != null && v !== '')
    );

    this.filterSelects = Object.fromEntries(
      Object.entries({
        car: Object.keys(carFilter).length ? carFilter : null,
        client: Object.keys(clientFilter).length ? clientFilter : null,
      }).filter(([_, v]) => v != null)
    );

    this.currentPage = 1;
    this.getSale();
  }

  clearFilters() {
    this.store_id = null;
    this.selectedStoreLabel = '';
    this.clientNameFilterControl.setValue('');
    this.clientPhoneFilterControl.setValue('');
    this.clientRfcFilterControl.setValue('');
    this.keyFilterControl.setValue('');
    this.makeFilterControl.setValue('');
    this.modelFilterControl.setValue('');
    this.versionFilterControl.setValue('');
    this.colorFilterControl.setValue('');
    this.date_from = '';
    this.date_to = '';
    this.filterSelects = {};
    this.currentPage = 1;
    this.getSale();
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(SalesModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-90'],
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSale();
      }
    });
  }

  getSale() {
    this.loading = false;
    this._SalesService.getSalesFiltered(this.pageSize, this.currentPage, this.filterSelects, this.date_from, this.date_to).subscribe({
      next: async (response: any) => {
        if(response) {
          
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.sales = response.items.map((r: any) => ({ 
            advisor: r.user.full_name,
            key: r.car.key,
            clientName: r.client.full_name,
            date_delivery_aux: moment(r.date_delivery).format('YYYY-MM-DD'),
            hour_delivery_aux: moment(r.hour_delivery).format('HH:mm A'),
            carData:  r.car  ?  `${r.car.key} ${r.car.make } ${r.car.version} ${r.car.model } ${r.car.color }` : '-',
            salesTypeStatus1: r.sales_type === 'contado' ? 1 : 2,
            salesTypeStatus2: r.sales_type === 'credito' ? 1 : 2,
            ...r
          }));
          
 
          this.total = response.pagination.total_items;

          setTimeout(() => {
            this.loading = true;  
          },400)
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  async contractSale(id: string) {
    return new Promise((resolve, reject) => {
      this._SalesService.getContractSale(id).subscribe({
        next: (response: any) => {
          if(response) {
            this.downloadFile(response);
            resolve(true);
          }
        },
        error: (err) => {
          reject(err);
          // this._ToastrService.error(err.error, 'Error');
        },
      })
    })
  }

  async downloadFile(url: string, filename?: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  openTicketModal(action: string, data: any, flag: number) {
      let dataSend = {data, full: data, flag};
      const dialogRef = this._MatDialog.open(TicketPrintModalComponent, {
        disableClose: true,
        data: dataSend,
        /// panelClass: ['custom-dialog-container', 'dialog-ticket'],
        panelClass: ['custom-dialog-container'],
        width: '100vw',
        height: '75vh',
        maxWidth: '100vw'
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.getIncomes();
        }
      });
    }
      
}
