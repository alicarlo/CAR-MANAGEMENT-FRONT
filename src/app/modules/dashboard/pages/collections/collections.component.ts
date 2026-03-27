import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { SalesService } from 'src/app/core/services/sales/sales.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { CollectionsShowComponent } from '../../modals/collections-show/collections-show.component';

@Component({
  selector: 'app-collections',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent {
  collections: any[] = [];
  collectionsHeader: string[] = [
    'Fecha de venta',
    'Auto', 
    'Cliente',
    'Total de la venta', 
    'Total de pagos pendientes', 
    'Estatus'
  ];

  columns: any = [
    { key: 'date_delivery', type: 'dob' },
    { key: 'carData', type: 'text' },
    { key: 'client.full_name', type: 'text' },
    { key: 'amount_sale', type: 'money' },
    { key: 'installmentsSize', type: 'text' },
    { key: 'status', type: 'translate-text' },
  ]

  readonly actions: RowAction[] = [
    { icon: 'search',  id: 'search',  label: 'Visualizar Pagos por cobrar' },
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
  ref: any;

  clientData: any[] = [];
  selectFilter: any;
  constructor(
    private _MatDialog: MatDialog,
    private _ToastrService: ToastrService,
    private _ClientsService: ClientsService,
    private _SalesService: SalesService
  ) {}

  ngOnInit() {
    // this.loading = true
    this.getClients();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'search') this.openShowModal(e.id,e.row);
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
    this.getClassification();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getClassification();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getClassification();
  }

  getClients() {
    this._ClientsService.getClient(500, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
          this.clientData = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        // this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  selectOptionReturn(event: any) {
    this.selectFilter = event;
    this.getClassification();
  }

  getClassification() {
    this.loading = false;
    this._SalesService.getSalesClient(this.pageSize, this.currentPage, this.selectFilter.id).subscribe({
      next: async (response: any) => {
        if(response) {

          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.collections = response.items.map((r: any) => ({ 
            ...r,
              carData:  Object.keys(r.car).length > 0 ?  `${r.car.make } ${r.car.version} ${r.car.model } ${r.car.color }` : '-' ,
              amount_sale: r.amount_sale === null ? null : r.amount_sale,
              amount_down_payment: r.amount_down_payment === null ? null : r.amount_down_payment,
              installmentsSize: (r.installments_data || []).filter(
              (i: any) => i.paid === null || i.paid === false
            ).length
          }))

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

  openShowModal(action: string, data: any) {
    let dataSend = {action, row: data, flag: 0};
    const dialogRef = this._MatDialog.open(CollectionsShowComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-60'],
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getClassification();
      }
    });
  }

}
