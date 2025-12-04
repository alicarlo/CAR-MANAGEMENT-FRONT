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
  selector: 'app-car-bills-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './car-bills-show-modal.component.html',
  styleUrl: './car-bills-show-modal.component.css'
})
export class CarBillsShowModalComponent {
  loadingModal: boolean = false;
  bills: any[] = [];

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CarBillsShowModalComponent> | null, 
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
    this.getBillsCar();
    console.log(this.data)
  }


  getBillsCar() {
    this._BillService.getBillCar(this.data.row.id,500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.bills = response.items.map((r: any) => ({ ...r}));
          this.loadingModal = true;
        }
        this.loadingModal = true;
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }
}
