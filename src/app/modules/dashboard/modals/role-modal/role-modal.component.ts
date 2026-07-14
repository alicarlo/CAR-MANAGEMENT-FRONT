import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Scopes } from 'src/app/core/models/scopes.model';
import { RolesService } from 'src/app/core/services/roles/roles.service';
import { ScopesService } from 'src/app/core/services/scopes/scopes.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

interface ScopeTreeItem extends Scopes {
  moduleKey: string;
  moduleLabel: string;
  submoduleKey: string;
  submoduleLabel: string;
  permissionLabel: string;
  scopeTypeLabel: string;
  usageLabels: string[];
  sortOrder: number;
  missingScope?: boolean;
}

interface ScopeSubmoduleGroup {
  key: string;
  label: string;
  scopes: ScopeTreeItem[];
  scopeIds: number[];
}

interface ScopeModuleGroup {
  key: string;
  label: string;
  usageLabels: string[];
  directScopes: ScopeTreeItem[];
  submodules: ScopeSubmoduleGroup[];
  scopeIds: number[];
}

interface ScopeComponentGroup {
  key: string;
  label: string;
  scopes: ScopeTreeItem[];
  scopeIds: number[];
}

@Component({
  selector: 'app-role-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.css'
})
export class RoleModalComponent {
  private readonly expectedScopeNames = [
    'ARRIVAL',
    'ARRIVAL.ADD',
    'ARRIVAL.GET',
    'ARRIVAL.UPDATE',
    'BILL',
    'BILL.ADD',
    'BILL.GET',
    'BILL.UPDATE',
    'BILL.DELETE',
    'BILL.CAR.GET',
    'BILL.DOCUMENT.GET',
    'BILL.INVESTOR.GET',
    'CAR',
    'CAR.ADD',
    'CAR.GET',
    'CAR.UPDATE',
    'CAR.DELETE',
    'CAR.DOCUMENT.GET',
    'CAR_HISTORY.GET',
    'CATALOGOS',
    'CATALOGOS.BILL_TYPE.ADD',
    'CATALOGOS.BILL_TYPE.GET',
    'CATALOGOS.BILL_TYPE.UPDATE',
    'CATALOGOS.BILL_TYPE.DELETE',
    'CATALOGOS.CAR_TYPE.ADD',
    'CATALOGOS.CAR_TYPE.GET',
    'CATALOGOS.CAR_TYPE.UPDATE',
    'CATALOGOS.CAR_TYPE.DELETE',
    'CATALOGOS.CLASSIFICATION_BILL.ADD',
    'CATALOGOS.CLASSIFICATION_BILL.GET',
    'CATALOGOS.CLASSIFICATION_BILL.UPDATE',
    'CATALOGOS.CLASSIFICATION_BILL.DELETE',
    'CATALOGOS.DOCUMENT_TYPE.ADD',
    'CATALOGOS.DOCUMENT_TYPE.GET',
    'CATALOGOS.DOCUMENT_TYPE.UPDATE',
    'CATALOGOS.DOCUMENT_TYPE.DELETE',
    'CATALOGOS.PAYMENT_METHOD.ADD',
    'CATALOGOS.PAYMENT_METHOD.GET',
    'CATALOGOS.PAYMENT_METHOD.UPDATE',
    'CATALOGOS.PAYMENT_METHOD.DELETE',
    'CLIENT',
    'CLIENT.ADD',
    'CLIENT.GET',
    'CLIENT.UPDATE',
    'CLIENT.DELETE',
    'COLLECTIONS',
    'COLLECTIONS.GET',
    'CONTRACT.LAYAWAY.GET',
    'DOCUMENTS',
    'DOCUMENTS.ADD',
    'DOCUMENTS.GET',
    'DOCUMENTS.UPDATE',
    'DOCUMENTS.DELETE',
    'DOCUMENTS.BILL.GET',
    'DOCUMENTS.CAR.GET',
    'INCOME',
    'INCOME.ADD',
    'INCOME.GET',
    'INCOME.UPDATE',
    'INCOME.DELETE',
    'INCOME.APPROVE',
    'INCOME.STATUS',
    'INCOME.STATUS.APPROVE',
    'INCOME.LAYAWAY.GET',
    'INSTALLMENT',
    'INSTALLMENT.ADD',
    'INSTALLMENT.GET',
    'INSTALLMENT.UPDATE',
    'INSTALLMENT.DELETE',
    'INSTALLMENT.APPROVE',
    'INSTALLMENT.STATUS',
    'INSTALLMENT.STATUS.APPROVE',
    'INVESTOR',
    'INVESTOR.ADD',
    'INVESTOR.GET',
    'INVESTOR.UPDATE',
    'INVESTOR.DELETE',
    'INVESTOR.CAR.GET',
    'LAYAWAY',
    'LAYAWAY.ADD',
    'LAYAWAY.GET',
    'LAYAWAY.DELETE',
    'PAYMENT',
    'PAYMENT.ADD',
    'PAYMENT.GET',
    'PAYMENT.UPDATE',
    'PAYMENT.DELETE',
    'PURCHASE',
    'PURCHASE.ADD',
    'PURCHASE.GET',
    'PURCHASE.UPDATE',
    'PURCHASE.DELETE',
    'REPORTS.COMISIONES.GET',
    'REPORTS.LISTADO_DOCUMENTOS.GET',
    'REPORTS.LISTADO_PRECIOS.GET',
    'REPORTS.REPORTE_VENTAS.GET',
    'REPORTS.TIEMPO_PISO.GET',
    'ROLE',
    'ROLE.ADD',
    'ROLE.GET',
    'ROLE.UPDATE',
    'ROLE.DELETE',
    'SALE',
    'SALE.ADD',
    'SALE.GET',
    'SALE.DELETE',
    'SCOPE',
    'SCOPE.ADD',
    'SCOPE.GET',
    'SCOPE.UPDATE',
    'SCOPE.DELETE',
    'STORE',
    'STORE.ADD',
    'STORE.GET',
    'STORE.UPDATE',
    'STORE.DELETE',
    'USER',
    'USER.ADD',
    'USER.GET',
    'USER.UPDATE',
    'USER.DELETE',
  ];

  private readonly routeBackedModules = new Set([
    'ARRIVAL',
    'BILL',
    'CAR',
    'CLIENT',
    'DOCUMENTS',
    'INCOME',
    'INVESTOR',
    'LAYAWAY',
    'PURCHASE',
    'REPORTS',
    'ROLE',
    'SALE',
    'SCOPE',
    'STORE',
    'USER',
  ]);

  private readonly sharedScopeUsageMap: Record<string, string[]> = {
    'ARRIVAL.ADD': ['Autos', 'Revision de llegada'],
    'ARRIVAL.GET': ['Autos', 'Revision de llegada'],
    'ARRIVAL.UPDATE': ['Autos', 'Revision de llegada'],
    'BILL.CAR.GET': ['Autos', 'Gastos'],
    'BILL.DOCUMENT.GET': ['Gastos', 'Documentos'],
    'BILL.INVESTOR.GET': ['Gastos', 'Inversionistas'],
    'CAR.DOCUMENT.GET': ['Autos', 'Documentos'],
    'CONTRACT.LAYAWAY.GET': ['Apartados', 'Contratos'],
    'DOCUMENTS.BILL.GET': ['Documentos', 'Gastos'],
    'DOCUMENTS.CAR.GET': ['Documentos', 'Autos'],
    'INCOME': ['Ingresos', 'Apartados'],
    'INCOME.ADD': ['Ingresos', 'Apartados'],
    'INCOME.DELETE': ['Ingresos', 'Apartados'],
    'INCOME.GET': ['Ingresos', 'Apartados'],
    'INCOME.LAYAWAY.GET': ['Apartados', 'Abonos'],
    'INCOME.UPDATE': ['Ingresos', 'Apartados'],
    'INSTALLMENT': ['Abonos', 'Apartados', 'Cobranza'],
    'INSTALLMENT.ADD': ['Abonos', 'Apartados', 'Cobranza'],
    'INSTALLMENT.DELETE': ['Abonos', 'Apartados', 'Cobranza'],
    'INSTALLMENT.GET': ['Abonos', 'Apartados', 'Cobranza'],
    'INSTALLMENT.UPDATE': ['Abonos', 'Apartados', 'Cobranza'],
    'INVESTOR.CAR.GET': ['Inversionistas', 'Autos'],
    'PAYMENT.ADD': ['Gastos', 'Compras'],
    'PAYMENT.DELETE': ['Gastos', 'Compras'],
    'PAYMENT.GET': ['Gastos', 'Compras'],
    'PAYMENT.UPDATE': ['Gastos', 'Compras'],
    'SALE.CLIENT.GET': ['Ventas', 'Clientes'],
    'SCOPE.ROLE.GET': ['Permisos', 'Roles'],
  };

  private readonly sharedModuleUsageMap: Record<string, string[]> = {
    ARRIVAL: ['Autos', 'Revision de llegada'],
    CAR_HISTORY: ['Autos', 'Historial de autos'],
    INCOME: ['Ingresos', 'Apartados', 'Abonos'],
    INSTALLMENT: ['Abonos', 'Apartados', 'Cobranza'],
    PAYMENT: ['Gastos', 'Compras'],
    ROLE: ['Roles', 'Permisos'],
    SCOPE: ['Permisos', 'Roles'],
  };

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
    DOCUMENT: 'Documentos',
    DOCUMENT_TYPE: 'Tipos de documentos',
    COMISIONES: 'Reporte de comisiones',
    INVESTOR: 'Inversionistas',
    LAYAWAY: 'Apartados',
    LISTADO_DOCUMENTOS: 'Listado de documentos',
    LISTADO_PRECIOS: 'Listado de precios',
    REPORTE_VENTAS: 'Reporte de ventas',
    TIEMPO_PISO: 'Reporte de piso',
    PAYMENT: 'Pagos',
    PAYMENT_METHOD: 'Tipos de pagos',
    ROLE: 'Roles',
    SALE: 'Ventas',
    STATUS: 'Estatus',
    APPROVE: 'Aprobar registro',
  };

  private readonly contextualScopeLabelMap: Record<string, string> = {
    'BILL.ADD': 'Agregar gastos',
    'BILL.DELETE': 'Eliminar gastos',
    'BILL.GET': 'Visualizar gastos',
    'BILL.UPDATE': 'Editar gastos',
    'INCOME.STATUS': 'Agregar documento',
    'INCOME.APPROVE': 'Aprobar registro',
    'INCOME.STATUS.APPROVE': 'Aprobar registro',
    'INSTALLMENT.STATUS': 'Agregar documento',
    'INSTALLMENT.APPROVE': 'Aprobar registro',
    'INSTALLMENT.STATUS.APPROVE': 'Aprobar registro',
    'PAYMENT.ADD': 'Agregar pagos',
    'PAYMENT.DELETE': 'Eliminar pagos',
    'PAYMENT.GET': 'Visualizar pagos',
    'PAYMENT.UPDATE': 'Editar pagos',
    'REPORTS.TIEMPO_PISO.AUTO.EDIT': 'Editar precio',
  };

  saveForm: FormGroup | undefined | any;
  loading: boolean = false;
  scopes: Scopes[] = [];
  scopeModules: ScopeModuleGroup[] = [];
  componentScopeGroups: ScopeComponentGroup[] = [];
  activeModuleKey: string = '';
  activeComponentKey: string = '';
  permissionsViewMode: 'modules' | 'components' = 'modules';
  error_messages = {
    'name': [
      { type: 'required', message: 'Nombre es requerido' },
      { type: 'minlength', message: 'Minimo 3 caracteres' },
    ],
    'descriptions': [
      { type: 'required', message: 'Descripcion es requerido' },
      { type: 'minlength', message: 'Minimo 3 caracteres' },
    ]
  };

  get currentRow() {
    return this.data?.row ?? null;
  }

  constructor(
    private _FormBuilder: FormBuilder,
    private dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<RoleModalComponent> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _RolesService: RolesService,
    private _ScopesService: ScopesService
  ) {}

  ngOnInit(): void {
    this.getScopes();
    this.init();
  }

  init() {
    const initialScopeIds = this.getInitialScopeIds();

    this.saveForm = this._FormBuilder.group({
      name: new FormControl(this.currentRow === null ? '' : this.currentRow.name, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(60)])),
      descriptions: new FormControl(this.currentRow === null ? '' : this.currentRow.descriptions, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(60)])),
      scope_id: new FormControl<number[]>(initialScopeIds),
    });
  }

  save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const normalizedScopeIds = Array.from(
      new Set((this.saveForm.value.scope_id ?? []).map(Number).filter((id: number) => Number.isFinite(id)))
    );
    this.saveForm.patchValue({ scope_id: normalizedScopeIds }, { emitEvent: false });

    let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
      const val = this.saveForm.value[key as keyof typeof this.saveForm.value];
      if (val !== null && val !== '' && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as typeof this.saveForm.value);

    filledValues = this.currentRow === null ? filledValues : { ...filledValues, id: this.currentRow.id };

    const methodMap = {
      registerRole: this._RolesService.registerRole.bind(this._RolesService),
      updateRole: this._RolesService.updateRole.bind(this._RolesService),
    } as const;

    type MethodKey = keyof typeof methodMap;

    const methodSelect: MethodKey =
      this.currentRow === null ? 'registerRole' : 'updateRole';

    methodMap[methodSelect](filledValues).subscribe({
      next: async (response) => {
        if (response) {
          this._ToastrService.success('Registro exitoso', 'Exito');
          this.loading = false;
          this.close(true);
        }
      },
      error: (err: unknown | any) => {
        this.loading = false;
        if (!Array.isArray(err.error)) {
          this._ToastrService.error(err.error, 'Error');
          return;
        }

        if (err.error === 'Token expired') {
          this.close();
          return;
        }

        if (err.error && err.error.length > 0) {
          const errorResponse: any[] = err.error;
          for (const item of errorResponse) {
            this._ToastrService.error(item.msg, 'Error');
          }
          return;
        }
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  getScopes() {
    this.loading = false;
    this._ScopesService.getScopes(500, 1).subscribe({
      next: async (response: any) => {
        if (response) {
          this.scopes = this.buildExpectedScopes(response.items.map((r: any) => ({ ...r })));
          this.scopeModules = this.buildScopeModules(this.scopes);
          this.componentScopeGroups = this.buildComponentScopeGroups(this.scopes);
          if (!this.activeModuleKey && this.scopeModules.length) {
            const firstSelectedModule = this.scopeModules.find((module) =>
              this.getSelectedCount(module.scopeIds) > 0
            );

            this.activeModuleKey = firstSelectedModule?.key ?? this.scopeModules[0].key;
          }

          if (!this.activeComponentKey && this.componentScopeGroups.length) {
            const firstSelectedComponent = this.componentScopeGroups.find((component) =>
              this.getSelectedCount(component.scopeIds) > 0
            );

            this.activeComponentKey = firstSelectedComponent?.key ?? this.componentScopeGroups[0].key;
          }
        }
      },
      error: (err) => {
        if (err.error === 'Token expired') return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  trackById = (_: number, s: Scopes) => s.id;

  trackByModule = (_: number, module: ScopeModuleGroup) => module.key;

  trackBySubmodule = (_: number, submodule: ScopeSubmoduleGroup) => submodule.key;

  trackByComponent = (_: number, component: ScopeComponentGroup) => component.key;

  isChecked(id: number) {
    if (this.isMissingScopeId(id)) {
      return false;
    }

    const ids = (this.saveForm.value.scope_id ?? []).map(Number);
    return ids.includes(Number(id));
  }

  toggleScope(id: number) {
    if (this.isMissingScopeId(id)) {
      return;
    }

    const curr = (this.saveForm.value.scope_id ?? []).map(Number);
    const nid = Number(id);
    const next = curr.includes(nid) ? curr.filter((x: any) => x !== nid) : [...curr, nid];
    this.saveForm.patchValue({ scope_id: next }, { emitEvent: true });
  }

  setActiveModule(moduleKey: string) {
    this.activeModuleKey = moduleKey;
  }

  setPermissionsViewMode(viewMode: 'modules' | 'components') {
    this.permissionsViewMode = viewMode;
  }

  getActiveModule() {
    return this.scopeModules.find((module) => module.key === this.activeModuleKey) ?? null;
  }

  setActiveComponent(componentKey: string) {
    this.activeComponentKey = componentKey;
  }

  getActiveComponent() {
    return this.componentScopeGroups.find((component) => component.key === this.activeComponentKey) ?? null;
  }

  getSelectedCount(scopeIds: number[]) {
    return scopeIds.filter((id) => !this.isMissingScopeId(id) && this.isChecked(id)).length;
  }

  getDirectScopeIds(module: ScopeModuleGroup) {
    return module.directScopes.filter((scope) => !scope.missingScope).map((scope) => Number(scope.id));
  }

  isAllChecked(scopeIds: number[]) {
    const availableScopeIds = this.getAvailableScopeIds(scopeIds);
    return availableScopeIds.length > 0 && this.getSelectedCount(availableScopeIds) === availableScopeIds.length;
  }

  isIndeterminate(scopeIds: number[]) {
    const availableScopeIds = this.getAvailableScopeIds(scopeIds);
    const selected = this.getSelectedCount(availableScopeIds);
    return selected > 0 && selected < availableScopeIds.length;
  }

  toggleScopeGroup(scopeIds: number[]) {
    const availableScopeIds = this.getAvailableScopeIds(scopeIds);
    const currentIds = new Set((this.saveForm.value.scope_id ?? []).map(Number));
    const shouldSelectAll = !this.isAllChecked(availableScopeIds);

    for (const scopeId of availableScopeIds) {
      if (shouldSelectAll) {
        currentIds.add(Number(scopeId));
      } else {
        currentIds.delete(Number(scopeId));
      }
    }

    this.saveForm.patchValue({ scope_id: Array.from(currentIds) }, { emitEvent: true });
  }

  selectedLabel() {
    const ids = (this.saveForm.value.scope_id ?? []).map(Number);
    if (!ids.length) return 'Selecciona permisos';

    const modulesWithSelection = this.scopeModules.filter((module) =>
      module.scopeIds.some((id: number) => !this.isMissingScopeId(id) && ids.includes(Number(id)))
    ).length;

    return `${ids.length} permisos en ${modulesWithSelection} modulo(s)`;
  }

  getUsageText(usageLabels: string[]) {
    if (!usageLabels.length) {
      return '';
    }

    return usageLabels.join(', ');
  }

  getComponentPermissionLabel(componentLabel: string, scope: ScopeTreeItem) {
    const normalizedComponent = String(componentLabel ?? '').trim().toUpperCase();
    const normalizedScope = String(scope.name ?? '').trim().toUpperCase();

    if (normalizedComponent === 'GASTOS') {
      const billsLabels: Record<string, string> = {
        'BILL.GET': 'Visualizar gastos',
        'BILL.ADD': 'Agregar gastos',
        'BILL.UPDATE': 'Editar gastos',
        'BILL.DELETE': 'Eliminar gastos',
      };

      return billsLabels[normalizedScope] ?? scope.permissionLabel;
    }

    return scope.permissionLabel;
  }

  getComponentScopes(component: ScopeComponentGroup) {
    return [...(component?.scopes ?? [])].sort((a, b) => this.sortComponentScopes(component.label, a, b));
  }

  isMissingScope(scope: ScopeTreeItem) {
    return Boolean(scope?.missingScope);
  }

  getScopeStatusLabel(scope: ScopeTreeItem) {
    return this.isMissingScope(scope) ? 'Sin scope' : scope.scopeTypeLabel;
  }

  private buildScopeModules(scopes: Scopes[]) {
    const modulesMap = new Map<string, ScopeModuleGroup>();

    for (const scope of scopes) {
      const formattedScope = this.formatScope(scope);

      if (!modulesMap.has(formattedScope.moduleKey)) {
        modulesMap.set(formattedScope.moduleKey, {
          key: formattedScope.moduleKey,
          label: formattedScope.moduleLabel,
          usageLabels: this.getModuleUsageLabels(formattedScope.moduleKey),
          directScopes: [],
          submodules: [],
          scopeIds: [],
        });
      }

      const moduleGroup = modulesMap.get(formattedScope.moduleKey)!;
      moduleGroup.scopeIds.push(Number(formattedScope.id));

      if (!formattedScope.submoduleKey) {
        moduleGroup.directScopes.push(formattedScope);
        continue;
      }

      let submoduleGroup = moduleGroup.submodules.find(
        (submodule) => submodule.key === formattedScope.submoduleKey
      );

      if (!submoduleGroup) {
        submoduleGroup = {
          key: formattedScope.submoduleKey,
          label: formattedScope.submoduleLabel,
          scopes: [],
          scopeIds: [],
        };
        moduleGroup.submodules.push(submoduleGroup);
      }

      submoduleGroup.scopes.push(formattedScope);
      submoduleGroup.scopeIds.push(Number(formattedScope.id));
    }

    return Array.from(modulesMap.values())
      .map((module) => ({
        ...module,
        directScopes: module.directScopes.sort((a, b) => a.sortOrder - b.sortOrder || a.permissionLabel.localeCompare(b.permissionLabel)),
        submodules: module.submodules
          .map((submodule) => ({
            ...submodule,
            scopes: submodule.scopes.sort((a, b) => a.sortOrder - b.sortOrder || a.permissionLabel.localeCompare(b.permissionLabel)),
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private buildComponentScopeGroups(scopes: Scopes[]) {
    const componentsMap = new Map<string, ScopeComponentGroup>();

    for (const scope of scopes) {
      const formattedScope = this.formatScope(scope);
      const componentLabels = this.getComponentLabelsForScope(formattedScope);

      for (const label of componentLabels) {
        const key = this.getComponentKey(label);

        if (!componentsMap.has(key)) {
          componentsMap.set(key, {
            key,
            label,
            scopes: [],
            scopeIds: [],
          });
        }

        const componentGroup = componentsMap.get(key)!;
        componentGroup.scopes.push(formattedScope);
        componentGroup.scopeIds.push(Number(formattedScope.id));
      }
    }

    return Array.from(componentsMap.values())
      .map((component) => ({
        ...component,
        scopes: component.scopes.sort((a, b) => this.sortComponentScopes(component.label, a, b)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  private sortComponentScopes(componentLabel: string, a: ScopeTreeItem, b: ScopeTreeItem) {
    const normalizedComponent = String(componentLabel ?? '').trim().toUpperCase();
    const aModule = String(a.moduleKey ?? '').trim().toUpperCase();
    const bModule = String(b.moduleKey ?? '').trim().toUpperCase();
    const aPriority = this.getComponentScopePriority(normalizedComponent, aModule);
    const bPriority = this.getComponentScopePriority(normalizedComponent, bModule);

    return aPriority - bPriority ||
      a.sortOrder - b.sortOrder ||
      this.getComponentPermissionLabel(componentLabel, a).localeCompare(this.getComponentPermissionLabel(componentLabel, b)) ||
      a.moduleLabel.localeCompare(b.moduleLabel);
  }

  private getComponentScopePriority(componentKey: string, moduleKey: string) {
    const normalizedComponent = String(componentKey ?? '').trim().toUpperCase();
    const normalizedModule = String(moduleKey ?? '').trim().toUpperCase();

    if (normalizedComponent === 'GASTOS') {
      const gastosOrder: Record<string, number> = {
        BILL: 0,
        PAYMENT: 1,
        DOCUMENTS: 2,
      };

      return gastosOrder[normalizedModule] ?? 3;
    }

    const componentModule = this.getComponentModuleKey(normalizedComponent);
    return normalizedModule === componentModule ? 0 : 1;
  }

  private getComponentModuleKey(componentKey: string) {
    const componentModuleMap: Record<string, string> = {
      AUTOS: 'CAR',
      CLIENTES: 'CLIENT',
      COBRANZA: 'COLLECTIONS',
      COMPRAS: 'PURCHASE',
      DOCUMENTOS: 'DOCUMENTS',
      GASTOS: 'BILL',
      INGRESOS: 'INCOME',
      INVERSIONISTAS: 'INVESTOR',
      PAGOS: 'PAYMENT',
      REPORTES: 'REPORTS',
      ROLES: 'ROLE',
      SUCURSALES: 'STORE',
      USUARIOS: 'USER',
      VENTAS: 'SALE',
    };

    return componentModuleMap[componentKey] ?? componentKey;
  }

  private getComponentLabelsForScope(scope: ScopeTreeItem) {
    const labels = new Set<string>();
    const moduleHasRoute = this.routeBackedModules.has(String(scope.moduleKey ?? '').toUpperCase());

    if (moduleHasRoute || !scope.usageLabels.length) {
      labels.add(scope.moduleLabel);
    }

    for (const label of scope.usageLabels) {
      labels.add(label);
    }

    return Array.from(labels).filter(Boolean);
  }

  private getComponentKey(label: string) {
    return String(label ?? '').trim().toUpperCase().replace(/\s+/g, '_');
  }

  private formatScope(scope: Scopes): ScopeTreeItem {
    const normalizedName = String(scope.name ?? '').trim();
    const normalizedScopeName = normalizedName.toUpperCase();
    const segments = normalizedName
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);

    const moduleKey = segments[0] ?? '';
    const actionKey = segments.length > 1 ? segments[segments.length - 1] : '';
    const hasAction = this.isActionSegment(actionKey) && segments.length > 1;
    const submoduleSegments = this.getSubmoduleSegments(normalizedScopeName, hasAction, segments);
    const scopeTypeLabel = this.getScopeTypeLabel({
      moduleKey,
      segments,
      hasAction,
      submoduleSegments,
    });

    return {
      ...scope,
      moduleKey,
      moduleLabel: this.getScopeLabel(moduleKey, true),
      submoduleKey: submoduleSegments.join('.'),
      submoduleLabel: this.getSubmoduleLabel(submoduleSegments, normalizedScopeName),
      permissionLabel: this.getPermissionLabel({
        normalizedScopeName,
        hasAction,
        actionKey,
        segments,
      }),
      scopeTypeLabel,
      usageLabels: this.getSharedUsageLabels(normalizedName, moduleKey, submoduleSegments),
      sortOrder: this.getScopeSortOrder(hasAction ? actionKey : '', segments.length === 1),
      missingScope: Boolean((scope as ScopeTreeItem).missingScope),
    };
  }

  private getPermissionLabel(config: {
    normalizedScopeName: string;
    hasAction: boolean;
    actionKey: string;
    segments: string[];
  }) {
    const { normalizedScopeName, hasAction, actionKey, segments } = config;
    const contextualLabel = this.contextualScopeLabelMap[normalizedScopeName];

    if (contextualLabel) {
      return contextualLabel;
    }

    if (hasAction) {
      return this.getActionLabel(actionKey);
    }

    if (segments.length > 1) {
      return this.getScopeLabel(segments[segments.length - 1]);
    }

    return 'Entrar a pantalla';
  }

  private getSubmoduleLabel(submoduleSegments: string[], normalizedScopeName: string) {
    if (!submoduleSegments.length) {
      return '';
    }

    if (normalizedScopeName === 'INCOME.STATUS.APPROVE' || normalizedScopeName === 'INSTALLMENT.STATUS.APPROVE') {
      return 'Validacion de soporte';
    }

    if (normalizedScopeName === 'INCOME.STATUS' || normalizedScopeName === 'INSTALLMENT.STATUS') {
      return 'Soporte del pago';
    }

    return submoduleSegments.map((segment) => this.getScopeLabel(segment)).join(' / ');
  }

  private getSubmoduleSegments(normalizedScopeName: string, hasAction: boolean, segments: string[]) {
    if (normalizedScopeName === 'REPORTS.TIEMPO_PISO.AUTO.EDIT') {
      return ['TIEMPO_PISO'];
    }

    return hasAction ? segments.slice(1, -1) : segments.slice(1);
  }

  private getScopeTypeLabel(config: {
    moduleKey: string;
    segments: string[];
    hasAction: boolean;
    submoduleSegments: string[];
  }) {
    const { moduleKey, segments, hasAction, submoduleSegments } = config;
    const normalizedModuleKey = String(moduleKey ?? '').toUpperCase();
    const isBaseScope = segments.length === 1;
    const isRouteBackedModule = this.routeBackedModules.has(normalizedModuleKey);
    const sharedUsageLabels = this.getModuleUsageLabels(normalizedModuleKey);

    if (hasAction) {
      return submoduleSegments.length
        ? 'Accion de permiso compartido'
        : 'Accion principal';
    }

    if (isBaseScope) {
      if (isRouteBackedModule) {
        return 'Pantalla del sistema';
      }

      if (sharedUsageLabels.length) {
        return 'Permiso base compartido';
      }

      return 'Permiso base';
    }

    return 'Permiso relacionado';
  }

  private getSharedUsageLabels(scopeName: string, moduleKey: string, submoduleSegments: string[]) {
    const normalizedScope = String(scopeName ?? '').trim().toUpperCase();
    const currentModuleLabel = this.getScopeLabel(moduleKey, true);
    const labels = new Set<string>();

    if (normalizedScope === 'REPORTS.TIEMPO_PISO.AUTO.EDIT') {
      return ['Reporte de piso'];
    }

    for (const label of this.sharedScopeUsageMap[normalizedScope] ?? []) {
      labels.add(label);
    }

    for (const label of this.sharedModuleUsageMap[String(moduleKey ?? '').toUpperCase()] ?? []) {
      labels.add(label);
    }

    for (const segment of submoduleSegments) {
      const label = this.getScopeLabel(segment);
      if (label) {
        labels.add(label);
      }
    }

    return Array.from(labels).filter((label) => label && label !== currentModuleLabel);
  }

  private getModuleUsageLabels(moduleKey: string) {
    const normalizedModuleKey = String(moduleKey ?? '').trim().toUpperCase();
    const currentModuleLabel = this.getScopeLabel(normalizedModuleKey, true);
    const labels = new Set<string>(this.sharedModuleUsageMap[normalizedModuleKey] ?? []);

    return Array.from(labels).filter((label) => label && label !== currentModuleLabel);
  }

  private getScopeSortOrder(actionKey: string, isBaseScope: boolean) {
    if (isBaseScope) return 0;

    const actionOrder: Record<string, number> = {
      GET: 1,
      ADD: 2,
      UPDATE: 3,
      DELETE: 4,
      EDIT: 3,
    };

    return actionOrder[actionKey.toUpperCase()] ?? 5;
  }

  private isActionSegment(segment: string) {
    return ['ADD', 'GET', 'UPDATE', 'DELETE', 'APPROVE', 'EDIT'].includes(String(segment ?? '').toUpperCase());
  }

  private getActionLabel(action: string) {
    const actionLabels: Record<string, string> = {
      ADD: 'Agregar',
      GET: 'Visualizar',
      UPDATE: 'Editar',
      DELETE: 'Eliminar',
      APPROVE: 'Aprobar registro',
      EDIT: 'Editar',
    };

    return actionLabels[String(action ?? '').toUpperCase()] ?? this.getScopeLabel(action);
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
    return String(segment ?? '')
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private normalizeScopeIds(rawScopeIds: any): number[] {
    if (!rawScopeIds) {
      return [];
    }

    let parsedScopeIds = rawScopeIds;

    if (typeof rawScopeIds === 'string') {
      try {
        parsedScopeIds = JSON.parse(rawScopeIds);
      } catch {
        parsedScopeIds = rawScopeIds
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsedScopeIds)) {
      return [];
    }

    return parsedScopeIds
      .map((item: any) => {
        if (typeof item === 'number') {
          return item;
        }

        if (typeof item === 'string') {
          return Number(item);
        }

        if (item && typeof item === 'object') {
          if (item.id !== undefined) {
            return Number(item.id);
          }

          if (item.scope_id !== undefined) {
            return Number(item.scope_id);
          }
        }

        return Number.NaN;
      })
      .filter((id: number) => Number.isFinite(id));
  }

  private buildExpectedScopes(scopes: Scopes[]) {
    const normalizedScopes: Scopes[] = scopes.map((scope) => ({
      ...scope,
      name: String(scope.name ?? '').trim().toUpperCase(),
    }));
    const existingScopeNames = new Set(normalizedScopes.map((scope) => String(scope.name ?? '').trim().toUpperCase()));
    const missingScopes = this.expectedScopeNames
      .map((scopeName) => String(scopeName ?? '').trim().toUpperCase())
      .filter((scopeName) => scopeName && !existingScopeNames.has(scopeName))
      .map((scopeName, index) => ({
        id: -1 * (index + 1),
        name: scopeName,
        descriptions: 'Sin scope',
        scope_parent: null as any,
        status: 'missing',
        missingScope: true,
      } as ScopeTreeItem));

    return [...normalizedScopes, ...missingScopes];
  }

  private getAvailableScopeIds(scopeIds: number[]) {
    return scopeIds.map(Number).filter((id) => Number.isFinite(id) && !this.isMissingScopeId(id));
  }

  private isMissingScopeId(id: number) {
    return Number(id) < 0;
  }

  private getInitialScopeIds(): number[] {
    if (!this.currentRow) {
      return [];
    }

    const idsFromScopeId = this.normalizeScopeIds(this.currentRow.scope_id);
    if (idsFromScopeId.length) {
      return idsFromScopeId;
    }

    return this.normalizeScopeIds(this.currentRow.scopes);
  }
}
