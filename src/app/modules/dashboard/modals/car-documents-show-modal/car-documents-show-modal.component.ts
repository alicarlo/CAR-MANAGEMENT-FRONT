import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';


@Component({
  selector: 'app-car-documents-show-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './car-documents-show-modal.component.html',
  styleUrl: './car-documents-show-modal.component.css'
})
export class CarDocumentsShowModalComponent {
  loadingModal: boolean = false;
  documents: any[] = [];

  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CarDocumentsShowModalComponent> | null, 
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
    this.getDocumentsCar();
  }


  getDocumentsCar() {
    this._CarsService.getCarDocuments(this.data.row.id,500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.documents = response.items.map((r: any) => ({ ...r}));
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
        if (flag === 1) await this.downloadDirect(data.url, data.name);
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
}
