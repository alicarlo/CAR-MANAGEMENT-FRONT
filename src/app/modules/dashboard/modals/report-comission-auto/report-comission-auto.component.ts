import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-report-comission-auto',
  imports: [CommonModule, MatDialogModule, ButtonComponent],
  templateUrl: './report-comission-auto.component.html',
  styleUrl: './report-comission-auto.component.css'
})
export class ReportComissionAutoComponent {
  autos: any[] = [];

  constructor(
    @Optional() public dialogRef: MatDialogRef<ReportComissionAutoComponent> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const sales = Array.isArray(this.data?.sales) ? this.data.sales : [];
    this.autos = sales.map((sale: any) => this.normalizeSale(sale));
  }

  private normalizeSale(sale: any) {
    const car = sale?.car ?? {};
    const investors = Array.isArray(car?.investors) ? car.investors : [];
    const investorNames = investors
      .map((investor: any) => investor?.full_name)
      .filter(Boolean)
      .join(', ');

    const auto = [
      car?.make,
      car?.model,
      car?.version,
      car?.color,
    ].filter(Boolean).join(' ');

    return {
      created_at: sale?.created_at ?? null,
      key: car?.key ?? '-',
      investors: investorNames || '-',
      auto: auto || '-',
      comission: car?.comission ?? car?.comision ?? null,
      bonus: car?.bono ?? '-',
    };
  }
}
