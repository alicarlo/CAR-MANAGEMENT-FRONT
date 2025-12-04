import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { STATUS } from 'src/app/core/constants/global';
import { TypeCars } from 'src/app/core/models/typeCars.model';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-type-cars-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './type-cars-modal.component.html',
  styleUrl: './type-cars-modal.component.css'
})
export class TypeCarsModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  error_messages={
    'name':[
			{type: 'required', message: 'Titulo es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
		'abbreviation':[
			{type: 'required', message: 'Abreviación es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		]
	}

  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<TypeCarsModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypeCarsService: TypeCarsService
  ) 
  { }
  


  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      abbreviation: new FormControl(
        {
          value: this.data.row === null ? '' : this.data.row.abbreviation,
          disabled: this.data.row !== null
        },
        Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(60)])
      ),
      descriptions: new FormControl(this.data.row === null ? '' : this.data.row.descriptions),
      status: new FormControl (this.data.row === null ? '' : this.data.row.status),
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
      registerTypeCar: this._TypeCarsService.registerTypeCar.bind(this._TypeCarsService),
      updateTypeCar:   this._TypeCarsService.updateTypeCar.bind(this._TypeCarsService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerTypeCar' : 'updateTypeCar';
    
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
