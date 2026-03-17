import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

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
}
