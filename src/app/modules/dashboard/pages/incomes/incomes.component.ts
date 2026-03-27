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
import { IncomeModalComponent } from '../../modals/income-modal/income-modal.component';
import { SalesModalComponent } from '../../modals/sales-modal/sales-modal.component';
import { SalesService } from 'src/app/core/services/sales/sales.service';
import moment from 'moment';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { IncomeAdditionalComponent } from '../../modals/income-additional/income-additional.component';
import { HistoryIncomeModalComponent } from '../../modals/history-income-modal/history-income-modal.component';

@Component({
  selector: 'app-incomes',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent {
  inconmes: any[] = [];
  laywaySelected: TypeExpense | undefined;
  inconmesHeader: string[] = [
    'Fecha','Usuario', 
    'Tipo de ingreso',
    'Tipo de pago', 
    'Importe del ingreso', 
    'Origen del ingreso', 
    'Cliente',
    'Auto',
    'Concepto del ingreso',
    'Estatus',
    '',
    ''
  ];
  columns: any = [

    { key: 'date_income', type: 'dob' },
    { key: 'userData', type: 'text' },
    { key : 'typeIncome', type: 'text' },
    { key: 'paymenthMethod', type: 'text' },
    { key: 'amount', type: 'money' },
    { key: 'source', type: 'translate-text' },

    { key: 'client', type: 'text' },
    { key: 'carData', type: 'text' },
    { key: 'description', type: 'text' },
    { key: 'status', type: 'status' },
    { key: 'statusReview', type: '',
      show: [
        { id: 'status', value: [2] },
      ] 
     },
     { key: 'url', type: '',
      show: [
        { id: 'url', value: [2] },
      ] 
     },
     { key: 'statusReview', type: '',
      show: [
        { id: 'delete', value: [2] },
      ] 
     },
    { key: 'statusReview', type: '',
      show: [
        { id: 'approve', value: [2] },
      ] 
     }
  ]



  readonly actions: RowAction[] = [
    { icon: 'delete',  id: 'delete',  label: 'Cancelar registro' },
    { icon: 'check_circle',  id: 'approve',  label: 'Aprobar registro' },
    { icon: 'add',  id: 'status',  label: 'Agregar documento' },
    { icon: 'attach_file',  id: 'url',  label: 'Descargar el archivo' },
    
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
  ref: any;
  constructor(
    private _MatDialog: MatDialog,
    private _ToastrService: ToastrService,
    private _SalesService : SalesService,
    private _IncomeService: IncomeService
  ) {}

  ngOnInit() {
    this.getIncomes();
  }

  getIncomes() {
    this.loading = false;
    this._IncomeService.getIncomesWithOutFilter(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
          /*
          color = flag === 1
      ? '!text-blue-500'
      : flag === 2
        ? '!text-red-500'
        : '!text-green-500';

          */
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.inconmes = response.items.map((r: any) => (
            { 
            statusReview: r.status === 'pendiente_aprobacion' ? 1 : r.status === 'cancelado' || r.status === 'aprobado' ? 2 : 3,
            userData: r.user.full_name,
            typeIncome: r.sale.sales_type,
            paymenthMethod: r.payment_method.name,
            description: r.description === null ? '-' : r.description,
            client: r.source === 'layaway' ? r.layaway.client.full_name : r.sale.client.full_name,
            carData: r.source === 'layaway' ? `${r.layaway.car.key} ${r.layaway.car.make} ${r.layaway.car.version} ${r.layaway.car.model} ${r.layaway.car.color}` : `${r.sale.car.key} ${r.sale.car.make} ${r.sale.car.version} ${r.sale.car.model} ${r.sale.car.color}`,
            amount: r.amount,
            url: Object.keys(r.document).length ? 1 : 2,
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

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'delete') this.actionModalFile(2,'delete', e.row, 'Desea cancelar el registro?');
    if (e.id === 'approve') this.actionModalFile(3,'approve', e.row, 'Desea aprobar el registro?');
    if (e.id === 'url') this.actionModalFile(1,'delete', e.row, 'Desea descargar el archivo?');
    if (e.id === 'status')  this.openAddIncomeModal(e.id,e.row);
  }

  actionModalFile(flag: number,action: string, data: any, msg: string, color: string = '!text-blue-500', icon = 'cloud_download') {
    // color = flag === 1 ? '!text-blue-500' : '!text-red-500';  
    color = flag === 1
      ? '!text-blue-500'
      : flag === 2
        ? '!text-red-500'
        : '!text-green-500';
    // icon = flag === 1 ? 'cloud_download' : 'delete';

    icon = flag === 1
      ? 'cloud_download'
      : flag === 2
        ? 'delete'
        : 'check';
    let dataSend = {action, row: data, msg, color, icon};

    this.ref = this._MatDialog.open(ActionMessageComponent, {
      data: dataSend,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-40'],
      width: '40vw',
      height: '40vh',
      maxWidth: '40vw'
    });
    

    this.ref.componentInstance.accept.subscribe(async () => {

      this.ref.componentInstance.loading = true;
      try {
        if (flag === 1) await this.downloadDirect(data.document.url, data.document.name);
        if (flag === 2 || flag === 3) await this.cancelIncome(data, flag);
        this.getIncomes();
        this.ref.componentInstance.loading = false;
        this.ref.close(true);
        
      } catch {
        if (this.ref.componentInstance) {
          this.ref.componentInstance.loading = false;
        }
      }
    });
  }
    
  async downloadDirect(url: string, filename?: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(IncomeModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIncomes();
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
        this.getIncomes();
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
        this.getIncomes();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

 async actionModalSecondValidation(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {
   return new Promise((resolve, reject) => {
    let dataSend = {action, row: data, msg, color, icon};
      const ref: any = this._MatDialog.open(ActionMessageComponent, {
        data: dataSend,
        disableClose: true,
        panelClass: ['custom-dialog-container', 'dialog-40'],
        width: '40vw',
        height: '40vh',
        maxWidth: '40vw'
      });

      ref.componentInstance.accept.subscribe(async (data: any) => {
        ref.componentInstance.loading = true;
        try {
          ref.componentInstance.loading = false;
          ref.close(true);
          resolve(true)
        } catch {
          resolve(false)
        }
      });
    })
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

  async cancelIncome(data: any, flag: number) {
    return new Promise(async (resolve, reject) => {
      if (flag === 3 && data.document && Object.keys(data.document).length === 0) {
        this.ref.componentInstance.loading = false;
        this.ref.close(true);
        const result = await this.actionModalSecondValidation('cancel', data, '¿El registro no cuenta con documento quiere continuar con la aprobacion?', '!text-red-500', 'cancel');
      }


      let dataSend = {
        id: data.id,
        status: flag === 2 ? 'cancelado' : 'aprobado'
      }
      this._IncomeService.updateIncome(dataSend).subscribe({
        next: async (response: any) => {
          if(response) {
            let msg = flag === 2 ? 'Cancelado' : 'Aprobado';
            this._ToastrService.success(`${msg} con exito`, 'Exito');
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
    this.getIncomes();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getIncomes();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getIncomes();
  }

  openAddIncomeModal(action: string, data: any) {
    data['layaway_id'] =  data.layaway.id;
    let dataSend = {action, row: data, flag: 4};

    const dialogRef = this._MatDialog.open(IncomeAdditionalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIncomes();
      }
    });
    
  }
    
}