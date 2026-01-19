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
  selector: 'app-arrive-check-car-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './arrive-check-car-modal.component.html',
  styleUrl: './arrive-check-car-modal.component.css'
})
export class ArriveCheckCarModalComponent {

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<ArriveCheckCarModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,
    private _BillService: BillService,
    private _CarsService: CarsService,
    private _ShopingService: ShopingService
  ) { }
}
