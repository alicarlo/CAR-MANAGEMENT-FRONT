import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-investor-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './investor-modal.component.html',
  styleUrl: './investor-modal.component.css'
})
export class InvestorModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  cars: any[] = [];
  error_messages={
		'full_name':[
      {type: 'required', message: 'Nombre es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
	}

  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<InvestorModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _InvestorService: InvestorService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      full_name: new FormControl (this.data.row === null ? '' : this.data.row.full_name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      phone: new FormControl (this.data.row === null ? '' : this.data.row.phone),
      address_street_1: new FormControl (this.data.row === null ? '' : this.data.row.address_street_1),
      address_street_2: new FormControl(this.data.row === null ? '' : this.data.row.address_street_2),
      address_state: new FormControl(this.data.row === null ? '' : this.data.row.address_state),
      address_city: new FormControl(this.data.row === null ? '' : this.data.row.address_city),
      address_zip: new FormControl(this.data.row === null ? '' : this.data.row.address_zip),
      address_country: new FormControl(this.data.row === null ? '' : this.data.row.address_country),
      car_id: new FormControl<number[]>(this.data.row === null ? [] : this.data.row.car_id),
  	});

  }

  save() {

    console.log(this.saveForm.invalid)
    console.log(this.saveForm.value)
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
      registerInvestor: this._InvestorService.registerInvestor.bind(this._InvestorService),
      updateInvestor:   this._InvestorService.updateInvestor.bind(this._InvestorService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerInvestor' : 'updateInvestor';
    
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
