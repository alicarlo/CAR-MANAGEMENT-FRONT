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
import { IncomeModalComponent } from '../../modals/income-modal/income-modal.component';
import { SalesModalComponent } from '../../modals/sales-modal/sales-modal.component';
import { SalesService } from 'src/app/core/services/sales/sales.service';
import moment from 'moment';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { IncomeAdditionalComponent } from '../../modals/income-additional/income-additional.component';
import { HistoryIncomeModalComponent } from '../../modals/history-income-modal/history-income-modal.component';
import { AdditionalIncomeModalComponent } from '../../modals/additional-income-modal/additional-income-modal.component';
import { TicketPrintModalComponent } from '../../modals/ticket-print-modal/ticket-print-modal.component';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-incomes',
  imports: [TableComponent, MatDialogModule, CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css'
})
export class IncomesComponent {
  readonly statusOptions: Array<{ id: string | null; label: string }> = [
    { id: null, label: 'Todos' },
    { id: 'pendiente_aprobacion', label: 'Pendiente de aprobacion' },
    { id: 'aprobado', label: 'Aprobados' },
  ];

  inconmes: any[] = [];
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedStatus: string | null = null;
  selectedUserId: string | null = null;
  selectedUserLabel = '';
  userDropdownOpen = false;
  userFilterControl = new FormControl('');
  date_from: string = '';
  date_to: string = '';
  filterSelects: any = {};
  downloadingExcel = false;
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

    { key: 'clientData', type: 'text' },
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
     },
     { key: 'statusTicket', type: '',
      show: [
        { id: 'ticket', value: [2] },
      ] 
     }
  ]



  readonly actions: RowAction[] = [
    { icon: 'delete',  id: 'delete',  label: 'Cancelar registro', scope: ['INCOME.DELETE'] },
    { icon: 'check_circle',  id: 'approve',  label: 'Aprobar registro', scope: ['INCOME.APPROVE', 'INCOME.STATUS.APPROVE'] },
    { icon: 'add',  id: 'status',  label: 'Agregar documento', scope: ['INCOME.STATUS'] },
    { icon: 'attach_file',  id: 'url',  label: 'Descargar el archivo', scope: ['INCOME.GET'] },
    { icon: 'description',  id: 'ticket',  label: 'Descargar Ticket', scope: ['INCOME.GET'] },
    // { icon: 'attach_money',  id: 'incomeAdditional',  label: 'Agregar cobro adicional' },
    
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
    private _IncomeService: IncomeService,
    private _UsersService: UsersService,
    public permissionsService: PermissionsService
  ) {}

  get canCreateAdditionalIncome() {
    return this.permissionsService.hasScopes(['INCOME.ADD'], 'any');
  }

  ngOnInit() {
    this.getUsers();
    this.getIncomes();

    this.userFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredUsers = this.users.filter((user: any) => {
        const text = `${user.full_name}`.toLowerCase();
        return text.includes(value);
      });
    });
  }

  getIncomes() {
    this.loading = false;
    this._IncomeService.getIncomesFiltered(this.pageSize, this.currentPage, this.filterSelects, this.date_from, this.date_to).subscribe({
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

          this.inconmes = response.items.map((r: any) => this.normalizeIncomeRow(r));
          
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

  getUsers() {
    this._UsersService.getUsers(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.users = response.items.map((r: any) => ({ ...r.authz?.[0], ...r.user }));
          this.filteredUsers = [...this.users];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  filterGo() {
    this.filterSelects = Object.fromEntries(
      Object.entries({
        status: this.selectedStatus,
        user_id: this.selectedUserId,
      }).filter(([_, v]) => v != null && v !== '')
    );

    this.currentPage = 1;
    this.getIncomes();
  }

  downloadFile() {
    if (this.downloadingExcel) return;

    this.downloadingExcel = true;

    this._IncomeService.getIncomesFiltered(undefined, undefined, this.filterSelects, this.date_from, this.date_to).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

        const normalizedItems = items.map((item: any) => this.normalizeIncomeRow(item));

        if (normalizedItems.length === 0) {
          this._ToastrService.warning('No hay datos para descargar', 'Mensaje');
          this.downloadingExcel = false;
          return;
        }

        const dataPush = normalizedItems.map((item: any) => ({
          'Fecha': item.date_income ? moment(item.date_income).format('DD/MM/YYYY') : '-',
          'Usuario': item.userData ?? '-',
          'Tipo de ingreso': item.typeIncome ?? '-',
          'Tipo de pago': item.paymenthMethod ?? '-',
          'Importe del ingreso': item.amount ?? '-',
          'Origen del ingreso': item.source ?? '-',
          'Cliente': item.clientData ?? '-',
          'Auto': item.carData ?? '-',
          'Concepto del ingreso': item.description ?? '-',
          'Estatus': item.status ?? '-',
        }));

        const binaryWS = XLSX.utils.json_to_sheet(dataPush);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, binaryWS, 'Ingresos');
        XLSX.writeFile(wb, `Ingresos-${moment().format('DD-MM-YYYY')}.xlsx`);
        this._ToastrService.success('Descarga exitosa', 'Mensaje');
        this.downloadingExcel = false;
      },
      error: (err) => {
        if (err.error !== 'Token expired') {
          this._ToastrService.error(err.error, 'Error');
        }
        this.downloadingExcel = false;
      },
    });
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    if (this.userDropdownOpen) {
      this.userFilterControl.setValue('');
      this.filteredUsers = [...this.users];
    }
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  selectUser(user: any) {
    this.selectedUserLabel = user !== null ? `${user.full_name}` : 'Todos';
    this.selectedUserId = user !== null ? user.id : null;
    this.closeUserDropdown();
  }

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  private normalizeIncomeRow(r: any) {
    return {
      statusReview: r.status === 'pendiente_aprobacion' ? 1 : r.status === 'cancelado' || r.status === 'aprobado' ? 2 : 3,
      userData: r.user?.full_name ?? '-',
      typeIncome: r.income_type == null ? '-' : this.formatIncomeType(r.income_type),
      paymenthMethod: r.payment_method?.name ?? '-',
      description: r.description === null ? '-' : r.description,
      clientData: r.source === 'layaway'
        ? r.layaway?.client?.full_name ?? '-'
        : r.source === 'sale'
          ? r.sale?.client?.full_name ?? '-'
          : r.client?.full_name ?? '-',
      carData:
        r.source === 'layaway'
          ? [r.layaway?.car?.key, r.layaway?.car?.make, r.layaway?.car?.version, r.layaway?.car?.model, r.layaway?.car?.color].filter(Boolean).join(' ') || '-'
          : r.source === 'sale'
            ? [r.sale?.car?.key, r.sale?.car?.make, r.sale?.car?.version, r.sale?.car?.model, r.sale?.car?.color].filter(Boolean).join(' ') || '-'
            : [r.car?.key, r.car?.make, r.car?.version, r.car?.model, r.car?.color].filter(Boolean).join(' ') || '-',
      amount: r.amount,
      url: r.document && Object.keys(r.document).length ? 1 : 2,
      statusTicket: r.status === 'aprobado'  ? 1 : 2,
      ...r
    };
  }

  formatIncomeType(value: string): string {
    if (!value) return '';

    return value
      .replace(/_/g, ' ')          
      .toLowerCase()           
      .replace(/\b\w/g, c => c.toUpperCase()); 
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'delete') this.actionModalFile(2,'delete', e.row, 'Desea cancelar el registro?');
    if (e.id === 'approve') this.actionModalFile(3,'approve', e.row, 'Desea aprobar el registro?');
    if (e.id === 'url') this.actionModalFile(1,'delete', e.row, 'Desea descargar el archivo?');
    if (e.id === 'status')  this.openAddIncomeModal(e.id,e.row);
    if (e.id === 'incomeAdditional')  this.openShowAdditionalIncomeModal(e.id,e.row);
    if (e.id === 'ticket')  this.openTicketModal(e.id,e.row);
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
  

  openShowAdditionalIncomeModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 1};
    const dialogRef = this._MatDialog.open(AdditionalIncomeModalComponent, {
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

  openTicketModal(action: string, data: any) {
      let dataSend = {data, full: data, flag: 0};
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
          this.getIncomes();
        }
      });
    }
    
}
