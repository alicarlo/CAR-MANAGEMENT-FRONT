import { Component, model } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { TypeExpense } from 'src/app/core/models/typeExpense.model';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { TypeExpenseModalComponent } from '../../modals/type-expense-modal/type-expense-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ShoppingModalComponent } from '../../modals/shopping-modal/shopping-modal.component';
import { PaymentsAddModalComponent } from '../../modals/payments-add-modal/payments-add-modal.component';
import { PaymentsShowModalComponent } from '../../modals/payments-show-modal/payments-show-modal.component';
import { ArrivalreviewService } from 'src/app/core/services/arrivalReview/arrivalreview.service';
import { ArrivalReviewModalComponent } from '../../modals/arrival-review-modal/arrival-review-modal.component';
import { CarsService } from 'src/app/core/services/cars/cars.service';
// ArrivalReviewModalComponent

@Component({
  selector: 'app-arrival-review',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './arrival-review.component.html',
  styleUrl: './arrival-review.component.css'
})
export class ArrivalReviewComponent {
  arrival: any[] = [];
  carsSelected: TypeExpense | undefined;
  carsHeader: string[] = ['Clave','Auto','Tipo de auto', 'Fecha de llegada'];
  columns: any = [
    { key: 'key', type: 'text' },
    { key: 'car', type: 'text' },
    //{ key: 'make', type: 'text' },
    { key: 'car_type', type: 'text' },
    // { key: 'version', type: 'text' },
    // { key: 'model', type: 'text' },
    // { key: 'color', type: 'text' },
    { key: 'arrived_at', type: 'dob' },
  ]
  readonly actions: RowAction[] = [
    { icon: 'add',  id: 'add',  label: 'Revision de Auto' },
  ];
  items: any[] = [];
  nextCursor: { name: string; idDocStudent: string } | null | undefined = null;
  prevCursor: { name: string; idDocStudent: string } | null = null;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  currentPage = 1;

  loading: boolean = true;
  error: boolean = false;
  hasNext: boolean = false
  hasPrev: boolean = false;

  anchorsNext: Array<any | undefined> = []; 
  anchorsPrev: Array<any | undefined> = []; 

  private query$ = new Subject<string>();

  pages: number = 0;
  cars: any[] = []

  
  constructor(
    private _MatDialog: MatDialog,
    private _TypeExpenseService: TypeExpenseService,
    private _ToastrService: ToastrService,
    private _ArrivalreviewService: ArrivalreviewService,
    private _CarsService: CarsService
  ) {}

  ngOnInit() {
    // this.getArrival();
    this.getCars();
  }
  

  onRowAction(e: RowActionEvent<any>) {
    /*if (e.id === 'search') this.openShowModal(e.id,e.row);
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
    if (e.id === 'add')  this.openAddModal(e.id,e.row);
    */

     if (e.id === 'add')  this.openModal(e.id,e.row);
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
    this.getArrival();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getArrival();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getArrival();
  }


  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(ArrivalReviewModalComponent, {
      disableClose: true,
      data: dataSend,
      panelClass: ['custom-dialog-container', 'dialog-checks' ],
      width: '50vw',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getCars();
      }
    });
  }

  getArrival() {
    this.loading = false;
    this._ArrivalreviewService.getArrival(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.arrival = response.items.map((r: any) => ({ ...r, 
            make: r.car.make, 
            car_type: r.car.car_type.name, 
            line: r.car.version, 
            model: r.car.model, 
            color: r.car.color, 
            arrived_at: r.car.arrived_at,  }));
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

  getCars() {
    this._CarsService.getCars('',500, 1, 'pendiente_revision').subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ 
            ...r,
            car_type: r.car_type.name, 
            car:  `${r.make } ${r.version} ${r.model } ${r.color }`
          }));
          this.total = response.pagination.total_items;
        }

        console.log(this.cars)
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }
}
