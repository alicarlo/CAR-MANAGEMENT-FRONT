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

@Component({
  selector: 'app-history-income-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule
  ],
  templateUrl: './history-income-modal.component.html',
  styleUrl: './history-income-modal.component.css'
})
export class HistoryIncomeModalComponent {
  loadingModal: boolean = false;
  history: any = [];
  totalBefore = 0;
  totalNewPrice = 0;
  globalPercentage = 0;
  globalStats: any = {};
  constructor(
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<HistoryIncomeModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,
    private _LaywayService: LaywayService,
    private _IncomeService: IncomeService
  ) { }

  ngOnInit(): void {
    this.getIncomesHistory();
  }


  getIncomesHistory() {
    this.loadingModal = false;
    this._LaywayService.getCarHistory(this.data.row.id,500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.history = response.items.map((r: any) => {
          const before = Number(r.change?.before_price ?? 0);
          const newPrice = Number(r.change?.new_price ?? 0);

          const percentageChange = before !== 0
            ? Math.round(((newPrice - before) / before) * 100)
            : 0;

          return {
            ...r,
            before,
            newPrice,
            percentageChange
          };
        });

        const first = this.history[0];
        const last  = this.history[this.history.length - 1];

        const globalNewPrice = Number(first?.newPrice ?? first?.change?.new_price ?? 0);
        const globalBefore   = Number(last?.before ?? last?.change?.before_price ?? 0);

        const globalPercent = globalBefore !== 0
          ? Math.round(((globalNewPrice - globalBefore) / globalBefore) * 100)
          : 0;

        this.globalStats = {
          before: globalBefore,
          newPrice: globalNewPrice,
          percent: globalPercent
        };
        }
        
        this.loadingModal = true;
      },
      error: (err) => {
        this.loadingModal = true;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
    
  }
}
