import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { STATUS } from 'src/app/core/constants/global';
import { ExpenseClasificationService } from 'src/app/core/services/expenseClasification/expense-clasification.service';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';

@Component({
  selector: 'app-expense-clasification-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './expense-clasification-modal.component.html',
  styleUrl: './expense-clasification-modal.component.css'
})
export class ExpenseClasificationModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  error_messages={
    'name':[
			{type: 'required', message: 'Titulo es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
    'descriptions':[
			{type: 'required', message: 'Descripcion es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
    'bill_type_id':[  
      {type: 'required', message: 'Tipo de gastoes requerido'},
    ]
	}
  typeExpense: any[] = [];
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<ExpenseClasificationModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _ExpenseClasificationService: ExpenseClasificationService,
    private _TypeExpenseService: TypeExpenseService
  ) 
  { }
  
  ngOnInit(): void {
    this.init();
    this.getTypeExpense();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      descriptions: new FormControl(this.data.row === null ? '' : this.data.row.descriptions),
      bill_type_id: new FormControl(this.data.row === null ? '' : this.data.row.bill_type_id, Validators.compose([Validators.required])),
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
      registerExpenseClasification: this._ExpenseClasificationService.registerExpenseClasification.bind(this._ExpenseClasificationService),
      updateExpenseClasification:   this._ExpenseClasificationService.updateExpenseClasification.bind(this._ExpenseClasificationService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerExpenseClasification' : 'updateExpenseClasification';
    
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

  getTypeExpense() {
    this.loading = false;
    this._TypeExpenseService.getTypeExpense(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeExpense = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }
}