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

@Component({
  selector: 'app-cars',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {
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
    { icon: 'history',  id: 'history',  label: 'Historial' },
    { icon: 'check',  id: 'checkArrive',  label: 'Revision de llegada' },
    { icon: 'attach_money',  id: 'bill',  label: 'Visualizar Gastos' },
    { icon: 'attach_file',  id: 'documents',  label: 'Visualizar Documentos' },
    { icon: 'edit',  id: 'edit',  label: 'Editar' },
    { icon: 'delete', id: 'delete', label: 'Elimnar' },

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
  constructor(
    private _MatDialog: MatDialog,
    private _CarsService: CarsService,
    private _ToastrService: ToastrService,
  ) {}

  ngOnInit() {
    this.getCars();
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
    this._CarsService.getCarsFull(this.filter,this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {

          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.cars = response.items.map((r: any) => ({ ...r,
            carData:  `${r.make } ${r.version} ${r.model } ${r.color }`,
            costShow: r.purchases.length > 0 ? (r.purchases || []).reduce((acc: number, inc: any) => acc + (Number(inc.total) || 0), 0) : r.cost
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
}
