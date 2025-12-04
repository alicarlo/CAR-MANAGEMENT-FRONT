import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { STATUS } from 'src/app/core/constants/global';

@Component({
  selector: 'app-type-expense-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './type-expense-modal.component.html',
  styleUrl: './type-expense-modal.component.css'
})
export class TypeExpenseModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  error_messages={
    'name':[
			{type: 'required', message: 'Nombre es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
	}
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<TypeExpenseModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypeExpenseService: TypeExpenseService
  ) 
  { }
  

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
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
      registerTypeExpense: this._TypeExpenseService.registerTypeExpense.bind(this._TypeExpenseService),
      updateTypeExpense:   this._TypeExpenseService.updateTypeExpense.bind(this._TypeExpenseService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerTypeExpense' : 'updateTypeExpense';
    
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
