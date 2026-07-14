import { Component } from '@angular/core';
import { Cars } from 'src/app/core/models/cars.model';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { Subject } from 'rxjs';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ToastrService } from 'ngx-toastr';
import { CarsModalComponent } from '../../modals/cars-modal/cars-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { CarBillsShowModalComponent } from '../../modals/car-bills-show-modal/car-bills-show-modal.component';
import { CarDocumentsShowModalComponent } from '../../modals/car-documents-show-modal/car-documents-show-modal.component';
import { ArriveCheckCarModalComponent } from '../../modals/arrive-check-car-modal/arrive-check-car-modal.component';
import { HistoryIncomeModalComponent } from '../../modals/history-income-modal/history-income-modal.component';
import { ArrivalReviewModalComponent } from '../../modals/arrival-review-modal/arrival-review-modal.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from 'src/app/core/services/store/store.service';
import { CommonModule, NgClass } from '@angular/common';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';

@Component({
  selector: 'app-cars',
  imports: [TableComponent, MatDialogModule, FormsModule, ReactiveFormsModule, CommonModule, NgClass, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {

  store: any = [];
  store_id: any = null;
  filteredStore: any = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';

  investor: any = [];
  investor_id: any = null;
  filteredInvestor: any = [];
  investorFilterControl = new FormControl('');
  investorDropdownOpen = false;
  selectedInvestorLabel = '';

  keyFilterControl = new FormControl('');
  makeFilterControl = new FormControl('');
  modelFilterControl = new FormControl('');
  colorFilterControl = new FormControl('');
  versionFilterControl = new FormControl('');

  searchable: boolean = false;
  carsSelected: any;
  cars: Cars[] = [];
  carsHeader: string[] = [
    'Clave',
    /*'Tipo de auto'*/'Sucursal', /*'Marca',
    'Modelo','Linea', 'Color',*/'Auto', /*'# Serie', 
    'Kilometraje', 'Cilindros', '# de motor', */
    'Fecha de llegada' ,'Precio de venta', 'Costo' ,/*'Enganche' ,*/
    'Estatus',/* 'Tipo de adquisicion','Accesorios y Varios', 
    'Comentarios', 'Comentarios Carroceria', 'Comentarios Llantas',
    'Comentarios Pintura', 'Comentarios Otros',
    */
  ];

  columns: any = [
    { key: 'key', type: 'text' },
    // { key: 'car_type.name', type: 'text' },
    { key: 'store.name', type: 'text' },
    { key: 'carData', type: 'text' },
    // { key: 'make', type: 'text' },
    // { key: 'model', type: 'text' },
    // { key: 'version', type: 'text' },
    // { key: 'color', type: 'text' },
    // { key: 'vin', type: 'text' },
    // { key: 'km', type: 'comas' },
    // { key: 'cylinders', type: 'text' },
    // { key: 'engine_number', type: 'text' },
    { key: 'arrived_at', type: 'dob' },
    { key: 'sale_price', type: 'money' },
    { key: 'costShow', type: 'money' },
    // { key: 'sale_price', type: 'money' },
    // { key: 'down_payment', type: 'money' },
    { key: 'status', type: 'translate-text' },
    /*{ key: 'car_acquisition', type: 'text' , show: [
        { id: 'delete', value: ['compras'] },
      ] 
    },
    { key: 'checks', type: 'checks' },

    { key: 'comments.generales', type: 'area' },
    { key: 'comments.carroceria', type: 'area' },
    { key: 'comments.llantas', type: 'area' },
    { key: 'comments.pintura', type: 'area' },
    { key: 'comments.otros', type: 'area' },
    { key: 'arrive', type: '',
      show: [
        { id: 'checkArrive' }
      ] 
     }
      */

  ]

  readonly actions: RowAction[] = [
    { icon: 'history',  id: 'history',  label: 'Historial', scope: 'CAR_HISTORY.GET' },
    { icon: 'check',  id: 'checkArrive',  label: 'Revision de llegada', scope: ['ARRIVAL.ADD', 'ARRIVAL.UPDATE', 'ARRIVAL.GET'] },
    { icon: 'attach_money',  id: 'bill',  label: 'Visualizar Gastos', scope: ['BILL.CAR.GET', 'BILL.GET'] },
    { icon: 'attach_file',  id: 'documents',  label: 'Visualizar Documentos', scope: ['CAR.DOCUMENT.GET', 'DOCUMENTS.GET'] },
    { icon: 'edit',  id: 'edit',  label: 'Editar', scope: 'CAR.UPDATE' },
    { icon: 'delete', id: 'delete', label: 'Eliminar', scope: 'CAR.DELETE' },
  ];
  items: any[] = [];
  nextCursor: { name: string; idDocStudent: string } | null | undefined = null;
  prevCursor: { name: string; idDocStudent: string } | null = null;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  currentPage = 1;

  loading: boolean = false;
  error: boolean = false;
  hasNext: boolean = false
  hasPrev: boolean = false;

  anchorsNext: Array<any | undefined> = []; 
  anchorsPrev: Array<any | undefined> = [];

  private query$ = new Subject<string>();

  pages: number = 0;
  filter: string = '';
  filterSelects: any = {};
  constructor(
    private _MatDialog: MatDialog,
    private _CarsService: CarsService,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService,
    private _InvestorService: InvestorService,
    private _PermissionsService: PermissionsService
  ) {}

  get canCreateCar() {
    return this._PermissionsService.hasScopes(['CAR.ADD']);
  }

  ngOnInit() {
    this.getCars();
    this.getStore();
    this.getInvestor();

    this.storeFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredStore = this.store.filter((data: any) => {
        const text = `${data.name}`.toLowerCase();
        return text.includes(value);
      });
    });
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'history') this.openHistoryIncomeModal(e.id,e.row);
    if (e.id === 'checkArrive')  this.openChecksModal(e.id,e.row);
    if (e.id === 'bill')  this.openBillModal(e.id,e.row);
    if (e.id === 'documents')  this.openDocumentsModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(CarsModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-90'],
      data: dataSend,
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCars();
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
        await this.deleteCars(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getCars();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async searchData(event: any) {
    if (!event) {

      return;
    }

    if (event.length < 3) return;
    this.filter = event
    this.currentPage = 1
    this.pageSize = 10;
    setTimeout(() => {
      this.getCars();
    }, 500);
    // this.query$.next((event));
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? ++this.currentPage : --this.currentPage;
    this.getCars();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getCars();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getCars();
  }

  openHistoryIncomeModal(action: string, data: any) {
      let dataSend = {action, row: data, flag: 1};
      const dialogRef = this._MatDialog.open(HistoryIncomeModalComponent, {
        disableClose: true,
        data: dataSend,
        panelClass: ['custom-dialog-container', 'dialog-60'],
        width: '90vw',
        height: '90vh',
        maxWidth: '90vw'
      });
  
      dialogRef.afterClosed().subscribe(result => {

      });
    }

  getCars() {
    this.loading = false;
    this._CarsService.getCarsFull(this.filter,this.pageSize, this.currentPage,'active' ,this.filterSelects).subscribe({
      next: async (response: any) => {
        if(response) {

          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.cars = response.items.map((r: any) => ({ ...r,
            carData:  `${r.make } ${r.version} ${r.model } ${r.color }`,
            // costShow: r.purchases.length > 0 ? (r.purchases || []).reduce((acc: number, inc: any) => acc + (Number(inc.total) || 0), 0) : r.cost
            /*costShow: r.purchases?.length > 0
              ? r.purchases.reduce((acc: number, inc: any) => {
                  const total = Number(inc.total) || 0;

                  const extra = r.car_acquisition === 'compras'
                    ? Number(inc.amount_by_invoice) || 0
                    : 0;

                  return acc + total + extra;
                }, 0)
              : r.cost
              */
              costShow: r.cost
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

  async deleteCars(id: string) {
    return new Promise((resolve, reject) => {
      this._CarsService.deleteCars(id).subscribe({
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

  openBillModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(CarBillsShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCars();
      }
    });
  }

  openDocumentsModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(CarDocumentsShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCars();
      }
    });
  }

  openChecksModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(ArriveCheckCarModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 2) {
        this.editArriveModal('edit', data);
        // this.getCars();
      }
    });
  }

  editArriveModal(action: string = 'edit', data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(ArrivalReviewModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-checks' ],
      width: '50vw',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.getCars();
      }
    });
  }

  getStore() {
    this._StoreService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStore = [...this.store];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
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

  getInvestor() {
    this._InvestorService.getInvestor(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
          this.filteredInvestor = [...this.investor];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  toggleInvestorDropdown() {
    this.investorDropdownOpen = !this.investorDropdownOpen;
    if (this.investorDropdownOpen) {
      this.investorFilterControl.setValue('');
      this.filteredInvestor = [...this.investor];
    }
  }

   closeInvestorDropdown() {
    this.investorDropdownOpen = false;
  }

   selectInvestor(data: any) {
    this.selectedInvestorLabel = data !== null ? `${data.full_name}` : 'Todos';
    this.investor_id = data !== null ? data.id : '';
    
    this.closeInvestorDropdown();
  }

  filterGo() {
    const rawFilter = {
      store_id: this.store_id,
      investor_id: this.investor_id,
      key: this.keyFilterControl.value,
      make: this.makeFilterControl.value,
      model: this.modelFilterControl.value,
      version: this.versionFilterControl.value,
      color: this.colorFilterControl.value
    };

    this.filterSelects = Object.fromEntries(
      Object.entries(rawFilter).filter(([_, v]) => v != null && v !== '')
    );
    this.currentPage = 1
    this.pageSize = 10;
    this.getCars();
   
  }
}
