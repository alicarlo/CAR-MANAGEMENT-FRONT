import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { Investor } from 'src/app/core/models/investor.model';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { InvestorModalComponent } from '../../modals/investor-modal/investor-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { InvestmentCarShowModalComponent } from '../../modals/investment-car-show-modal/investment-car-show-modal.component';
import { InvestmentShoppingShowModalComponent } from '../../modals/investment-shopping-show-modal/investment-shopping-show-modal.component';

@Component({
  selector: 'app-investor',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './investor.component.html',
  styleUrl: './investor.component.css'
})
export class InvestorComponent {
  investorSelected: any;
  investor: Investor[] = [];
  investorHeader: string[] = ['Nombre','Inversión Inicial', '% Comisión' ,'Estatus'];
  columns: any = [
    { key: 'full_name', type: 'text' },
    { key: 'initial', type: 'money' },
    { key: 'commission', type: 'comas' },
    { key: 'status', type: 'translate-text' },
  ]

  readonly actions: RowAction[] = [
    { icon: 'directions_car',  id: 'search',  label: 'Visualizar Autos' },
    { icon: 'credit_card',  id: 'purchase',  label: 'Visualizar Gastos' },
    { icon: 'edit',  id: 'edit',  label: 'Editar' },
    { icon: 'delete', id: 'delete', label: 'Elimnar' },
  ];
  items: any[] = [];
  nextCursor: { name: string; idDocStudent: string } | null | undefined = null;
  prevCursor: { name: string; idDocStudent: string } | null = null;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  currentPage = 1;

  loading: boolean = false;
  error: boolean = false;
  hasNext: boolean = false
  hasPrev: boolean = false;

  anchorsNext: Array<any | undefined> = []; 
  anchorsPrev: Array<any | undefined> = [];

  private query$ = new Subject<string>();

  pages: number = 0;
  constructor(
    private _MatDialog: MatDialog,
    private _InvestorService: InvestorService,
    private _ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getInvestor();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'purchase') this.openShowPurchaseModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(InvestorModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container'],
      data: dataSend,
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getInvestor();
      }
    });
  }

  actionModal(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {

    let style = data === null ? 'dialog-40' : 'dialog-50';
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
        await this.deleteInvestor(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getInvestor();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async searchData(event: any) {
    if (!event) {

      return;
    }

    if (event.length < 3) return;
    this.query$.next((event));
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? ++this.currentPage : --this.currentPage;
    this.getInvestor();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getInvestor();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getInvestor();
  }

  getInvestor() {
    this.loading = false;
    this._InvestorService.getInvestor(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {

          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.investor = response.items.map((r: any) => ({ ...r }));
          this.total = response.pagination.total_items;
          setTimeout(() => {
            this.loading = true;  
          },400)
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  async deleteInvestor(id: string) {
    return new Promise((resolve, reject) => {
      this._InvestorService.deleteInvestor(id).subscribe({
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

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(InvestmentCarShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getInvestor();
      }
    });
  }

  openShowPurchaseModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(InvestmentShoppingShowModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getInvestor();
      }
    });
  }
}
