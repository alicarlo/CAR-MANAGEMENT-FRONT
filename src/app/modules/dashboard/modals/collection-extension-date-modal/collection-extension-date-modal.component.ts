import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { STATUS } from 'src/app/core/constants/global';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DocumentsService } from 'src/app/core/services/documents/documents.service';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { TypeDocumentsService } from 'src/app/core/services/typeDocuments/type-documents.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-collection-extension-date-modal',
  imports: [NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule,
    FormsModule, ReactiveFormsModule,
    MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './collection-extension-date-modal.component.html',
  styleUrl: './collection-extension-date-modal.component.css'
})
export class CollectionExtensionDateModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;

  error_messages={
    'paid_at':[  
      {type: 'required', message: 'Fecha es requerido'},
    ]
	}
  constructor(
    private _FormBuilder: FormBuilder,
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CollectionExtensionDateModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _MatDialog: MatDialog,
    private _IncomeService: IncomeService
    

  ) { 

  }

  ngOnInit(): void {
    this.init();
  }

  save() {

    const methodMap = {
      updateInstallment:   this._IncomeService.updateIntallment.bind(this._IncomeService),
    } as const;

    methodMap.updateInstallment({ paid_at: this.saveForm.value.paid_at, id: this.data.row.id }).subscribe({
      next: (response: any) => {
        if(response) {
          this._ToastrService.success('Fecha de pago actualizada', 'Exito');
          this.loading = true;
          this.close(true);
        }
      },
      error: (err) => {
        this.loading = false;
        this._ToastrService.error(err.error, 'Error');
      },
    });
  }

  dateFormat(date: string) { 
    return moment.utc(date).format('YYYY-MM-DD');
  }


  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      paid_at: new FormControl (this.data.row === null ? '' : this.dateFormat(this.data.row.paid_at),Validators.compose([Validators.required])),
    });
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }
}
