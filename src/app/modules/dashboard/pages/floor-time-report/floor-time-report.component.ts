import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { FloorTimeBillsShowModalComponent } from '../../modals/floor-time-bills-show-modal/floor-time-bills-show-modal.component';
import { FloorTimeEditPriceModalComponent } from '../../modals/floor-time-edit-price-modal/floor-time-edit-price-modal.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-floor-time-report',
  imports: [
    LoadingComponent,
    NgxMaskDirective,
    NgxMaskPipe,
    ButtonComponent,
    CommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './floor-time-report.component.html',
  styleUrl: './floor-time-report.component.css'
})
export class FloorTimeReportComponent {
  downloadingExcel = false;
  loadingModal: boolean = false;
  list: any[] = [];
  total = 0;
  selectedRowKey: string | null = null;
  store: any[] = [];
  investor: any[] = [];
  filter: any = {};

  store_id: any = null;
  investor_id: any = null;
  date_from: string = '';
  date_to: string = '';

  keyFilterControl = new FormControl('');
  makeFilterControl = new FormControl('');
  modelFilterControl = new FormControl('');

  filteredStore: any[] = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';

  filteredInvestor: any[] = [];
  investorFilterControl = new FormControl('');
  investorDropdownOpen = false;
  selectedInvestorLabel = '';

  constructor(
    private _MatDialog: MatDialog,
    private _ReportsService: ReportsService,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService,
    private _InvestorService: InvestorService,
    private _PermissionsService: PermissionsService
  ) {}

  get canEditSalePrice() {
    return this._PermissionsService.hasScope('REPORTS.TIEMPO_PISO.AUTO.EDIT');
  }

  ngOnInit() {
    this.getStore();
    this.getInvestor();
    this.getReports();

    this.storeFilterControl.valueChanges.subscribe((term) => {
      const value = (term || '').toString().toLowerCase().trim();
      this.filteredStore = this.store.filter((data: any) =>
        `${data.name}`.toLowerCase().includes(value)
      );
    });

    this.investorFilterControl.valueChanges.subscribe((term) => {
      const value = (term || '').toString().toLowerCase().trim();
      this.filteredInvestor = this.investor.filter((data: any) =>
        `${data.full_name}`.toLowerCase().includes(value)
      );
    });
  }

  getStore() {
    this._StoreService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStore = [...this.store];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  getInvestor() {
    this._InvestorService.getInvestor(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
          this.filteredInvestor = [...this.investor];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  async getReports() {
    this.loadingModal = false;
    this.selectedRowKey = null;
    return new Promise((resolve, reject) => {
      this._ReportsService.getFloorTimeReports(this.filter, this.date_from, this.date_to).subscribe({
        next: (response: any) => {
          if (response) {
            this.list = (response.items ?? []).map((item: any) => this.normalizeRow(item));
            this.total = response?.pagination?.total_items ?? this.list.length;
            this.loadingModal = true;
            resolve(true);
          }
        },
        error: (err) => {
          this.loadingModal = true;
          reject(err);
        },
      });
    });
  }

  filterGo() {
    const rawFilter = {
      store_id: this.store_id,
      investor_id: this.investor_id,
      key: this.keyFilterControl.value,
      make: this.makeFilterControl.value,
      model: this.modelFilterControl.value,
    };

    this.filter = Object.fromEntries(
      Object.entries(rawFilter).filter(([_, v]) => v != null && v !== '')
    );

    this.getReports();
  }

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
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

  openBillsModal(row: any) {
    const bills = Array.isArray(row?.bills) ? row.bills : [];
    this._MatDialog.open(FloorTimeBillsShowModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      maxWidth: '90vw',
      data: {
        bills,
        auto: {
            key: row?.key ?? '-',
            make: row?.make ?? '-',
            model: row?.model ?? '-',
            version: row?.version ?? '-',
            color: row?.color ?? '-',
            km: row?.km ?? '-',
            cost_net: row?.cost_net ?? row?.cost ?? null,
          },
      },
    });
  }

  openEditPriceModal(row: any) {
    const dialogRef = this._MatDialog.open(FloorTimeEditPriceModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-45'],
      data: { row },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getReports();
      }
    });
  }

  getRowSelectionKey(item: any, index: number) {
    return String(item?.id ?? item?.key ?? `${item?.arrived_at ?? ''}-${index}`);
  }

  selectRow(item: any, index: number) {
    this.selectedRowKey = this.getRowSelectionKey(item, index);
  }

  clearSelectedRow(item: any, index: number) {
    if (this.selectedRowKey === this.getRowSelectionKey(item, index)) {
      this.selectedRowKey = null;
    }
  }

  isSelectedRow(item: any, index: number) {
    return this.selectedRowKey === this.getRowSelectionKey(item, index);
  }

  downloadFile() {
    if (this.downloadingExcel) {
      return;
    }

    if (this.list.length === 0) {
      this._ToastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    this.downloadingExcel = true;
    const dataPush = this.list.map((item) => ({
      'Inversionista': this.getInvestorsLabel(item.investors),
      'Sucursal': item.store?.name ?? '-',
      'Clave': item.key ?? '-',
      'Auto': item.make || item.model || item.version || item.color
        ? `${item.make || ''} ${item.model || ''} ${item.version || ''} ${item.color || ''}`.trim()
        : '-',
      'Fecha de llegada': item.arrived_at ? moment(item.arrived_at).format('DD/MM/YYYY') : '-',
      'Antiguedad': item.days ?? '-',
      'Costo': item.cost ?? '-',
      'Venta': item.sale_price ?? '-',
      'Utilidad': item.utilidad ?? '-',
      'Margen': item.margen ?? '-',
      'Costo sin gastos': item.cost_net ?? '-',
    }));

    const binaryWS = XLSX.utils.json_to_sheet(dataPush);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Tiempo en piso');
    XLSX.writeFile(wb, `Reporte-tiempo-piso-${moment().format('DD-MM-YYYY')}.xlsx`);
    this.downloadingExcel = false;
    this._ToastrService.success('Descarga exitosa', 'Mensaje');
  }

  getInvestorsLabel(investors: any[] | null | undefined) {
    if (!Array.isArray(investors) || investors.length === 0) {
      return '-';
    }

    return investors
      .map((item: any) => String(item?.full_name ?? '').trim())
      .filter(Boolean)
      .join(', ') || '-';
  }

  private normalizeRow(item: any) {
    const car = item.car ?? {};
    const store = item.store ?? {};
    const investor = item.investor ?? {};

    return {
      ...item,
      id: item.id ?? car.id ?? item.car_id,
      car_id: item.car_id ?? car.id ?? item.id,
      key: item.key ?? car.key ?? '-',
      make: item.make ?? car.make ?? '-',
      model: item.model ?? car.model ?? '-',
      version: item.version ?? car.version ?? '-',
      color: item.color ?? car.color ?? '-',
      storeName: store.name ?? item.store_name ?? item.branch_name ?? '-',
      investorName: investor.full_name ?? investor.name ?? item.investor_name ?? '-',
      dateStar: item.dateStar ?? item.date_start ?? item.start_date ?? item.purchase_date ?? item.created_at ?? null,
      dateEnd: item.dateEnd ?? item.date_end ?? item.end_date ?? item.sale_date ?? item.updated_at ?? null,
      daysOnFloor: item.daysOnFloor ?? item.days_on_floor ?? item.floor_time ?? item.time_on_floor ?? item.days ?? '-',
    };
  }
}
