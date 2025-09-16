import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { Role } from 'src/app/core/models/auth.model';
import { RoleModalComponent } from '../../modals/role-modal/role-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { RolesService } from 'src/app/core/services/roles/roles.service';

@Component({
  selector: 'app-roles',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {
  rolesSelected: Role | undefined;
  roles: Role[] = [];
  rolesHeader: string[] = ['Nombre','Descripcion','Listado'];
  columns: any = [
    { key: 'name', type: 'text' },
    { key: 'descriptions', type: 'text' },
    { key: 'scope_id', type: 'text' },
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

  anchorsNext: Array<any | undefined> = []; // cursor para ir de p -> p+1
  anchorsPrev: Array<any | undefined> = []; // cursor para ir de p -> p-1

  private query$ = new Subject<string>();

  pages: number = 0;
  constructor(
    private _MatDialog: MatDialog,
    private _RolesService: RolesService,
    private _ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getRoles();
  }
  
  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
  }

  openModal(action: string, data: any) {
    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(RoleModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container', 'dialog-90'],
      data: dataSend,
      width: '90vw',
      height: '90vh',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getRoles();
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
        await this.deleteRole(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getRoles();
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
    this.getRoles();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getRoles();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getRoles();
  }

  getRoles() {
    this.loading = false;
    this._RolesService.getRoles(this.pageSize, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
  
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.roles = response.items.map((r: any) => ({ ...r }));
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

  async deleteRole(id: string) {
    return new Promise((resolve, reject) => {
      this._RolesService.deleteRole(id).subscribe({
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
