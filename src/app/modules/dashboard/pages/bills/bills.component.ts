import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, of, Subject, switchMap } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { TypeExpense } from 'src/app/core/models/typeExpense.model';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { PaymentsAddModalComponent } from '../../modals/payments-add-modal/payments-add-modal.component';
import { PaymentsShowModalComponent } from '../../modals/payments-show-modal/payments-show-modal.component';
import { ArrivalreviewService } from 'src/app/core/services/arrivalReview/arrivalreview.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { BillsModalComponent } from '../../modals/bills-modal/bills-modal.component';
import { ExpenseClasificationService } from 'src/app/core/services/expenseClasification/expense-clasification.service';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-bills',
  imports: [TableComponent, MatDialogModule, CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent {
  readonly expenseTypeOptions: Array<{ id: 'all' | 'oficina' | 'auto'; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'oficina', label: 'Oficina' },
    { id: 'auto', label: 'Autos' },
  ];

  classifications: any[] = [];
  filteredClassifications: any[] = [];
  classificationFilterControl = new FormControl('');
  classificationDropdownOpen = false;
  selectedClassificationLabel = '';
  classification_bill_id: any = null;

  expenseTypeDropdownOpen = false;
  expenseTypeSelected: 'all' | 'oficina' | 'auto' = 'all';

  investors: any[] = [];
  filteredInvestors: any[] = [];
  investorFilterControl = new FormControl('');
  investorDropdownOpen = false;
  selectedInvestorLabel = '';
  investor_id: any = null;

  keyFilterControl = new FormControl('');
  makeFilterControl = new FormControl('');
  modelFilterControl = new FormControl('');
  versionFilterControl = new FormControl('');
  colorFilterControl = new FormControl('');
  date_from: string = '';
  date_to: string = '';
  filterSelects: any = {};

  bills: any[] = [];
  billsSelected: TypeExpense | undefined;
  billsHeader: string[] = ['Fecha', 'Usuario', 'Clasificacion', 'Concepto', 'Total', 'Clave','Auto'];
  columns: any = [
    { key: 'bill_date', type: 'dob' },
    { key: 'userName', type: 'text' },
    { key: 'classificationName', type: 'text' },
    { key: 'name', type: 'text' },
    { key: 'total', type: 'money' },
    { key: 'key', type: 'text' },
    { key: 'carDataCol', type: 'text' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Pagos', scope: 'PAYMENT.GET' },
    { icon: 'add',  id: 'add',  label: 'Agregar Pagos', scope: 'PAYMENT.ADD' },
    { icon: 'delete', id: 'delete', label: 'Eliminar Gasto', scope: 'BILL.DELETE' },
    { icon: 'edit',  id: 'edit',  label: 'Editar', scope: 'BILL.UPDATE' },
    
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
  filter: string = '';  
  downloadingExcel = false;
  constructor(
    private _MatDialog: MatDialog,
    private _ToastrService: ToastrService,
    private _BillService: BillService,
    private _ExpenseClasificationService: ExpenseClasificationService,
    private _InvestorService: InvestorService,
    public permissionsService: PermissionsService
  ) {
    this.query$
      .pipe(
        debounceTime(300),
        // distinctUntilChanged(),
        switchMap(q => {
          if (!q || q.length < 2) {
            this.getBills();
            return of(null);
          }
          
          this.filter = q
          return this.getBills();
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.getClassifications();
    this.getInvestors();
    this.getBills();

    this.classificationFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredClassifications = this.classifications.filter((classification: any) => {
        const text = `${classification.name}`.toLowerCase();
        return text.includes(value);
      });
    });

    this.investorFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredInvestors = this.investors.filter((investor: any) => {
        const text = `${investor.full_name}`.toLowerCase();
        return text.includes(value);
      });
    });
  }

  canCreateBill() {
    return this.permissionsService.hasScopes(['BILL.ADD'], 'any');
  }

  confirmDownloadVisible() {
    if (this.downloadingExcel) return;
    this.downloadingExcel = true;

    const dataSend = {
      action: 'download',
      row: null,
      msg: 'Se descargara lo visible en la tabla',
      color: '!text-blue-500',
      icon: 'cloud_download'
    };

    const ref: any = this._MatDialog.open(ActionMessageComponent, {
      data: dataSend,
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-40'],
      width: '40vw',
      height: '40vh',
      maxWidth: '40vw'
    });

    ref.componentInstance.accept.subscribe(() => {
      ref.componentInstance.loading = true;

      try {
        this.downloadVisibleRows();
        ref.componentInstance.loading = false;
        ref.close(true);
      } catch {
        ref.componentInstance.loading = false;
      } finally {
        this.downloadingExcel = false;
      }
    });

    ref.afterClosed().subscribe(() => {
      this.downloadingExcel = false;
    });
  }

  private downloadVisibleRows() {
    if (!this.bills.length) {
      this._ToastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    const wb = XLSX.utils.book_new();
    const groupedRows = this.bills.reduce((groups: Record<string, any[]>, item: any) => {
      const dateKey = this.formatBillDate(item.bill_date);
      groups[dateKey] = groups[dateKey] ?? [];
      groups[dateKey].push(item);
      return groups;
    }, {});

    for (const [date, rows] of Object.entries(groupedRows)) {
      const dataPush = rows.map((item: any) => ({
        'Fecha': this.formatBillDate(item.bill_date),
        'Usuario': item.userName ?? '-',
        'Clasificacion': item.classificationName ?? '-',
        'Concepto': item.name ?? '-',
        'Total': item.total ?? '-',
        'Clave': item.key ?? '-',
        'Auto': item.carDataCol ?? '-',
      }));

      const totalByDay = rows.reduce((sum: number, item: any) => sum + (Number(item.total) || 0), 0);
      dataPush.push({
        'Fecha': '',
        'Usuario': '',
        'Clasificacion': '',
        'Concepto': '',
        'Total': '',
        'Clave': '',
        'Auto': '',
      });
      dataPush.push({
        'Fecha': '',
        'Usuario': '',
        'Clasificacion': '',
        'Concepto': '',
        'Total': '',
        'Clave': '',
        'Auto': '',
      });
      dataPush.push({
        'Fecha': '',
        'Usuario': '',
        'Clasificacion': '',
        'Concepto': 'Total de gastos',
        'Total': totalByDay,
        'Clave': '',
        'Auto': '',
      });

      const ws = XLSX.utils.json_to_sheet(dataPush);
      XLSX.utils.book_append_sheet(wb, ws, this.sanitizeSheetName(date));
    }

    XLSX.writeFile(wb, `Gastos-${this.formatBillDate(new Date()).replace(/\//g, '-')}.xlsx`);
    this._ToastrService.success('Descarga exitosa', 'Mensaje');
  }

  private formatBillDate(value: any) {
    if (!value) return 'Sin fecha';

    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Sin fecha';

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  private sanitizeSheetName(value: string) {
    return value.replace(/[\\/?*[\]:]/g, '-').slice(0, 31) || 'Hoja';
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    if (e.id === 'add')  this.openAddModal(e.id,e.row);
  }

  openShowModal(action: string, data: any) {
    data['carData'] = {
      key: data.cars.length > 0 ? data.cars[0].key : '-',
          make: data.cars.length > 0 ? data.cars[0].make : '-', 
          line: data.cars.length > 0 ? data.cars[0].version : '-', 
          model: data.cars.length > 0 ? data.cars[0].model : '-', 
          color: data.cars.length > 0 ? data.cars[0].color : '-',
    }
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
    data['car'] = {
      key: data.cars.length > 0 ? data.cars[0].key : '-',
          make: data.cars.length > 0 ? data.cars[0].make : '-', 
          line: data.cars.length > 0 ? data.cars[0].version : '-', 
          model: data.cars.length > 0 ? data.cars[0].model : '-', 
          color: data.cars.length > 0 ? data.cars[0].color : '-',
    }
    
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

  getClassifications() {
    this._ExpenseClasificationService.getExpenseClasification(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.classifications = response.items
            .map((r: any) => ({ ...r }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          this.filteredClassifications = [...this.classifications];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  getInvestors() {
    this._InvestorService.getInvestor(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.investors = response.items.map((r: any) => ({ ...r }));
          this.filteredInvestors = [...this.investors];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  toggleClassificationDropdown() {
    this.classificationDropdownOpen = !this.classificationDropdownOpen;
    if (this.classificationDropdownOpen) {
      this.classificationFilterControl.setValue('');
      this.filteredClassifications = [...this.classifications];
    }
  }

  closeClassificationDropdown() {
    this.classificationDropdownOpen = false;
  }

  selectClassification(classification: any) {
    this.selectedClassificationLabel = classification !== null ? `${classification.name}` : 'Todos';
    this.classification_bill_id = classification !== null ? classification.id : '';
    this.closeClassificationDropdown();
  }

  toggleExpenseTypeDropdown() {
    this.expenseTypeDropdownOpen = !this.expenseTypeDropdownOpen;
  }

  closeExpenseTypeDropdown() {
    this.expenseTypeDropdownOpen = false;
  }

  selectExpenseType(option: string) {
    if (option !== 'all' && option !== 'oficina' && option !== 'auto') {
      return;
    }

    this.expenseTypeSelected = option;
    if (option !== 'auto') {
      this.investor_id = null;
      this.selectedInvestorLabel = '';
      this.keyFilterControl.setValue('');
      this.makeFilterControl.setValue('');
      this.modelFilterControl.setValue('');
      this.versionFilterControl.setValue('');
      this.colorFilterControl.setValue('');
    }
    this.closeExpenseTypeDropdown();
  }

  get selectedExpenseTypeLabel() {
    return this.expenseTypeOptions.find((option) => option.id === this.expenseTypeSelected)?.label ?? 'Todos';
  }

  toggleInvestorDropdown() {
    this.investorDropdownOpen = !this.investorDropdownOpen;
    if (this.investorDropdownOpen) {
      this.investorFilterControl.setValue('');
      this.filteredInvestors = [...this.investors];
    }
  }

  closeInvestorDropdown() {
    this.investorDropdownOpen = false;
  }

  selectInvestor(investor: any) {
    this.selectedInvestorLabel = investor !== null ? `${investor.full_name}` : 'Todos';
    this.investor_id = investor !== null ? investor.id : '';
    this.closeInvestorDropdown();
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
    const filters: any = {};

    const billFilter = Object.fromEntries(
      Object.entries({
        classification_bill_id: this.classification_bill_id,
        office: this.expenseTypeSelected === 'oficina' ? true : '',
      }).filter(([_, v]) => v != null && v !== '')
    );

    if (Object.keys(billFilter).length > 0) {
      filters.bill = billFilter;
    }

    if (this.expenseTypeSelected === 'auto') {
      const carFilter = Object.fromEntries(
        Object.entries({
          investor_id: this.investor_id,
          key: this.keyFilterControl.value,
          make: this.makeFilterControl.value,
          model: this.modelFilterControl.value,
          version: this.versionFilterControl.value,
          color: this.colorFilterControl.value,
        }).filter(([_, v]) => v != null && v !== '')
      );

      filters.car = carFilter;
    }

    this.filterSelects = filters;
    this.currentPage = 1;
    this.pageSize = 10;
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

  async getBills() {
    this.loading = false;
    this._BillService.getBills(this.pageSize, this.currentPage, this.filter, this.filterSelects, this.date_from, this.date_to).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;

          this.bills = response.items.map((r: any) => ({ 
            ...r,
            userName: r.user?.full_name ?? '-',
            classificationName: r.classification_bill?.name ?? '-',
            key: r.cars !== undefined && r.cars.length > 0 ? r.cars[0].key : '-',
            make: r.cars !== undefined && r.cars.length > 0 ? r.cars[0].make : '-', 
            line: r.cars !== undefined && r.cars.length > 0 ? r.cars[0].version : '-', 
            model: r.cars !== undefined && r.cars.length > 0 ? r.cars[0].model : '-', 
            carDataCol:  r.cars !== undefined && r.cars.length > 0 ?  `${r.cars[0].make } ${r.cars[0].version} ${r.cars[0].model } ${r.cars[0].color }` : '-'
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
