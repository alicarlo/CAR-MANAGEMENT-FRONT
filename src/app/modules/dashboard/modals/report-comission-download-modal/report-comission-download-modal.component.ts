import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-report-comission-download-modal',
  imports: [CommonModule, MatDialogModule, ButtonComponent],
  templateUrl: './report-comission-download-modal.component.html',
  styleUrl: './report-comission-download-modal.component.css'
})
export class ReportComissionDownloadModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ReportComissionDownloadModalComponent>
  ) {}

  downloadCurrent() {
    this.dialogRef.close('current');
  }

  downloadAll() {
    this.dialogRef.close('all');
  }
}
