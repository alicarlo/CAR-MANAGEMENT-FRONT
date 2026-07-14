import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-floor-time-bills-show-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule],
  templateUrl: './floor-time-bills-show-modal.component.html',
  styleUrl: './floor-time-bills-show-modal.component.css'
})
export class FloorTimeBillsShowModalComponent {
  bills: any[] = [];
  totalBills = 0;

  constructor(
    @Optional() public dialogRef: MatDialogRef<FloorTimeBillsShowModalComponent> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const sourceBills = Array.isArray(this.data?.bills) ? this.data.bills : [];
    this.bills = sourceBills.map((item: any) => ({ ...item }));
    this.totalBills = this.bills.reduce((sum: number, item: any) => {
      const value = Number(item?.total ?? item?.amount ?? 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }


  get sum() {
    const cost = Number(this.data?.auto?.cost_net);
    return this.totalBills + (isNaN(cost) ? 0 : cost);
  }
  getStatusLabel(status: any) {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'active') return 'Activo';
    if (normalized === 'inactive') return 'Inactivo';
    return '-';
  }
}
