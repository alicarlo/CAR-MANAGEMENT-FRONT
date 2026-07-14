import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RowAction, RowActionEvent } from 'src/app/core/models/actions.model';
import { Scopes } from 'src/app/core/models/scopes.model';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { ScopesModalComponent } from '../../modals/scopes-modal/scopes-modal.component';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ScopesService } from 'src/app/core/services/scopes/scopes.service';
import { PermissionsService } from 'src/app/core/services/permissions/permissions.service';

@Component({
  selector: 'app-scopes',
  imports: [CommonModule, TableComponent, MatDialogModule],
  templateUrl: './scopes.component.html',
  styleUrl: './scopes.component.css'
})
export class ScopesComponent {
  private readonly moduleLabelMap: Record<string, string> = {
    ARRIVAL: 'Revision de llegada',
    AUTH: 'Autenticacion',
    BILL: 'Gastos',
    CAR: 'Autos',
    CAR_HISTORY: 'Historial de autos',
    CATALOGOS: 'Catalogos',
    CLIENT: 'Clientes',
    COLLECTION: 'Cobranza',
    COLLECTIONS: 'Cobranza',
    CONTRACT: 'Contratos',
    DOCUMENTS: 'Documentos',
    INCOME: 'Ingresos',
    INSTALLMENT: 'Abonos',
    INVESTOR: 'Inversionistas',
    LAYAWAY: 'Apartados',
    PAYMENT: 'Pagos',
    PURCHASE: 'Compras',
    REPORTS: 'Reportes',
    ROLE: 'Roles',
    SALE: 'Ventas',
    SCOPE: 'Permisos',
    STORE: 'Sucursales',
    USER: 'Usuarios',
  };

  private readonly nestedLabelMap: Record<string, string> = {
    BILL: 'Gastos',
    BILL_TYPE: 'Tipos de gastos',
    CAR: 'Autos',
    CAR_TYPE: 'Tipos de autos',
    CLASSIFICATION_BILL: 'Clasificaciones de gastos',
    CLIENT: 'Cliente',
    COMISIONES: 'Reporte de comisiones',
    DOCUMENT: 'Documentos',
    DOCUMENT_TYPE: 'Tipos de documentos',
    INVESTOR: 'Inversionistas',
    LAYAWAY: 'Apartados',
    LISTADO_DOCUMENTOS: 'Listado de documentos',
    LISTADO_PRECIOS: 'Listado de precios',
    PAYMENT: 'Pagos',
    PAYMENT_METHOD: 'Tipos de pagos',
    ROLE: 'Roles',
    SALE: 'Ventas',
  };

  scopesSelected: Scopes | undefined;
  scopes: Scopes[] = [];
  scopesHeader: string[] = ['Modulo', 'Submodulo', 'Tipo', 'Permiso', 'Scope original', 'Estatus'];
  columns: any = [
    { key: 'moduleLabel', type: 'text' },
    { key: 'submoduleLabel', type: 'text' },
    { key: 'scopeTypeLabel', type: 'text' },
    { key: 'permissionLabel', type: 'text' },
    { key: 'name', type: 'text' },
    { key: 'status', type: 'text' },
  ]

  private readonly baseActions: RowAction[] = [
    { icon: 'edit',  id: 'edit',  label: 'Editar' },
    { icon: 'delete', id: 'delete', label: 'Eliminar' },
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
    private _ScopesService: ScopesService,
    private _ToastrService: ToastrService,
    private _PermissionsService: PermissionsService
  ) {}

  get canCreateScope() {
    return this._PermissionsService.hasScopes(['SCOPE.ADD']);
  }

  get canEditScope() {
    return this._PermissionsService.hasScopes(['SCOPE.UPDATE']);
  }

  get canDeleteScopePermission() {
    return this._PermissionsService.hasScopes(['SCOPE.DELETE']);
  }

  get actions(): RowAction[] {
    return this.baseActions.filter((action) => {
      if (action.id === 'edit') return this.canEditScope;
      if (action.id === 'delete') return this.canDeleteScopePermission;
      return true;
    });
  }

  ngOnInit() {
    this.getScopes();
  }

  onRowAction(e: RowActionEvent<any>) {
    if (e.id === 'edit' && !this.canEditScope) return;
    if (e.id === 'delete' && !this.canDeleteScopePermission) return;
    if (e.id === 'edit')  this.openModal(e.id,e.row);
    if (e.id === 'delete') this.actionModal(e.id,e.row, 'Desea eliminar el registro?');
  }

  openModal(action: string, data: any) {
    if (action === 'new' && !this.canCreateScope) return;
    if (action === 'edit' && !this.canEditScope) return;

    let dataSend = {action, row: data};
    const dialogRef = this._MatDialog.open(ScopesModalComponent, {
      disableClose: true,
      panelClass: ['custom-dialog-container'],
      data: dataSend,
      width: '50vw',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getScopes();
      }
    });
  }

  actionModal(action: string, data: any, msg: string, color: string = '!text-red-500', icon = 'delete') {
    if (action === 'delete' && !this.canDeleteScopePermission) return;

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
        await this.deleteScopes(data.id)
        ref.componentInstance.loading = false;
        ref.close(true);
        this.getScopes();
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
    this.getScopes();
  }

  currentPageReturn(event: any) {
    this.currentPage = event;
    this.getScopes();
  }

  pageSizeSelectReturn(event: any) {
    this.pageSize = event;
    this.getScopes();
  }

  getScopes() {
    this.loading = false;
    // view
    this._ScopesService.getScopes(500, this.currentPage).subscribe({
      next: async (response: any) => {
        if(response) {
          this.totalPages = response.pagination.total_pages;
          this.currentPage = response.pagination.current_page;
          this.hasNext = response.pagination.has_next;
          this.hasPrev = response.pagination.has_prev;
          this.scopes = response.items.map((r: any) => ({
            ...r,
            ...this.formatScopeDisplay(r.name),
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

  private formatScopeDisplay(scopeName: string) {
    const normalizedName = String(scopeName ?? '').trim();
    const segments = normalizedName
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);

    const moduleKey = segments[0] ?? '';
    const actionKey = segments.length > 1 ? segments[segments.length - 1] : '';
    const submoduleKeys =
      segments.length > 2 ? segments.slice(1, -1) : segments.length === 2 ? [] : [];

    const hasAction = this.isActionSegment(actionKey) && segments.length > 1;
    const effectiveSubmoduleKeys = hasAction ? submoduleKeys : segments.slice(1);

    return {
      moduleLabel: this.getScopeLabel(moduleKey, true),
      submoduleLabel: effectiveSubmoduleKeys.length
        ? effectiveSubmoduleKeys.map((segment) => this.getScopeLabel(segment)).join(' / ')
        : 'Sin submodulo',
      scopeTypeLabel: hasAction
        ? effectiveSubmoduleKeys.length
          ? 'Accion de permiso'
          : 'Accion principal'
        : segments.length > 1
          ? 'Permiso relacionado'
          : 'Pantalla principal',
      permissionLabel: hasAction
        ? this.getActionLabel(actionKey)
        : segments.length > 1
          ? this.getScopeLabel(segments[segments.length - 1])
          : 'Entrar a pantalla',
    };
  }

  private isActionSegment(segment: string) {
    return ['ADD', 'GET', 'UPDATE', 'DELETE'].includes(segment.toUpperCase());
  }

  private getActionLabel(action: string) {
    const actionLabels: Record<string, string> = {
      ADD: 'Agregar',
      GET: 'Visualizar',
      UPDATE: 'Editar',
      DELETE: 'Eliminar',
    };

    return actionLabels[action.toUpperCase()] ?? this.getScopeLabel(action);
  }

  private getScopeLabel(segment: string, isModule: boolean = false) {
    const normalizedSegment = String(segment ?? '').trim().toUpperCase();

    if (isModule && this.moduleLabelMap[normalizedSegment]) {
      return this.moduleLabelMap[normalizedSegment];
    }

    if (this.nestedLabelMap[normalizedSegment]) {
      return this.nestedLabelMap[normalizedSegment];
    }

    if (this.moduleLabelMap[normalizedSegment]) {
      return this.moduleLabelMap[normalizedSegment];
    }

    return this.formatSegmentLabel(segment);
  }

  private formatSegmentLabel(segment: string) {
    return segment
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  async deleteScopes(id: string) {
    return new Promise((resolve, reject) => {
      this._ScopesService.deleteScopes(id).subscribe({
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
