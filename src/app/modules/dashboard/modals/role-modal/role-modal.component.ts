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

@Component({
  selector: 'app-role-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './role-modal.component.html',
  styleUrl: './role-modal.component.css'
})
export class RoleModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  scopes: Scopes[] = [];
  open: boolean = false;
  error_messages={
    'name':[
			{type: 'required', message: 'Nombre es requerido'},
		],
		'descriptions':[
				{type: 'required', message: 'Descripcion es requerido'},
		]
	}
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<RoleModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _RolesService: RolesService,
    private _ScopesService: ScopesService
  ) 
  { }
  


  ngOnInit(): void {
    this.getScopes();
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      descriptions: new FormControl (this.data.row === null ? '' : this.data.row.descriptions,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      scope_id: new FormControl<number[]>(this.data.row === null ? [] : this.data.row.scope_id),
  	});
  }

  save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
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
      registerRole: this._RolesService.registerRole.bind(this._RolesService),
      updateRole:   this._RolesService.updateRole.bind(this._RolesService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerRole' : 'updateRole';
    
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

  getScopes() {
    this.loading = false;
    this._ScopesService.getScopes(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.scopes = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  trackById = (_: number, s: Scopes) => s.id;

  isChecked(id: number) {
    const ids = (this.saveForm.value.scope_id ?? []).map(Number);
    return ids.includes(Number(id));
  }

  toggleScope(id: number) {
    const curr = (this.saveForm.value.scope_id ?? []).map(Number);
    const nid = Number(id);
    const next = curr.includes(nid) ? curr.filter((x: any) => x !== nid) : [...curr, nid];
    this.saveForm.patchValue({ scope_id: next }, { emitEvent: true });
  }

  selectedLabel() {
    const ids = (this.saveForm.value.scope_id ?? []).map(Number);
    if (!ids.length) return 'Selecciona…';
    return this.scopes.filter(s => ids.includes(Number(s.id))).map(s => s.name).join(', ');
  }
}
