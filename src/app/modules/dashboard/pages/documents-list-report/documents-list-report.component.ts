import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { TypeDocumentsService } from 'src/app/core/services/typeDocuments/type-documents.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import * as XLSX from "xlsx";


@Component({
  selector: 'app-documents-list-report',
  imports: [LoadingComponent, NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './documents-list-report.component.html',
  styleUrl: './documents-list-report.component.css'
})
export class DocumentsListReportComponent {
  loadingModal: boolean = false;
  typeDocument: any = [];
  store: any = [];
  carType: any = [];
  investor: any = []; 
  list: any = [];

  document_id: any = null;
  store_id: any = null;
  car_type_id: any = null;
  investor_id: any = null;

  typeCars: any = [];
  // car_type_id: any = null;

  status = ['venta', 'apartado']; 
  statusSelected: any = null;

  filter: any = {};
  filteredStore: any = [];
  storeFilterControl = new FormControl('');
  storeDropdownOpen = false;
  selectedStoreLabel = '';

  filteredCarType: any = [];
  carTypeFilterControl = new FormControl('');
  carTypeDropdownOpen = false;
  selectedCarTypeLabel = '';

  filteredInvestor: any = [];
  investorFilterControl = new FormControl('');
  investorDropdownOpen = false;
  selectedInvestorLabel = '';

  filteredTypeDocument: any = [];
  typeDocumentFilterControl = new FormControl('');
  typeDocumentDropdownOpen = false;
  selectedTypeDocumentLabel = '';


  documentColumns: any[] = [];

  isDown = false;
  startX = 0;
  scrollLeft = 0;
  constructor(
    private _ReportsService: ReportsService,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService,
    private _TypeCarsService: TypeCarsService,
    private _TypeDocumentsService: TypeDocumentsService,
    private _InvestorService: InvestorService
  ) { }


  onMouseDown(e: MouseEvent, container: HTMLElement) {
  this.isDown = true;
  this.startX = e.pageX - container.offsetLeft;
  this.scrollLeft = container.scrollLeft;
}

onMouseLeave() {
  this.isDown = false;
}

onMouseUp() {
  this.isDown = false;
}

onMouseMove(e: MouseEvent, container: HTMLElement) {
  if (!this.isDown) return;

  e.preventDefault();

  const x = e.pageX - container.offsetLeft;
  const walk = (x - this.startX) * 1.5;

  container.scrollLeft = this.scrollLeft - walk;
}

  ngOnInit() { 
    this.getInvestor();
    this.getTypeCar();
    this.getStore();
    this.getTypeDocument();
    this.getReports();

     this.typeDocumentFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredTypeDocument = this.typeDocument.filter((data: any) => {
        const text = `${data.name}`.toLowerCase();
        return text.includes(value);
      });
    });


     this.investorFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredInvestor = this.investor.filter((data: any) => {
        const text = `${data.full_name}`.toLowerCase();
        return text.includes(value);
      });
    });

    this.storeFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredStore = this.store.filter((data: any) => {
        const text = `${data.name}`.toLowerCase();
        return text.includes(value);
      });
    });

    this.carTypeFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredCarType = this.carType.filter((data: any) => {
        const text = `${data.name}`.toLowerCase();
        return text.includes(value);
      });
    });
  }

  getDocument(docs: any[], name: string) {
    return docs?.find(d => d.name === name);
  }

  async getReports() {
    this.loadingModal = false;
    return new Promise((resolve, reject) => {
      this._ReportsService.getReportsDocuments(this.filter).subscribe({
        next: (response: any) => {
          if(response) {
            this.list = response.items.map((r: any) => ({ 
              ...r,
              carData: `${r.make } ${r.version} ${r.model } ${r.color }`
            }));
            this.documentColumns = [
              ...new Set(
                this.list.flatMap((item: any) =>
                  (item.documents || []).map((d: any) => d.name)
                )
              )
            ];
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

  getTypeDocument() {
    this._TypeDocumentsService.getTypeDocument(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeDocument = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  getStore() {
    this._StoreService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStore = [...this.store];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getTypeCar() {
    this._TypeCarsService.getTypeCar(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.carType = response.items.map((r: any) => ({ ...r }));
          this.filteredCarType = [...this.carType];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

   getInvestor() {
    this._InvestorService.getInvestor(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
          this.filteredInvestor = [...this.investor];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  filterGo() {
    const rawFilter = {
      document_type_id: this.document_id,
      store_id: this.store_id,
      car_type_id: this.car_type_id,
      investor_id: this.investor_id
    };

    this.filter = Object.fromEntries(
      Object.entries(rawFilter).filter(([_, v]) => v != null && v !== '')
    );

    this.getReports();
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

  toggleCarTypeDropdown() {
    this.carTypeDropdownOpen = !this.carTypeDropdownOpen;
    if (this.carTypeDropdownOpen) {
      this.carTypeFilterControl.setValue('');
      this.filteredCarType = [...this.carType];
    }
  }

   closeCarTypeDropdown() {
    this.carTypeDropdownOpen = false;
  }

   selectCarType(data: any) {
    this.selectedCarTypeLabel = data !== null ? `${data.name}` : 'Todos';
    this.car_type_id = data !== null ? data.id : '';
    
    this.closeCarTypeDropdown();
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


  toggleTypeDocumentDropdown() {
    this.typeDocumentDropdownOpen = !this.typeDocumentDropdownOpen;
    if (this.typeDocumentDropdownOpen) {
      this.typeDocumentFilterControl.setValue('');
      this.filteredTypeDocument = [...this.typeDocument];
    }
  }

   closeTypeDocumentDropdown() {
    this.typeDocumentDropdownOpen = false;
  }

   selectTypeDocument(data: any) {
    this.selectedTypeDocumentLabel = data !== null ? `${data.name}` : 'Todos';
    this.document_id = data !== null ? data.id : '';
    
    this.closeTypeDocumentDropdown();
  }
}
