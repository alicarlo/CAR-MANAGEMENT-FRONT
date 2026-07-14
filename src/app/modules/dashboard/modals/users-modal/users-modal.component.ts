import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/core/models/auth.model';
import { RolesService } from 'src/app/core/services/roles/roles.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

interface RoleScopeItem {
  id: number;
  name: string;
  descriptions?: string;
  status?: string;
  moduleKey: string;
  moduleLabel: string;
  submoduleKey: string;
  submoduleLabel: string;
  permissionLabel: string;
  sortOrder: number;
}

interface RoleScopeSubmodule {
  key: string;
  label: string;
  scopes: RoleScopeItem[];
}

interface RoleScopeModule {
  key: string;
  label: string;
  directScopes: RoleScopeItem[];
  submodules: RoleScopeSubmodule[];
}

@Component({
  selector: 'app-users-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './users-modal.component.html',
  styleUrl: './users-modal.component.css'
})
export class UsersModalComponent {
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

  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  roles: any[] = [];
  expandedScopeModules: Record<string, boolean> = {};
  scopesPanelOpen: boolean = false;
  showPass1 = false;
  error_messages = {
		'full_name':[
				{type: 'required', message: 'Nombre completo es requerido'},
		],
		'email':[
			{type: 'required', message: 'Correo es requerido'},
		],
		'password':[
			{type: 'required', message: 'Contrasena es requerido'},
		],
    'role_id':[
      {type: 'required', message: 'Rol es requerido'},
    ]
	}
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<UsersModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _RolesService: RolesService,
    private _UsersService: UsersService
  ) {}

   ngOnInit(): void {
    this.getRoles();
    this.initForm();
  }

  get isEditMode() {
    return this.data?.row !== null && this.data?.row !== undefined;
  }

  initForm() {
    const passwordValidators = this.isEditMode
      ? Validators.compose([Validators.minLength(3), Validators.maxLength(20)])
      : Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(20)]);

    this.saveForm = this._FormBuilder.group({
      role_id:  new FormControl (this.data.row === null ? '' : this.data.row.role_id,Validators.compose([Validators.required])),
      full_name:  new FormControl (this.data.row === null ? '' : this.data.row.full_name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
			email:  new FormControl (this.data.row === null ? '' : this.data.row.email,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(100), Validators.email])),
      password:  new FormControl ('', passwordValidators),
      address_street_1:  new FormControl (this.data.row === null ? '' : this.data.row.address_street_1),
      address_street_2: new FormControl (this.data.row === null ? '' : this.data.row.address_street_2),
      address_state: new FormControl (this.data.row === null ? '' : this.data.row.address_state),
      address_city: new FormControl (this.data.row === null ? '' : this.data.row.address_city),
      address_zip: new FormControl (this.data.row === null ? '' : this.data.row.address_zip),
      address_country: new FormControl (this.data.row === null ? '' : this.data.row.address_country),
  	});
  }

  getRoles() {
    this._RolesService.getRoles(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.roles = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      const invalidControl = Object.keys(this.saveForm.controls).find((key) => this.saveForm.get(key)?.invalid);
      if (invalidControl) {
        this._ToastrService.error(`Campo invalido: ${invalidControl}`, 'Error');
      }
      return;
    }

    this.loading = true;
    let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
      const val = this.saveForm.value[key as keyof typeof this.saveForm.value];
      if (val !== null && val !== '' && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as typeof this.saveForm.value);

    filledValues = this.data.row === null ? filledValues : {...filledValues, id: this.data.row.id};

    const methodMap = {
      registerUser: this._UsersService.registerUser.bind(this._UsersService),
      updateUser:   this._UsersService.updateUser.bind(this._UsersService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerUser' : 'updateUser';
    
      methodMap[methodSelect](filledValues).subscribe({
      next: async (response) => {
        if(response) {
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

        if (err.error === "Token expired") {
          this.close();
          return;
        }

        if (err.error && err.error.length > 0) {
          let errorResponse: any[] = err.error;
          for (const item of errorResponse) {
            this._ToastrService.error(item.msg, 'Error');  
          }
          return
        }
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  get selectedRole() {
    const roleId = Number(this.saveForm?.get('role_id')?.value);
    return this.roles.find((role) => Number(role.id) === roleId) ?? null;
  }

  get selectedRoleScopeModules(): RoleScopeModule[] {
    return this.buildScopeModules(this.selectedRole?.scopes ?? []);
  }

  get selectedRoleScopeCount() {
    return this.selectedRole?.scopes?.length ?? 0;
  }

  getModuleScopeCount(module: RoleScopeModule) {
    return module.directScopes.length + module.submodules.reduce((total, submodule) => total + submodule.scopes.length, 0);
  }

  toggleScopesPanel() {
    if (!this.selectedRole) {
      return;
    }
    this.scopesPanelOpen = !this.scopesPanelOpen;
  }

  toggleScopeModule(moduleKey: string) {
    this.expandedScopeModules[moduleKey] = !this.expandedScopeModules[moduleKey];
  }

  isScopeModuleExpanded(moduleKey: string) {
    return !!this.expandedScopeModules[moduleKey];
  }

  private buildScopeModules(scopes: any[]): RoleScopeModule[] {
    const modulesMap = new Map<string, RoleScopeModule>();

    for (const scope of scopes) {
      const formattedScope = this.formatScope(scope);

      if (!modulesMap.has(formattedScope.moduleKey)) {
        modulesMap.set(formattedScope.moduleKey, {
          key: formattedScope.moduleKey,
          label: formattedScope.moduleLabel,
          directScopes: [],
          submodules: [],
        });
      }

      const moduleGroup = modulesMap.get(formattedScope.moduleKey)!;

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
        };
        moduleGroup.submodules.push(submoduleGroup);
      }

      submoduleGroup.scopes.push(formattedScope);
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

  private formatScope(scope: any): RoleScopeItem {
    const normalizedName = String(scope?.name ?? '').trim();
    const segments = normalizedName
      .split('.')
      .map((segment) => segment.trim())
      .filter(Boolean);

    const moduleKey = segments[0] ?? '';
    const actionKey = segments.length > 1 ? segments[segments.length - 1] : '';
    const hasAction = this.isActionSegment(actionKey) && segments.length > 1;
    const submoduleSegments = hasAction ? segments.slice(1, -1) : segments.slice(1);

    return {
      ...scope,
      moduleKey,
      moduleLabel: this.getScopeLabel(moduleKey, true),
      submoduleKey: submoduleSegments.join('.'),
      submoduleLabel: submoduleSegments.map((segment) => this.getScopeLabel(segment)).join(' / '),
      permissionLabel: hasAction
        ? this.getActionLabel(actionKey)
        : segments.length > 1
          ? this.getScopeLabel(segments[segments.length - 1])
          : 'Entrar a pantalla',
      sortOrder: this.getScopeSortOrder(hasAction ? actionKey : '', segments.length === 1),
    };
  }

  private getScopeSortOrder(actionKey: string, isBaseScope: boolean) {
    if (isBaseScope) return 0;

    const actionOrder: Record<string, number> = {
      GET: 1,
      ADD: 2,
      UPDATE: 3,
      DELETE: 4,
    };

    return actionOrder[actionKey.toUpperCase()] ?? 5;
  }

  private isActionSegment(segment: string) {
    return ['ADD', 'GET', 'UPDATE', 'DELETE'].includes(String(segment ?? '').toUpperCase());
  }

  private getActionLabel(action: string) {
    const actionLabels: Record<string, string> = {
      ADD: 'Agregar',
      GET: 'Visualizar',
      UPDATE: 'Editar',
      DELETE: 'Eliminar',
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
}
