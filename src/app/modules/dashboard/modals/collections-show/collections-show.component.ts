import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CollectionAddPaymentInstallmentModalComponent } from '../collection-add-payment-installment-modal/collection-add-payment-installment-modal.component';
import { IncomeModalComponent } from '../income-modal/income-modal.component';
import { a } from 'node_modules/@angular/material/icon-registry.d-BVwP8t9_';
import { CollectionExtensionDateModalComponent } from '../collection-extension-date-modal/collection-extension-date-modal.component';

@Component({
  selector: 'app-collections-show',
   imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './collections-show.component.html',
  styleUrl: './collections-show.component.css'
})
export class CollectionsShowComponent {
  loadingModal: boolean = false;
  income: any[] = [];
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CollectionsShowComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,

  ) { 
     data.row.installments_data = data.row.installments_data.sort(
        (a: any, b: any) => Number(b.paid) - Number(a.paid)
      );
    setInterval(() => {
      this.loadingModal = true;
    },500)
  }

  get totalInstallmentsAmount(): number {
    return (this.data.row.installments_data || []).reduce(
      (acc: number, item: any) => acc + (Number(item.amount) || 0),
      0
    );
  }

  incomeAmount(data: any) {
    return (data.incomes || []).reduce(
      (acc: number, item: any) => acc + (Number(item.amount) || 0),
      0
    );
  }

  /*openShowModal(item: any, flag: any) {
    let dataSend = { itemSelected: item, flag , data: this.data.row.installments_data };
    const dialogRef = this._MatDialog.open(CollectionAddPaymentInstallmentModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }
  */

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }


  openExtensionModal(data: any) {
    let dataSend = {row: data, flag: 1};
    const dialogRef = this._MatDialog.open(CollectionExtensionDateModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.close(true);;
      }
    });
  }

  openShowModal(item: any, flag: any) {
    // let dataSend = {action, row: data, flag: 1};
    let dataSend = { action: 'add', itemSelected: item, flag , data: this.data.row.installments_data };
    const dialogRef = this._MatDialog.open(IncomeModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.close(true);
      }
    });
  }
}
