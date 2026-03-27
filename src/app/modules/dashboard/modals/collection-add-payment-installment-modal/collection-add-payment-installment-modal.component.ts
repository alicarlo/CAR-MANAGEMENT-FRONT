import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-collection-add-payment-installment-modal',
  imports: [
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule,
    FormsModule, ReactiveFormsModule
  ],
  templateUrl: './collection-add-payment-installment-modal.component.html',
  styleUrl: './collection-add-payment-installment-modal.component.css'
})
export class CollectionAddPaymentInstallmentModalComponent {
  /*loading: boolean = false;
  //saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  error_messages = {
		'payment_method_id':[
      {type: 'required', message: 'Metodo es requerido'},
		],
		'amount':[
			{type: 'required', message: 'Monto es requerido'},
		],
    'comments':[
			{type: 'required', message: 'Notas es requerido'},
		],
		'date_income':[
      {type: 'required', message: 'Fecha es requerido'},
		]
	}
  constructor(
     private _FormBuilder: FormBuilder,
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CollectionAddPaymentInstallmentModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,
     private _AuthService: AuthService

  ) { 
    console.log(this.data)
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      user_id: new FormControl(this._AuthService.user()?.user_id),
      layaway_id: new FormControl(this.data.row.layaway.id),
      payment_method_id: new FormControl(this.data.row === null ? '' : this.data.row.payment_method_id,Validators.compose([Validators.required])),
      amount: new FormControl(this.data.row === null ? '' : this.data.row.layaway.incomes[0].amount,Validators.compose([Validators.required])),
      comments: new FormControl(this.data.row === null ? '' : this.data.row.layaway.comments),
      id: new FormControl(this.data.row === null ? '' : this.data.row.id),
    });
  }
    */
}
