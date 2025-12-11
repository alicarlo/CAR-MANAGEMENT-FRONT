import { Component } from '@angular/core';
// import { CLIENTS, clientsHeader } from 'src/app/core/constants/client';
import { Clients } from 'src/app/core/models/clients.model';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientsModalComponent } from '../../modals/clients-modal/clients-modal.component';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/core/services/documents/documents.service';
import { DocumentsModalComponent } from '../../modals/documents-modal/documents-modal.component';


@Component({
  selector: 'app-documents',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {
  documentsSelected: any;
  documents: any[] = [];
  documentsHeader: string[] = ['Clave','Auto','Nombre', 'Descripcion', 'Tipo de documento','Estatus'];
  columns: any = [
    { key: 'key', type: 'text' },
    { key: 'car', type: 'text' },
    /*{ key: 'make', type: 'text' },
    { key: 'line', type: 'text' },
    { key: 'model', type: 'text' },
    { key: 'color', type: 'text' },
     */
    { key: 'name', type: 'text' },
    { key: 'descriptions', type: 'area' },
    { key: 'document_type', type: 'text' },
    { key: 'status', type: 'translate-text' },
  ]

  readonly actions: RowAction[] = [
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
    private _ClientsService: ClientsService,
    private _ToastrService: ToastrService,
    private _DocumentsService: DocumentsService

  ) {}

  ngOnInit() {
    this.getDocuments();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
  }

  getDocuments() {
    this.loading = false;
    this._DocumentsService.getDocuments(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {

          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.documents = response.items.map((r: any) => ({ 
            ...r, 
            document_type: r.document_type.name,
            key: r.cars.length > 0 ? r.cars[0].key : '',
            /*make: r.cars.length > 0 ? r.cars[0].make : '', 
            line: r.cars.length > 0 ? r.cars[0].version : '', 
            model: r.cars.length > 0 ? r.cars[0].model : '', 
            color: r.cars.length > 0 ? r.cars[0].color : '', 
            */
           car:  r.cars.length > 0 ?  `${r.cars[0].make } ${r.cars[0].version} ${r.cars[0].model } ${r.cars[0].color }` : '-'
          }));
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

  async searchData(event: any) {
    if (!event) {

      return;
    }

    if (event.length < 3) return;
    this.query$.next((event));
  }

  changePageNextPrev(event: any) {
    this.currentPage = event === 'next' ? ++this.currentPage : --this.currentPage;
    this.getDocuments();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getDocuments();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getDocuments();
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(DocumentsModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-66'],
      data: dataSend,
      width: '60vw',
      height: '90vh',
      maxWidth: '60vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDocuments();
      }
    });
  }

  actionModal(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {
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
        await this.deleteDocument(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getDocuments();
      } catch {
        ref.componentInstance.loading = false;
      }
    });
  }

  async deleteDocument(id: string) {
    return new Promise((resolve, reject) => {
      this._DocumentsService.deleteDocuments(id).subscribe({
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
}
