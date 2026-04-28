import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SALESTYPE, STATUS } from 'src/app/core/constants/global';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { Clients } from 'src/app/core/models/clients.model';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { LaywayService } from 'src/app/core/services/layway/layway.service';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { environment } from 'src/environments/environment';
import moment from 'moment-timezone';

@Component({
  selector: 'app-layaway-modal',
  imports: [NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './layaway-modal.component.html',
  styleUrl: './layaway-modal.component.css'
})
export class LayawayModalComponent {
saveForm : FormGroup | undefined | any;
loading: boolean = false;
status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
salesType = [SALESTYPE.CONTADO, SALESTYPE.CREDITO];
error_messages={
  'client_id':[
    {type: 'required', message: 'Cliente es requerido'},
  ],
  'car_id':[
    {type: 'required', message: 'Auto es requerido'},
  ],
  'arrived_at':[
    {type: 'required', message: 'Fecha es requerida'},
  ],
  'car_type_id': [
    {type: 'required', message: 'Tipo es requerido'},
  ],
  'amount_sale': [
    {type: 'required', message: 'Precio de venta acordado es requerido'},
  ],
  'amount_layaway': [
    {type: 'required', message: 'Anticipo acordado es requerido'},
  ],
  'amount_down_payment': [
    {type: 'required', message: 'Monto Recibido es requerido'},
  ],
  'date_commitment': [
    {type: 'required', message: 'Fecha compromiso de compra es requerida'},
  ],
  'sales_type': [
    {type: 'required', message: 'Tipo de venta es requerido'},
  ],
  'payment_method_id':[
    {type: 'required', message: 'Metodo de pago es requerido'},
  ],
}

clients: Clients[] = []
cars: any[] = [];
typePayments: any[] = [];
// todayStr = new Date().toISOString().slice(0, 10); 
todayStr = moment().tz('America/Tijuana').format('YYYY-MM-DD');

maxSizeBytes = 25 * 1024 * 1024; // 25MB
selectedFile: File | null = null;
previewUrl: string | null = null;
fileIcon: string = 'insert_drive_file';
fileExt: string = '';

  carFilterControl = new FormControl('');
  filteredCars: any[] = [];
  carsDropdownOpen = false;
  selectedCarLabel = '';
constructor(
  private _FormBuilder: FormBuilder,                                               
  private dialog: MatDialog,                                 
  @Optional() public dialogRef: MatDialogRef<LayawayModalComponent> | null, 
  @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  private _ToastrService: ToastrService,
  private _ClientsService: ClientsService,
  private _CarsService: CarsService,
  private _AuthService: AuthService,
  private _TypePaymentsService: TypePaymentsService,
  private _LaywayService: LaywayService,
  private _IncomeService: IncomeService
) {}



 ngOnInit(): void {
    this.init();
    /*
    this.carFilterControl.valueChanges.subscribe(term => {
        const value = (term || '').toString().toLowerCase().trim();

        this.filteredCars = this.cars.filter(car => {
          const text = `${car.key} ${car.make} ${car.model} ${car.plate || ''}`.toLowerCase();
          return text.includes(value);
        });
      });
    */
   this.carFilterControl.valueChanges.subscribe(term => {
      const value = (term || '')
        .toString()
        .toLowerCase()
        .trim();

      this.filteredCars = this.cars.filter((car: any) => {

        const text = [
          car.key,
          car.make,
          car.model,
          car.plate,
          car.color,
          car.version
        ]
          .map(v => (v || '').toString().toLowerCase())
          .join(' ');

        return text.includes(value);
      });
    });
   this.getClients();
   this.getCars();
   this.getTypePayments();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      client_id: new FormControl (this.data.row === null ? null : this.data.row.client_id,Validators.compose([Validators.required])),
      car_id: new FormControl (this.data.row === null ? '' : this.data.row.car_id,Validators.compose([Validators.required])),
      sale_price: new FormControl (''),
      amount_sale: new FormControl (this.data.row === null ? '' : this.data.row.amount_sale,Validators.compose([Validators.required])),
      amount_layaway: new FormControl (this.data.row === null ? '' : this.data.row.amount_layaway,Validators.compose([Validators.required])),
      amount_down_payment: new FormControl (this.data.row === null ? '' : this.data.row.amount_down_payment,Validators.compose([Validators.required])),
      date_commitment: new FormControl (this.data.row === null ? '' : this.data.row.date_layaway,Validators.compose([Validators.required])),
      date_layaway: new FormControl (this.todayStr),
      user_id: new FormControl(this._AuthService.user()?.user_id),
      sales_type: new FormControl (this.data.row === null ? '' : this.data.row.sales_type),
      comments: new FormControl (this.data.row === null ? '' : this.data.row.comments),
      payment_method_id: new FormControl (this.data.row === null ? '' : this.data.row.payment_method_id,Validators.compose([Validators.required])),
      file: new FormControl (null),
      name: new FormControl (''),
      
  	});

    console.log(this.todayStr)
    this.saveForm.get('car_id')?.valueChanges.subscribe((value: any) => {
      let find = this.cars.find(x => String(x.id) === String(value));
      this.saveForm.get('sale_price')?.setValue(find.sale_price);
    });
  }

  toggleCarsDropdown() {
    this.carsDropdownOpen = !this.carsDropdownOpen;
    if (this.carsDropdownOpen) {
      this.carFilterControl.setValue('');
      this.filteredCars = [...this.cars];
    }
  }

  closeCarsDropdown() {
    this.carsDropdownOpen = false;
  }

  selectCar(car: any) {
    this.selectedCarLabel = `${car.make} - ${car.model}`;
    this.saveForm.patchValue({ car_id: car.id });
    this.closeCarsDropdown();
  }

  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  getTypePayments() {
    this._TypePaymentsService.getTypePayments(100,1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typePayments = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

   getClients() {
    this.loading = false;
    this._ClientsService.getClient(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.clients = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getCars() {
    this.loading = false;
    this._CarsService.getCars('',500, 1, 'venta').subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ ...r }));
          this.filteredCars = [...this.cars];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
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
      registerLayaway: this._LaywayService.registerLayaway.bind(this._LaywayService),
      updateLayaway:   this._LaywayService.updateLayaway.bind(this._LaywayService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerLayaway' : 'updateLayaway';
    
      methodMap[methodSelect](filledValues).subscribe({
      next: async (response) => {
        if(response) {
          let dataIncome: any = {
            user_id: filledValues.user_id,
            layaway_id: response.id,
            payment_method_id: filledValues.payment_method_id,
            amount: filledValues.amount_down_payment,
            date_income: filledValues.date_layaway,
            comments: filledValues.comments
          }

          if (this.data.row === null) {
            dataIncome['income_type'] = 'enganche_apartados';
          }

          let documentId = '';
          if (this.saveForm.value.file !== null) {
            
            try {
              let type: any = 10;
              const formData = new FormData();
              formData.append('document_type_id', type);
              formData.append('descriptions', 'Abono de apartado');
              formData.append('file', this.saveForm.value.file);
              const token = this._AuthService.tokenValue;
              const response = await fetch(`${environment.apiUrl}/document/`, {
                method: 'POST',// this.data.flag ===  1 ? 'POST' : 'PATCH',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              if (!response.ok) {
                this.loading = false;
                throw new Error(`Error en la solicitud: ${response.statusText}`);
              }

              const raw = await response.text();
              let data: any;
              data = JSON.parse(raw);
              documentId = data.id;
            } catch (err: any) {
              this.loading = false;
              this._ToastrService.error(err.message, 'Error');
            }
          }

          if (documentId !== '') {
            dataIncome['document_id'] = documentId;
          }

          this._IncomeService.registerIncome(dataIncome).subscribe({
            next: async (response) => {
              if(response) {
                 this._ToastrService.success('Registro exitoso', 'Exito');
                this.loading = false;
                this.close(true);
              }
            },
            error: (err) => {
              if (err.error === "Token expired") return;
              this.loading = true;
              this._ToastrService.error(err.error, 'Error');
            },
          })
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

   get attachmentCtrl() {
    return this.saveForm.get('file');
  }

  get isImage() {
    return !!this.selectedFile?.type?.startsWith('image/');
  }
  get isVideo() {
    return !!this.selectedFile?.type?.startsWith('video/');
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;

    this.removePreviewOnly();
    this.attachmentCtrl?.setErrors(null);

    if (!file) {
      this.attachmentCtrl?.setValue(null);
      return;
    }

    if (!this.isAllowedType(file)) {
      this.attachmentCtrl?.setErrors({ invalidType: true });
      this.attachmentCtrl?.markAsTouched();
      return;
    }


    if (file.size > this.maxSizeBytes) {
      this.attachmentCtrl?.setErrors({ maxSize: true });
      this.attachmentCtrl?.markAsTouched();
      return;
    }

    this.selectedFile = file;
    this.attachmentCtrl?.setValue(file);
    this.attachmentCtrl?.markAsDirty();

    this.fileIcon = this.resolveIcon(file);
    this.fileExt = this.getExt(file.name);

    if (this.isImage || this.isVideo) {
      this.previewUrl = URL.createObjectURL(file);
    }
  }

  removeFile() {
    this.removePreviewOnly();
    this.selectedFile = null;
    this.fileIcon = 'insert_drive_file';
    this.fileExt = '';
    this.attachmentCtrl?.setValue(null);
    this.attachmentCtrl?.markAsDirty();

    const input = document.getElementById('attachmentInput') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  private removePreviewOnly() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private isAllowedType(file: File): boolean {
    const t = (file.type || '').toLowerCase();
    const ext = this.getExt(file.name);

    const okMime =
      t.startsWith('image/') ||
      t.startsWith('video/') ||
      t === 'application/pdf' ||
      t === 'application/msword' ||
      t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const okExt =
      ['.jpg','.jpeg','.png','.gif','.webp','.svg',
      '.mp4','.mov','.webm','.mkv',
      '.pdf','.doc','.docx'].includes(ext);

    return okMime || okExt;
  }

  private resolveIcon(file: File): string {
    const t = (file.type || '').toLowerCase();
    const ext = this.getExt(file.name);

    if (t.startsWith('image/') || ['.jpg','.jpeg','.png','.gif','.webp','.svg'].includes(ext)) return 'image';
    if (t.startsWith('video/') || ['.mp4','.mov','.webm','.mkv'].includes(ext)) return 'movie';
    if (t === 'application/pdf' || ext === '.pdf') return 'picture_as_pdf';
    if (t === 'application/msword' || t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.doc' || ext === '.docx') return 'description';
    return 'insert_drive_file';
  }

  private getExt(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i).toLowerCase() : '';
  }
}
