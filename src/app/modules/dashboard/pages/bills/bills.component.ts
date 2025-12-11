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
import { ArrivalreviewService } from 'src/app/core/services/arrivalReview/arrivalreview.service';
import { ArrivalReviewModalComponent } from '../../modals/arrival-review-modal/arrival-review-modal.component';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { BillsModalComponent } from '../../modals/bills-modal/bills-modal.component';

@Component({
  selector: 'app-bills',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent {
  bills: any[] = [];
  billsSelected: TypeExpense | undefined;
  billsHeader: string[] = ['Fecha', 'Concepto', 'Total', 'Clave','Auto'];
  columns: any = [
    { key: 'created_at', type: 'dob' },
    { key: 'name', type: 'text' },
    { key: 'total', type: 'money' },
    { key: 'key', type: 'text' },
    { key: 'car', type: 'text' },

    /*
    { key: 'make', type: 'text' },
    { key: 'version', type: 'text' },
    { key: 'model', type: 'text' },
     */
    // { key: 'color', type: 'text' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Pagos' },
    { icon: 'add',  id: 'add',  label: 'Agregar Pagos' },
    { icon: 'delete', id: 'delete', label: 'Eliminar Gasto' },
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
    private _ArrivalreviewService: ArrivalreviewService,
    private _CarsService: CarsService,
    private _BillService: BillService
  ) {}

  ngOnInit() {
    // this.getArrival();
    this.getBills();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    if (e.id === 'add')  this.openAddModal(e.id,e.row);
  }

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
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
        this.getBills();
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
        this.getBills();
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
        await this.deleteBill(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getBills();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async deleteBill(id: string) {
    return new Promise((resolve, reject) => {
      this._BillService.deleteBill(id).subscribe({
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
    this.getBills();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getBills();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getBills();
  }


  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(BillsModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBills();
      }
    });
  }

  getBills() {
    this.loading = false;
    this._BillService.getBills(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.bills = response.items.map((r: any) => ({ 
            ...r,
            key: r.cars.length > 0 ? r.cars[0].key : '-',
            make: r.cars.length > 0 ? r.cars[0].make : '-', 
            line: r.cars.length > 0 ? r.cars[0].version : '-', 
            model: r.cars.length > 0 ? r.cars[0].model : '-', 
            car:  r.cars.length > 0 ?  `${r.cars[0].make } ${r.cars[0].version} ${r.cars[0].model } ${r.cars[0].color }` : '-'
            // color: r.cars.length > 0 ? r.cars[0].color : '-', 
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
  
}
