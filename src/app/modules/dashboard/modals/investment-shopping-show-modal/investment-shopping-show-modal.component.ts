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
  purchases: any[] = [];

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<InvestmentShoppingShowModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    // private _DocumentsService: DocumentsService,
    private _ToastrService: ToastrService,
    // private _ShopingService: ShopingService,
    private _MatDialog: MatDialog,
    private _BillService: BillService,
    private _CarsService: CarsService,
    private _ShopingService: ShopingService
  ) { 
 
  }


  ngOnInit(): void {
    // this. getInvestorPurchases();
    this.getInvestorBills();
    console.log(this.data);
  }


  getInvestorPurchases() {
    this.loadingModal = false;
    this._ShopingService.getInvestorPurchase(this.data.row.id,500, 1).subscribe({
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

   getInvestorBills() {
    this.loadingModal = false;
    this._BillService.getBillsInvestor(this.data.row.id,500, 1).subscribe({
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

}
