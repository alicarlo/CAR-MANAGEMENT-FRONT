import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-price-list-report',
  imports: [LoadingComponent, NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './price-list-report.component.html',
  styleUrl: './price-list-report.component.css'
})
export class PriceListReportComponent {
  loadingModal: boolean = false;
  list: any = [];
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
    private _TypeCarsService: TypeCarsService
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
    return new Promise((resolve, reject) => {
      this._ReportsService.getReports(this.filter).subscribe({
        next: (response: any) => {
          if(response) {
            this.list = response.items.sort((a: any, b: any) =>
              (a.make || '').toLowerCase().localeCompare((b.make || '').toLowerCase())
            );
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

  downloadFile() {
    if(this.list.length  === 0) {
      this._ToastrService.warning('No hay datos para descargar', 'Mensaje');
      return;
    }

    let dataPush = [];
    const currency = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
    for (const item of this.list) {
      dataPush.push({
        'Clave': item.key,
        'Marca': item.make,
        'Linea': item.version,
        'Modelo': item.model,
        'Color': item.color,
        'Kilometraje': item.km,
        'Sucursal': Object.keys(item.store).length == 0 ? '' : item.store.name,
        'Precio de venta': item.sale_price != null ? currency.format(item.sale_price) : '',
        'Bono': item.bono != null ? currency.format(item.bono) : '',
        'Comision': item.comision,
        'Estatus:': item.status,
      });
    }

    let binaryWS = XLSX.utils.json_to_sheet(dataPush);
    var wb = XLSX.utils.book_new() ;
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Binary values');
    XLSX.writeFile(wb, `Reporte-${moment().format('DD/MM/YYYY')}.xlsx`); 
  }
}
