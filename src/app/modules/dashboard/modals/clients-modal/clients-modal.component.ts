import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { CreateClientError } from 'src/app/core/models/error';
import { Clients } from 'src/app/core/models/clients.model';
import  moment from 'moment';

@Component({
  selector: 'app-clients-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './clients-modal.component.html',
  styleUrl: './clients-modal.component.css'
})
export class ClientsModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;

  error_messages={
    'email':[
			{type: 'required', message: 'Correo es requerido'},
      {type: 'email', message: 'Formato invalido'},
		],
		'full_name':[
				{type: 'required', message: 'Nombre completo es requerido'},
		],
		'phone':[
			{type: 'required', message: 'Telefono es requerido'},
		],
		'address_street_1':[
			{type: 'required', message: 'La direccion es requerida'},
		],
		'birthday':[
			{type: 'required', message: 'Cumpleanos es requerido'},
		],
    'gender':[
			{type: 'required', message: 'Genero es requerido'},
		]
	}

  sexOptions = ['male', 'female'];
  todayStr = new Date().toISOString().slice(0, 10); 
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<ClientsModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _ClientsService: ClientsService  
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      email: new FormControl (this.data.row === null ? '' : this.data.row.email,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60), Validators.email])),
      full_name: new FormControl (this.data.row === null ? '' : this.data.row.full_name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      phone: new FormControl (this.data.row === null ? '' : this.data.row.phone,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      phone_mobile: new FormControl(this.data.row === null ? '' : this.data.row.phone_mobile),
      phone_work: new FormControl(this.data.row === null ? '' : this.data.row.phone_work),
      address_street_1: new FormControl (this.data.row === null ? '' : this.data.row.address_street_1,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      address_street_2: new FormControl(this.data.row === null ? '' : this.data.row.address_street_2),
      address_state: new FormControl(this.data.row === null ? '' : this.data.row.address_state),
      address_city: new FormControl(this.data.row === null ? '' : this.data.row.address_city),
      address_zip: new FormControl(this.data.row === null ? '' : this.data.row.address_zip),
      address_country: new FormControl(this.data.row === null ? '' : this.data.row.address_country),
      birthday: new FormControl(this.data.row === null ? '' : this.dateFormat(this.data.row.birthday),Validators.compose([Validators.required])),
      gender: new FormControl(this.data.row === null ? '' : this.data.row.gender,Validators.compose([Validators.required])),
      rfc: new FormControl(this.data.row === null ? '' : this.data.row.rfc),
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


    this.saveForm.patchValue({ birthday: moment(this.saveForm.value.birthday).format('YYYY-MM-DD HH:mm:ss.SSS') })
    filledValues = this.data.row === null ? filledValues : {...filledValues, id: this.data.row.id};

    const methodMap = {
      registerClient: this._ClientsService.registerClient.bind(this._ClientsService),
      updateClient:   this._ClientsService.updateClient.bind(this._ClientsService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerClient' : 'updateClient';
    
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
          let errorResponse: CreateClientError[] = err.error;
          for (const item of errorResponse) {
            this._ToastrService.error(item.msg, 'Error');  
          }
          return
        }
        this._ToastrService.error(err.error, 'Error');
  
      },
    })
    
  }

  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  dateFormat(date: string) { 
    return moment.utc(date).format('YYYY-MM-DD');
  }
}
