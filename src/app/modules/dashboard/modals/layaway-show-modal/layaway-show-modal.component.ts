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
import { MatTooltipModule } from '@angular/material/tooltip';
import { LaywayService } from 'src/app/core/services/layway/layway.service';
import { IncomeModalComponent } from '../income-modal/income-modal.component';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { TicketPrintModalComponent } from '../ticket-print-modal/ticket-print-modal.component';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';

@Component({
  selector: 'app-layaway-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './layaway-show-modal.component.html',
  styleUrl: './layaway-show-modal.component.css'
})
export class LayawayShowModalComponent {
  loadingModal: boolean = false;
  income: any[] = [];
  totalLayaway: number = 0;
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<LayawayShowModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _DocumentsService: DocumentsService,
    private _ToastrService: ToastrService,
    private _ShopingService: ShopingService,
    private _MatDialog: MatDialog,
    private _LaywayService: LaywayService,
    private _IncomeService: IncomeService,
    private _PermissionsService: PermissionsService
  ) { 
  }

  ngOnInit(): void {
    this.getIncomes();
  }

  get canViewLayawayIncomes() {
    return this._PermissionsService.hasScopes(['INSTALLMENT', 'INSTALLMENT.GET', 'INCOME.LAYAWAY.GET', 'INCOME.GET']);
  }

  get canEditIncome() {
    return this._PermissionsService.hasScopes(['INSTALLMENT.UPDATE', 'INCOME.UPDATE']);
  }

  get canDeleteIncome() {
    return this._PermissionsService.hasScopes(['INSTALLMENT.DELETE', 'INCOME.DELETE']);
  }

  get canDownloadIncomeSupport() {
    return this._PermissionsService.hasScopes(['INSTALLMENT', 'INSTALLMENT.GET', 'INCOME.LAYAWAY.GET', 'INCOME.GET']);
  }


  getIncomes() {
    if (!this.canViewLayawayIncomes) {
      this.loadingModal = true;
      this.income = [];
      this.totalLayaway = 0;
      return;
    }

    this.loadingModal = false;
    this._LaywayService.getIncomeByLayawayId(this.data.row.id,500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.income = response.items.map((r: any) => (
            { ...r,
              seller: r.user.full_name,
              client: r.layaway.client.full_name,
              car: `${r.layaway.car.make} ${r.layaway.car.version} ${r.layaway.car.model} ${r.layaway.car.color}`,
              idIncome: r.id,
              income: r.amount,
              dateIncome: r.date_income
            })
          );
          this.totalLayaway = response.items.reduce((sum: any, item: any) => sum + item.amount, 0);
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

  openAddModal(action: string, data: any) {
    if (!this.canEditIncome) return;
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(IncomeModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIncomes();
      }
    });
  }

  openTicketModal(data: any) {
    if (!this.canDownloadIncomeSupport) return;
    let dataSend = {data, full: this.data.row, flag: 0};
    const dialogRef = this._MatDialog.open(TicketPrintModalComponent, {
      disableClose: true,
      data: dataSend,
      /// panelClass: ['custom-dialog-container', 'dialog-ticket'],
      panelClass: ['custom-dialog-container'],
      width: '100vw',
      height: '75vh',
      maxWidth: '100vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIncomes();
      }
    });
  }

  actionModal(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {
    if (!this.canDeleteIncome) return;
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


        await this.deleteIncome(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getIncomes();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async deleteIncome(id: string) {
    return new Promise((resolve, reject) => {      
      this._IncomeService.deleteIncome(id).subscribe({
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

  actionModalFile(flag: number,action: string, data: any, msg: string, color: string = '!text-blue-500', icon = 'cloud_download') {
    if (flag === 1 && !this.canDownloadIncomeSupport) return;
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
        ref.componentInstance.loading = false;
        ref.close(true);
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }
    
  async downloadDirect(url: string, filename?: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
