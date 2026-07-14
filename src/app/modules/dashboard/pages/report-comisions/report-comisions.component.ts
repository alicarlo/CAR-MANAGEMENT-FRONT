import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { ReportComissionAutoComponent } from 'src/app/modules/dashboard/modals/report-comission-auto/report-comission-auto.component';
import { ReportComissionDownloadModalComponent } from 'src/app/modules/dashboard/modals/report-comission-download-modal/report-comission-download-modal.component';
import { StoreService } from 'src/app/core/services/store/store.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';

@Component({
  selector: 'app-report-comisions',
  imports: [CommonModule, LoadingComponent, MatDialogModule, MatIconModule, MatTooltipModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'report-comisions.component.html',
  styleUrl: './report-comisions.component.css'
})
export class ReportComisionsComponent {
  comisions: any[] = [];
  store: any[] = [];
  filteredStore: any[] = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';
  store_id: any = null;
  date_from: string = '';
  date_to: string = '';

  loadingModal = false;
  loadingMore = false;
  loadingAll = false;
  downloadingExcel = false;
  error = false;
  hasMorePages = false;
  total = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 20;
  filter: any = {};

  constructor(
    private reportsService: ReportsService,
    private toastrService: ToastrService,
    private matDialog: MatDialog,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    this.getStore();
    this.getComisionsReport();

    this.storeFilterControl.valueChanges.subscribe((term) => {
      const value = (term || '').toString().toLowerCase().trim();
      this.filteredStore = this.store.filter((data: any) =>
        `${data.name}`.toLowerCase().includes(value)
      );
    });
  }

  getComisionsReport(reset: boolean = true) {
    if (reset) {
      this.loadingModal = false;
      this.currentPage = 1;
      this.comisions = [];
      this.hasMorePages = false;
    } else {
      this.loadingMore = true;
    }

    this.error = false;

    this.reportsService.getComisionsReports(this.pageSize, this.currentPage, this.filter, this.date_from, this.date_to).subscribe({
      next: (response: any) => {
        console.log('commission report response', response);
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

        const normalizedItems = items.map((item: any) => this.normalizeRow(item));
        this.comisions = reset ? normalizedItems : [...this.comisions, ...normalizedItems];

        const pagination = response?.pagination ?? {};
        this.total = pagination.total_items ?? this.comisions.length;
        this.totalPages = pagination.total_pages ?? (this.comisions.length ? 1 : 0);
        this.currentPage = pagination.current_page ?? this.currentPage;
        this.hasMorePages = pagination.has_next ?? this.currentPage < this.totalPages;

        setTimeout(() => {
          this.loadingModal = true;
          this.loadingMore = false;
        }, 400);
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this.loadingModal = true;
        this.loadingMore = false;
        this.error = true;
        this.toastrService.error(err.error, 'Error');
      },
    });
  }

  loadMore() {
    if (this.loadingMore || this.loadingAll || !this.hasMorePages) return;
    this.currentPage += 1;
    this.getComisionsReport(false);
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

  openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  filterGo() {
    const storeFilter = Object.fromEntries(
      Object.entries({
        id: this.store_id,
      }).filter(([_, v]) => v != null && v !== '')
    );

    this.filter = Object.fromEntries(
      Object.entries({
        store: Object.keys(storeFilter).length ? storeFilter : null,
      }).filter(([_, v]) => v != null)
    );

    this.getComisionsReport();
  }

  clearFilters() {
    this.store_id = null;
    this.selectedStoreLabel = '';
    this.date_from = '';
    this.date_to = '';
    this.filter = {};
    this.getComisionsReport();
  }

  openAutosModal(row: any) {
    this.matDialog.open(ReportComissionAutoComponent, {
      disableClose: true,
      data: {
        row,
        sales: Array.isArray(row?.sales) ? row.sales : [],
      },
      panelClass: ['custom-dialog-container'],
      width: '90vw',
      height: '92vh',
      maxWidth: '90vw',
      maxHeight: '95vh',
    });
  }

  downloadFile() {
    if (this.downloadingExcel) return;

    if (this.comisions.length === 0) {
      this.toastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    if (!this.hasMorePages && this.comisions.length >= this.total) {
      this.exportToExcel(this.comisions);
      return;
    }

    const dialogRef = this.matDialog.open(ReportComissionDownloadModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-40'],
      width: '40vw',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'current') {
        this.exportToExcel(this.comisions);
      }

      if (result === 'all') {
        this.downloadAllForExcel();
      }
    });
  }

  async loadAll() {
    if (this.loadingMore || this.loadingAll || !this.hasMorePages) return;

    this.loadingAll = true;

    try {
      while (this.hasMorePages) {
        this.currentPage += 1;
        await this.getComisionsReportPage(this.currentPage);
      }
    } finally {
      this.loadingAll = false;
    }
  }

  private getComisionsReportPage(page: number) {
    return new Promise<void>((resolve) => {
      this.reportsService.getComisionsReports(this.pageSize, page, this.filter, this.date_from, this.date_to).subscribe({
        next: (response: any) => {
          console.log('commission report response', response);
          const items = Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response)
              ? response
              : [];

          const normalizedItems = items.map((item: any) => this.normalizeRow(item));
          this.comisions = [...this.comisions, ...normalizedItems];

          const pagination = response?.pagination ?? {};
          this.total = pagination.total_items ?? this.comisions.length;
          this.totalPages = pagination.total_pages ?? this.totalPages;
          this.currentPage = pagination.current_page ?? page;
          this.hasMorePages = pagination.has_next ?? this.currentPage < this.totalPages;
          resolve();
        },
        error: (err) => {
          if (err.error !== 'Token expired') {
            this.error = true;
            this.toastrService.error(err.error, 'Error');
          }
          this.hasMorePages = false;
          resolve();
        },
      });
    });
  }

  private async downloadAllForExcel() {
    if (this.downloadingExcel) return;

    this.downloadingExcel = true;

    try {
      const allItems: any[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await this.getComisionsResponseForExcel(page);
        const items = Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

        allItems.push(...items.map((item: any) => this.normalizeRow(item)));

        const pagination = response?.pagination ?? {};
        hasNext = pagination.has_next ?? false;
        page += 1;
      }

      this.exportToExcel(allItems);
    } finally {
      this.downloadingExcel = false;
    }
  }

  private getComisionsResponseForExcel(page: number) {
    return new Promise<any>((resolve) => {
      this.reportsService.getComisionsReports(this.pageSize, page, this.filter, this.date_from, this.date_to).subscribe({
        next: (response: any) => {
          resolve(response);
        },
        error: (err) => {
          if (err.error !== 'Token expired') {
            this.toastrService.error(err.error, 'Error');
          }
          resolve({ items: [], pagination: { has_next: false } });
        },
      });
    });
  }

  private exportToExcel(items: any[]) {
    if (!items.length) {
      this.toastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    this.downloadingExcel = true;

    const dataPush = items.map((item: any) => ({
      'Asesor': item.full_name ?? '-',
      'Ventas realizadas': item.ventas_realizadas ?? '-',
      'Comision total': item.comision_total ?? '-',
      'Bonos obtenidos': item.bonos_obtenidos ?? '-',
    }));

    const binaryWS = XLSX.utils.json_to_sheet(dataPush);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Reporte comisiones');
    XLSX.writeFile(wb, `Reporte-comisiones-${moment().format('DD-MM-YYYY')}.xlsx`);
    this.toastrService.success('Descarga exitosa', 'Mensaje');
    this.downloadingExcel = false;
  }

  private normalizeRow(item: any) {
    return {
      ...item,
      full_name: item?.full_name ?? '-',
      ventas_realizadas: item?.ventas_realizadas ?? '-',
      comision_total: item?.comision_total ?? null,
      bonos_obtenidos: this.formatBonuses(item?.bonos_obtenidos),
    };
  }

  private formatBonuses(bonuses: any) {
    if (!bonuses || typeof bonuses !== 'object' || Array.isArray(bonuses)) {
      return '-';
    }

    const values = Object.entries(bonuses)
      .map(([key, value]) => value == null || value === '' ? null : `${key}: ${value}`)
      .filter(Boolean);

    return values.length ? values.join(', ') : '-';
  }
}
