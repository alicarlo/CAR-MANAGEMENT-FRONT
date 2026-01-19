import { Component, model } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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

@Component({
  selector: 'app-sales',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent {
  sales: any[] = [];
  laywaySelected: TypeExpense | undefined;
  salesHeader: string[] = ['Asesor','Cliente', 'Auto','Fecha de entrega', 'Hora de entrega', 'Precio de venta'];
  columns: any = [

    { key: 'advisor', type: 'text' },
    { key: 'clientName', type: 'text' },
    { key: 'carData', type: 'text' },
    { key: 'date_delivery_aux', type: 'dob' },
    { key: 'hour_delivery_aux', type: 'text' },
    { key: 'amount_sale', type: 'money' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'delete', id: 'delete', label: 'Eliminar venta' },
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
    private _SalesService : SalesService 
  ) {}

  ngOnInit() {
    this.getSale();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
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
        await this.deleteSale(data.id)
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
    this._SalesService.getSale(this.pageSize, this.currentPage).subscribe({
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
}
