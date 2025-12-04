import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsService } from 'src/app/core/services/documents/documents.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { PaymentsAddModalComponent } from '../payments-add-modal/payments-add-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-bill-payments-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './bill-payments-show-modal.component.html',
  styleUrl: './bill-payments-show-modal.component.css'
})
export class BillPaymentsShowModalComponent {
loadingModal: boolean = false;
  payments: any[] = [];

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<BillPaymentsShowModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _DocumentsService: DocumentsService,
    private _ToastrService: ToastrService,
    private _ShopingService: ShopingService,
    private _MatDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.data.flag === 0) {
      this.getPaymentsBills();
    } else {
      this.getPayments();
    }
  }

  getPayments() {
    this.loadingModal = false;
    this._ShopingService.getPayment(500, 1, this.data.row.id).subscribe({
      next: async (response: any) => {
        if(response) {
          this.payments = response.items.map((r: any) => ({ ...r}));
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

  getPaymentsBills() {
    this.loadingModal = false;
    this._ShopingService.getPaymentBill(500, 1, this.data.row.id).subscribe({
      next: async (response: any) => {
        if(response) {
          this.payments = response.items.map((r: any) => ({ ...r}));
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


  actionModal(flag: number,action: string, data: any, msg: string, color: string = '!text-blue-500', icon = 'cloud_download') {
      color = flag === 1 ? '!text-blue-500' : '!text-red-500';  
      icon = flag === 1 ? 'cloud_download' : 'delete';
      let dataSend = {action, row: data, msg, color, icon};
      const ref: any = this._MatDialog.open(ActionMessageComponent, {
        data: dataSend,
        disableClose: true,
        panelClass: ['custom-dialog-container', 'dialog-40'],
        width: '40vw',
        height: '40vh',
        maxWidth: '40vw'
      });
  
      ref.componentInstance.accept.subscribe(async () => {
        ref.componentInstance.loading = true;
        try {
          if (flag === 1) await this.downloadDirect(data.document.url, data.document.name);
          if (flag === 2) await this.deletePayment(data.id);
          ref.componentInstance.loading = false;
          ref.close(true);

          if (flag === 2) {
            this.getPayments();
          }
        } catch {
          ref.componentInstance.loading = false;
        }
      });
    }
  

  async downloadDirect(url: string, filename?: string) {
     window.open(url, '_blank', 'noopener,noreferrer');
     return;
  }

  async deletePayment(id: string) {
    return new Promise((resolve, reject) => {
      this._ShopingService.deletePayment(id).subscribe({
        next: async (response: any) => {
          if(response) {
          this._ToastrService.success('Eliminado con exito', 'Exito');
          resolve(true);
          }
        },
        error: (err) => {
          reject(err);
          // this._ToastrService.error(err.error, 'Error');

        },
      })
    })
  }

  openAddModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(PaymentsAddModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPayments();
      }
    });
  }

}