import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { StoreService } from 'src/app/core/services/store/store.service';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import * as XLSX from 'xlsx';
import moment from 'moment';

@Component({
  selector: 'app-report-sales',
  imports: [CommonModule, TableComponent, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './report-sales.component.html',
  styleUrl: './report-sales.component.css'
})
export class ReportSalesComponent {
  downloadingExcel = false;
  store: any[] = [];
  investor: any[] = [];
  store_id: any = null;
  investor_id: any = null;
  date_from: string = '';
  date_to: string = '';
  filter: any = {};
  keyFilterControl = new FormControl('');

  filteredStore: any[] = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';

  filteredInvestor: any[] = [];
  investorFilterControl = new FormControl('');
  investorDropdownOpen = false;
  selectedInvestorLabel = '';

  sales: any[] = [];
  salesHeader: string[] = ['Diferencia a venta', 'Utilidad', 'Sucursal', 'Clave', 'Auto', 'Inversionista', 'Fecha de la venta', 'Fecha de llegada', 'Tiempo en piso'];
  columns: any = [
    { key: 'sales_difference', type: 'money' },
    { key: 'utilidad', type: 'money' },
    { key: 'storeName', type: 'text' },
    { key: 'key', type: 'text' },
    { key: 'carData', type: 'text' },
    { key: 'investorName', type: 'text' },
    { key: 'sale.date_delivery', type: 'dob' },
    { key: 'arrived_at', type: 'dob' },
    { key: 'daysLabel', type: 'text' },
  ];

  loading = true;
  error = false;
  hasNext = false;
  hasPrev = false;
  total = 0;
  utilidadTotal: number | string | null = null;
  totalPages = 0;
  currentPage = 1;
  pageSize = 10;
  pages = 0;
  anchorsNext: any[] = [];

  constructor(
    private reportsService: ReportsService,
    private toastrService: ToastrService,
    private storeService: StoreService,
    private investorService: InvestorService
  ) {}

  ngOnInit() {
    this.getStore();
    this.getInvestor();
    this.getSalesReport();

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

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.currentPage = 1;
    this.getSalesReport();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getSalesReport();
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? this.currentPage + 1 : this.currentPage - 1;
    this.getSalesReport();
  }

  searchData(_: any) {}

  downloadFile() {
    if (this.downloadingExcel) {
      return;
    }

    this.downloadingExcel = true;

    this.reportsService.getSalesReports(undefined, undefined, this.filter, this.date_from, this.date_to).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

        const normalizedItems = items.map((item: any) => this.normalizeRow(item));

        if (normalizedItems.length === 0) {
          this.toastrService.warning('No hay datos para descargar', 'Mensaje');
          this.downloadingExcel = false;
          return;
        }

        const dataPush = normalizedItems.map((item: any) => ({
          'Diferencia a venta': item.sales_difference ?? '-',
          'Utilidad': item.utilidad ?? '-',
          'Sucursal': item.storeName ?? '-',
          'Clave': item.key ?? '-',
          'Auto': item.carData ?? '-',
          'Inversionista': item.investorName ?? '-',
          'Fecha de la venta': '-',
          'Fecha de llegada': item.arrived_at ? moment(item.arrived_at).format('DD/MM/YYYY') : '-',
          'Tiempo en piso': item.daysLabel ?? '-',
        }));

        const binaryWS = XLSX.utils.json_to_sheet(dataPush);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, binaryWS, 'Reporte ventas');
        XLSX.writeFile(wb, `Reporte-ventas-${moment().format('DD-MM-YYYY')}.xlsx`);
        this.toastrService.success('Descarga exitosa', 'Mensaje');
        this.downloadingExcel = false;
      },
      error: (err) => {
        if (err.error !== 'Token expired') {
          this.toastrService.error(err.error, 'Error');
        }
        this.downloadingExcel = false;
      },
    });
  }

  filterGo() {
    const carFilter = Object.fromEntries(
      Object.entries({
        investor_id: this.investor_id,
      }).filter(([_, v]) => v != null && v !== '')
    );

    const storeFilter = Object.fromEntries(
      Object.entries({
        id: this.store_id,
      }).filter(([_, v]) => v != null && v !== '')
    );

    this.filter = Object.fromEntries(
      Object.entries({
        key: this.keyFilterControl.value,
        car: Object.keys(carFilter).length ? carFilter : null,
        store: Object.keys(storeFilter).length ? storeFilter : null,
      }).filter(([_, v]) => v != null)
    );

    this.currentPage = 1;
    this.getSalesReport();
  }

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  getStore() {
    this.storeService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStore = [...this.store];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this.toastrService.error(err.error, 'Error');
      },
    });
  }

  getInvestor() {
    this.investorService.getInvestor(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
          this.filteredInvestor = [...this.investor];
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this.toastrService.error(err.error, 'Error');
      },
    });
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

  private getSalesReport() {
    this.loading = false;
    this.error = false;

    this.reportsService.getSalesReports(this.pageSize, this.currentPage, this.filter, this.date_from, this.date_to).subscribe({
      next: (response: any) => {
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

        this.sales = items.map((item: any) => this.normalizeRow(item));

        const pagination = response?.pagination ?? {};
        this.total = pagination.total_items ?? this.sales.length;
     
        this.utilidadTotal = response?.pagination?.utilidad_total ?? response?.pagination.utilidad_total ?? null;
        this.totalPages = pagination.total_pages ?? (this.sales.length ? 1 : 0);
        this.currentPage = pagination.current_page ?? 1;
        this.hasNext = pagination.has_next ?? false;
        this.hasPrev = pagination.has_prev ?? false;
        this.pages = this.totalPages;

        setTimeout(() => {
          this.loading = true;
        }, 400);
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this.loading = true;
        this.error = true;
        this.toastrService.error(err.error, 'Error');
      },
    });
  }

  private normalizeRow(item: any) {
    const car = item?.arrive?.car ?? item?.car ?? {};
    const store = item?.store ?? {};
    const investors = Array.isArray(item?.investors) ? item.investors : [];
    const days = item?.days ?? car?.days ?? null;

    return {
      ...item,
      sales_difference: item?.sales_difference ?? 0,
      utilidad: item?.utilidad ?? 0,
      storeName: store?.name ?? item?.store_name ?? '-',
      key: item?.key ?? car?.key ?? '-',
      investorName: investors.length > 0 ? investors[0]?.full_name ?? '-' : '-',
      sale_date_placeholder: '-',
      daysLabel: days != null && days !== '' ? `${days} dias` : '-',
      carData: car
        ? [car?.key, car?.make, car?.version, car?.model, car?.color].filter(Boolean).join(' ') || '-'
        : [
            item?.key,
            item?.make,
            item?.version,
            item?.model,
            item?.color,
          ].filter(Boolean).join(' ') || '-',
    };
  }
}
