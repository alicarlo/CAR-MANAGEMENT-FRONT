import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-investment-shopping-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './investment-shopping-show-modal.component.html',
  styleUrl: './investment-shopping-show-modal.component.css'
})
export class InvestmentShoppingShowModalComponent {
  loadingModal: boolean = false;
  loadingMore: boolean = false;
  purchases: any[] = [];
  totalCars: any = null;
  currentPage: number = 1;
  pageSize: number = 20;
  hasMorePages: boolean = false;
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<InvestmentShoppingShowModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,
    private _BillService: BillService,
    private _CarsService: CarsService,
    private _ShopingService: ShopingService
  ) {}

  ngOnInit(): void {
    this.getInvestorBills();
  }


  getInvestorPurchases() {
    this.loadingModal = false;
    this._ShopingService.getInvestorPurchase(this.data.row.id, this.pageSize, 1).subscribe({
      next: async (response: any) => {
        if(response) {

          this.purchases = response.items.map((r: any) => ({ ...r}));
         
          this.loadingModal = true;
        }
      },
      error: (err) => {
        this.loadingModal = true;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getInvestorBills(reset: boolean = true) {
    if (reset) {
      this.loadingModal = false;
      this.currentPage = 1;
      this.purchases = [];
      this.totalCars = null;
      this.hasMorePages = false;
    } else {
      this.loadingMore = true;
    }

    this._BillService.getBillsInvestor(this.data.row.id, this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
          const items = response.items?.map((r: any) => ({ ...r})) ?? [];
          this.purchases = reset ? items : [...this.purchases, ...items];
          this.totalCars = this.purchases.reduce((sum: any, item: any) => sum + (Number(item.total) || 0), 0);
          this.hasMorePages = this.hasNextPage(response);
          this.loadingModal = true;
          this.loadingMore = false;
        }
      },
      error: (err) => {
        this.loadingModal = true;
        this.loadingMore = false;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  loadMoreBills() {
    if (this.loadingMore || !this.hasMorePages) return;
    this.currentPage += 1;
    this.getInvestorBills(false);
  }

  private hasNextPage(response: any): boolean {
    const pagination = response?.pagination;
    if (!pagination) return false;

    if (typeof pagination.has_next === 'boolean') return pagination.has_next;
    if (typeof pagination.hasNext === 'boolean') return pagination.hasNext;

    const currentPage = Number(pagination.current_page ?? pagination.currentPage ?? this.currentPage);
    const totalPages = Number(pagination.total_pages ?? pagination.totalPages ?? pagination.pages);

    return Number.isFinite(currentPage) && Number.isFinite(totalPages) && currentPage < totalPages;
  }
}
