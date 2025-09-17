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

@Component({
  selector: 'app-users-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './users-modal.component.html',
  styleUrl: './users-modal.component.css'
})
export class UsersModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  roles: Role[] = [];
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

  initForm() {
    this.saveForm = this._FormBuilder.group({
      role_id:  new FormControl (this.data.row === null ? '' : this.data.row.role_id,Validators.compose([Validators.required])),
      full_name:  new FormControl (this.data.row === null ? '' : this.data.row.full_name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
			email:  new FormControl (this.data.row === null ? '' : this.data.row.email,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(20), Validators.email])),
      password:  new FormControl (this.data.row === null ? '' : this.data.row.password,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(20)])),
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
}
