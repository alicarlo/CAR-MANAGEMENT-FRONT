import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment from 'moment';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ArriveCheckCarModalComponent } from '../../modals/arrive-check-car-modal/arrive-check-car-modal.component';
import { CarDocumentsShowModalComponent } from '../../modals/car-documents-show-modal/car-documents-show-modal.component';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-price-list-report',
  imports: [LoadingComponent, NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTooltipModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './price-list-report.component.html',
  styleUrl: './price-list-report.component.css'
})
export class PriceListReportComponent {
  downloadingExcel = false;
  loadingModal: boolean = false;
  list: any = [];
  total = 0;
  selectedRowKey: string | null = null;
  store: any = [];  
  store_id: any = null;

  typeCars: any = [];
  car_type_id: any = null;

  status = ['venta', 'apartado']; 
  statusSelected: any = null;

  filter: any = {};

  keyFilterControl = new FormControl('');
  makeFilterControl = new FormControl('');
  modelFilterControl = new FormControl('');
  colorFilterControl = new FormControl('');
  versionFilterControl = new FormControl('');
  constructor(
    private _ReportsService: ReportsService,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService,
    private _TypeCarsService: TypeCarsService,
    private _MatDialog: MatDialog
  ) { }

  ngOnInit() { 
    this.getTypeCar();
    this.getStore();
    this.getReports();
  }

  getStore() {
    this._StoreService.getStore(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.store = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getTypeCar() {
    this._TypeCarsService.getTypeCar(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeCars = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  async getReports() {
    this.loadingModal = false;
    this.selectedRowKey = null;
    return new Promise((resolve, reject) => {
      this._ReportsService.getReports(this.filter).subscribe({
        next: (response: any) => {
          if(response) {
            this.list = response.items.sort((a: any, b: any) =>
              (a.make || '').toLowerCase().localeCompare((b.make || '').toLowerCase())
            );
            this.total = response?.pagination?.total_items ?? this.list.length;
            this.loadingModal = true;
            resolve(true);
          }
        },
        error: (err) => {
          this.loadingModal = true;
          reject(err);
          // this._ToastrService.error(err.error, 'Error');
        },
      })
    })
  }

  filterGo() {
    const rawFilter = {
      store_id: this.store_id,
      car_type_id: this.car_type_id,
      status: this.statusSelected,
      key: this.keyFilterControl.value,
      make: this.makeFilterControl.value,
      model: this.modelFilterControl.value,
      version: this.versionFilterControl.value,
      color: this.colorFilterControl.value
    };

    this.filter = Object.fromEntries(
      Object.entries(rawFilter).filter(([_, v]) => v != null && v !== '')
    );

    this.getReports();
  }

  getCheckStore(data: any) {
    if (Object.keys(data).length == 0) {
      return '-'
    }
    return data.name;
  }

  formatCurrencyOrText(value: any) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    const normalized = String(value).replace(/,/g, '').trim();
    const numericValue = Number(normalized);

    if (!isNaN(numericValue) && normalized !== '') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    }

    return String(value);
  }

  getRowSelectionKey(item: any, index: number) {
    return String(item?.id ?? item?.key ?? `${item?.make ?? ''}-${item?.model ?? ''}-${index}`);
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

  openDocumentsModal(event: Event, item: any) {
    event.stopPropagation();

    this._MatDialog.open(CarDocumentsShowModalComponent, {
      disableClose: true,
      data: { action: 'documents', row: item },
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });
  }

  openArriveModal(event: Event, item: any) {
    event.stopPropagation();

    this._MatDialog.open(ArriveCheckCarModalComponent, {
      disableClose: true,
      data: { action: 'checkArrive', row: item, readOnly: true },
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });
  }
  getPreviousPrice(item: any) {
    const salePrev = item?.sale_prev;

    if (!salePrev || typeof salePrev !== 'object') {
      return null;
    }

    if (salePrev.before_price != null && Number(salePrev.before_price) !== 0) {
      return salePrev.before_price;
    }

    if (salePrev.new_price != null) {
      return salePrev.new_price;
    }

    return null;
  }

  downloadFile() {
    if (this.downloadingExcel) {
      return;
    }

    if(this.list.length  === 0) {
      this._ToastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    this.downloadingExcel = true;
    let dataPush = [];
    const currency = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
    for (const item of this.list) {
      dataPush.push({
        'Clave': item.key ?? '-',
        'Marca': item.make ?? '-',
        'Linea': item.version ?? '-',
        'Modelo': item.model ?? '-',
        'Color': item.color ?? '-',
        'Kilometraje': item.km ?? '-',
        'Sucursal': Object.keys(item.store).length == 0 ? '-' : item.store.name,
        'Precio actual': item.sale_price != null ? currency.format(item.sale_price) : '-',
        'Precio anterior': this.getPreviousPrice(item) != null ? currency.format(this.getPreviousPrice(item)) : '-',
        'Bono': this.formatCurrencyOrText(item.bono),
        'Comision': item.comision != null ? currency.format(item.comision) : '-',
        'Estatus': item.status ?? '-',
      });
    }

    let binaryWS = XLSX.utils.json_to_sheet(dataPush);
    var wb = XLSX.utils.book_new() ;
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Binary values');
    XLSX.writeFile(wb, `Reporte-${moment().format('DD/MM/YYYY')}.xlsx`);
    this.downloadingExcel = false;
    this._ToastrService.success('Descarga exitosa', 'Mensaje');
  }
}
