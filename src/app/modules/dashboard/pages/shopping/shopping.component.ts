import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { TypeExpense } from 'src/app/core/models/typeExpense.model';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ShoppingModalComponent } from '../../modals/shopping-modal/shopping-modal.component';
import { PaymentsAddModalComponent } from '../../modals/payments-add-modal/payments-add-modal.component';
import { PaymentsShowModalComponent } from '../../modals/payments-show-modal/payments-show-modal.component';
import { StoreService } from 'src/app/core/services/store/store.service';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';

@Component({
  selector: 'app-shopping',
  imports: [TableComponent, MatDialogModule, MatIconModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent {
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
  date_from: string = '';
  date_to: string = '';
  filterSelects: any = {};

  purchaseSelected: TypeExpense | undefined;
  purchase: TypeExpense[] = [];
  purchaseHeader: string[] = ['Inversionista','Clave','Auto','Tipo de auto', 'Fecha de llegada','Total',];
  columns: any = [
    { key: 'investor', type: 'text' },
    { key: 'key', type: 'text' },
    { key: 'carDataShow', type: 'text' },
    { key: 'car_type', type: 'text' },
    { key: 'arrived_at', type: 'dob' },
    { key: 'total', type: 'money' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Pagos', scope: 'PAYMENT.GET' },
    { icon: 'add',  id: 'add',  label: 'Agregar Pagos', scope: 'PAYMENT.ADD' },
    { icon: 'edit',  id: 'edit',  label: 'Editar Compra', scope: 'PURCHASE.UPDATE' },
    { icon: 'delete', id: 'delete', label: 'Eliminar Compra', scope: 'PURCHASE.DELETE' },
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
    private _TypeExpenseService: TypeExpenseService,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService,
    private _InvestorService: InvestorService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.getStore();
    this.getInvestor();
    this.getPurchase();

    this.storeFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredStore = this.store.filter((data: any) => {
        const text = `${data.name}`.toLowerCase();
        return text.includes(value);
      });
    });

    this.investorFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredInvestor = this.investor.filter((data: any) => {
        const text = `${data.full_name}`.toLowerCase();
        return text.includes(value);
      });
    });
  }
  
  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    if (e.id === 'add')  this.openAddModal(e.id,e.row);
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(ShoppingModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-90'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPurchase();
      }
    });
  }

  openAddModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 4};
    const dialogRef = this._MatDialog.open(PaymentsAddModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPurchase();
      }
    });
  }

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 2};
    const dialogRef = this._MatDialog.open(PaymentsShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPurchase();
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
        await this.deletePurchase(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getPurchase();
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
    this.query$.next((event));
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? ++this.currentPage : --this.currentPage;
    this.getPurchase();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getPurchase();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getPurchase();
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
    const carFilter = Object.fromEntries(
      Object.entries({
        key: this.keyFilterControl.value,
        make: this.makeFilterControl.value,
        model: this.modelFilterControl.value,
        version: this.versionFilterControl.value,
        color: this.colorFilterControl.value
      }).filter(([_, v]) => v != null && v !== '')
    );

    const storeFilter = Object.fromEntries(
      Object.entries({
        id: this.store_id
      }).filter(([_, v]) => v != null && v !== '')
    );

    const purchaseFilter = Object.fromEntries(
      Object.entries({
        investor_id: this.investor_id
      }).filter(([_, v]) => v != null && v !== '')
    );

    this.filterSelects = Object.fromEntries(
      Object.entries({
        car: Object.keys(carFilter).length ? carFilter : null,
        store: Object.keys(storeFilter).length ? storeFilter : null,
        purchase: Object.keys(purchaseFilter).length ? purchaseFilter : null
      }).filter(([_, v]) => v != null)
    );

    this.currentPage = 1;
    this.pageSize = 10;
    this.getPurchase();
  }

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  getPurchase() {
    this.loading = false;
    this._TypeExpenseService.getPurchase(this.pageSize, this.currentPage, this.filterSelects, this.date_from, this.date_to).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.purchase = response.items.map((r: any) => ({ ...r, 
            carDataShow:  r.car ?  `${r.car.make } ${r.car.version} ${r.car.model } ${r.car.color }` : '-',
            carData:  r.car,
            car_type: r.car.car_type.name, 
            investor: r.investor.full_name,
            key: r.car.key,
            arrived_at: r.car.arrived_at,  
            // cost: r.payments? (r.payments || []).reduce((acc: number, inc: any) => acc + (Number(inc.amount) || 0), 0) : 0
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
  
  async deleteExpense(id: string) {
    return new Promise((resolve, reject) => {
      this._TypeExpenseService.deleteTypeExpense(id).subscribe({
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

   async deletePurchase(id: string) {
    return new Promise((resolve, reject) => {
      this._TypeExpenseService.deletePurchase(id).subscribe({
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
}
