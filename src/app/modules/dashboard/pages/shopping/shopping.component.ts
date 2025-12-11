import { Component, model } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { TypeExpense } from 'src/app/core/models/typeExpense.model';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { TypeExpenseModalComponent } from '../../modals/type-expense-modal/type-expense-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ShoppingModalComponent } from '../../modals/shopping-modal/shopping-modal.component';
import { PaymentsAddModalComponent } from '../../modals/payments-add-modal/payments-add-modal.component';
import { PaymentsShowModalComponent } from '../../modals/payments-show-modal/payments-show-modal.component';

@Component({
  selector: 'app-shopping',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent {
  purchaseSelected: TypeExpense | undefined;
  purchase: TypeExpense[] = [];
  purchaseHeader: string[] = ['Clave','Auto','Tipo de auto', 'Fecha de llegada','Total',];
  columns: any = [
    { key: 'key', type: 'text' },
    { key: 'car', type: 'text' },
    // { key: 'make', type: 'text' },
    { key: 'car_type', type: 'text' },
    // { key: 'line', type: 'text' },
    // { key: 'model', type: 'text' },
    // { key: 'color', type: 'text' },
    { key: 'arrived_at', type: 'dob' },
    { key: 'total', type: 'money' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Pagos' },
    { icon: 'add',  id: 'add',  label: 'Agregar Pagos' },
    { icon: 'edit',  id: 'edit',  label: 'Editar Compra' },
    { icon: 'delete', id: 'delete', label: 'Eliminar Compra' },
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
    private _ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getPurchase();
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
    this.getTypeExpense();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getTypeExpense();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getTypeExpense();
  }

  getTypeExpense() {
    /*this.loading = false;
    this._TypeExpenseService.getTypeExpense(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.typeExpense = response.items.map((r: any) => ({ ...r }));
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
      */
  }

  getPurchase() {
    this.loading = false;
    this._TypeExpenseService.getPurchase(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.purchase = response.items.map((r: any) => ({ ...r, 
            car:  r.car ?  `${r.car.make } ${r.car.version} ${r.car.model } ${r.car.color }` : '-',
            // make: r.car.make, 
            car_type: r.car.car_type.name, 
            // line: r.car.version, 
            // model: r.car.model, 
            // color: r.car.color, 
            key: r.car.key,
            arrived_at: r.car.arrived_at,  }));
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
