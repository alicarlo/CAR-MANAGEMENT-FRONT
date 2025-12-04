import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-investment-car-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './investment-car-show-modal.component.html',
  styleUrl: './investment-car-show-modal.component.css'
})
export class InvestmentCarShowModalComponent {
  loadingModal: boolean = false;
  cars: any[] = [];

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<InvestmentCarShowModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    // private _DocumentsService: DocumentsService,
    private _ToastrService: ToastrService,
    // private _ShopingService: ShopingService,
    private _MatDialog: MatDialog,
    private _BillService: BillService,
    private _CarsService: CarsService
  ) { 

  }

  ngOnInit(): void {
    this.getInvestorCars();
  }

  getPayments() {
    this.loadingModal = false;
    this._BillService.getBillCar('',500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ ...r}));
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

  getInvestorCars() {
    this.loadingModal = false;
    this._CarsService.getCarInvestor(this.data.row.id,500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ ...r}));
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
