import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPrintDirective, NgxPrintService } from 'ngx-print';
import moment from 'moment';

@Component({
  selector: 'app-ticket-print-modal',
   imports: [
    NgxPrintDirective,
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './ticket-print-modal.component.html',
  styleUrl: './ticket-print-modal.component.css'
})
export class TicketPrintModalComponent {
  loading: boolean = false
  currentDate: any = moment().format('l');
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<TicketPrintModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _printerService: NgxPrintService
  ) {

  }

  printDiv() {
    // this._printerService.print('printDiv');
  }
}
