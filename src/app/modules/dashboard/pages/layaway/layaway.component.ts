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
import { LayawayModalComponent } from '../../modals/layaway-modal/layaway-modal.component';
import { LaywayService } from 'src/app/core/services/layway/layway.service';
import { LayawayShowModalComponent } from '../../modals/layaway-show-modal/layaway-show-modal.component';
import { IncomeModalComponent } from '../../modals/income-modal/income-modal.component';


@Component({
  selector: 'app-layaway',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './layaway.component.html',
  styleUrl: './layaway.component.css'
})
export class LayawayComponent {
  layway: any[] = [];
  laywaySelected: TypeExpense | undefined;
  laywayHeader: string[] = ['Folio', 'Cliente', 'Auto', 'Vendedor','Fecha de apartado', 'Precio pactado para venta', 'Anticipo pactado para venta', 'Monto recibido por enganche', 'Fecha compromiso de compra'];
  columns: any = [
    { key: 'consecutive', type: 'text' },
    { key: 'clientName', type: 'text' },
    { key: 'carData', type: 'text' },
    { key: 'userName', type: 'text' },
    { key: 'date_layaway', type: 'dob' },
    { key: 'amount_sale', type: 'money' },
    { key: 'amount_down_payment', type: 'money' },
    { key: 'total', type: 'money' },
    { key: 'date_commitment', type: 'dob' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Abonos' },
    { icon: 'add',  id: 'add',  label: 'Agregar Abono' },
    { icon: 'delete', id: 'delete', label: 'Eliminar Apartado' },
    { icon: 'description', id: 'contract', label: 'Descargar Contrato' },
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
    private _LaywayService: LaywayService
  ) {}

  ngOnInit() {
    this.getLayway();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    if (e.id === 'contract') this.actionModal(e.id,e.row, 'Desea descargar el contrato?','!text-blue-500', 'description');
    if (e.id === 'add')  this.openAddIncomeModal(e.id,e.row);
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
        this.getLayway();
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
        this.getLayway();
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
        if(dataSend.action === 'contract') {
          await this.contratctLayaway(data.id);
        }
        if(dataSend.action === 'delete') {
          await this.deleteLayaway(data.id);
          this.getLayway();
        };
   
        ref.componentInstance.loading = false;
        ref.close(true);
        
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async deleteLayaway(id: string) {
    
    return new Promise((resolve, reject) => {
      this._LaywayService.deleteLayaway(id).subscribe({
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


  async contratctLayaway(id: string) {
    return new Promise((resolve, reject) => {
      // this._LaywayService.deleteLayaway(id).subscribe({
      this._LaywayService.getContract(id).subscribe({
        next: (response: any) => {
          if(response) {
            this.downloadDirect(response);
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

  async downloadDirect(url: string, filename?: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
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
    this.getLayway();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getLayway();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getLayway();
  }


  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(LayawayModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-65'],
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLayway();
      }
    });
  }


  openAddIncomeModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 1};
    const dialogRef = this._MatDialog.open(IncomeModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLayway();
      }
    });
  }

  getLayway() {
    this.loading = false;
    this._LaywayService.getLayaway(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.layway = response.items.map((r: any) => ({ 
            ...r,
            userName: r.user.full_name,
            clientName: r.client.full_name,
            folio: '',
            carData:  r.car  ?  `${r.car.make } ${r.car.version} ${r.car.model } ${r.car.color }` : '-',
            total: (r.incomes || []).reduce((acc: number, inc: any) => acc + (Number(inc.amount) || 0), 0),
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
