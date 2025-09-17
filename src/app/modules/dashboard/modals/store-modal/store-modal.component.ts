import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from 'src/app/core/services/store/store.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-store-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './store-modal.component.html',
  styleUrl: './store-modal.component.css'
})
export class StoreModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;

  error_messages={
		'name':[
      {type: 'required', message: 'Nombre es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
		'phone':[
			{type: 'required', message: 'Telefono es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
		'address_street_1':[
			{type: 'required', message: 'La direccion es requerida'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
	}

  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<StoreModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _StoreService: StoreService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      phone: new FormControl (this.data.row === null ? '' : this.data.row.phone,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      address_street_1: new FormControl (this.data.row === null ? '' : this.data.row.address_street_1,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      address_street_2: new FormControl(this.data.row === null ? '' : this.data.row.address_street_2),
      address_state: new FormControl(this.data.row === null ? '' : this.data.row.address_state),
      address_city: new FormControl(this.data.row === null ? '' : this.data.row.address_city),
      address_zip: new FormControl(this.data.row === null ? '' : this.data.row.address_zip),
      address_country: new FormControl(this.data.row === null ? '' : this.data.row.address_country),
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
      registerStore: this._StoreService.registerStore.bind(this._StoreService),
      updateStore:   this._StoreService.updateStore.bind(this._StoreService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerStore' : 'updateStore';
    
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
