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
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { IncomeService } from 'src/app/core/services/income/income.service';
import moment from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';

@Component({
  selector: 'app-additional-income-modal',
  imports: [NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './additional-income-modal.component.html',
  styleUrl: './additional-income-modal.component.css'
})
export class AdditionalIncomeModalComponent {
  saveForm : FormGroup | undefined | any;
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
		],
    'car_id':[
      {type: 'required', message: 'Auto es requerido'},
    ],
    'store_id':[
      {type: 'required', message: 'Sucursal es requerido'},
    ],
    'client_id':[
      {type: 'required', message: 'Cliente es requerido'},
    ],
	}
  todayStr = moment().tz('America/Tijuana').format('YYYY-MM-DD');
  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';

  ref: any = null;

  clients: any = [];
  filteredClients: any = [];
  clientsFilterControl = new FormControl('');
  clientsDropdownOpen = false;
  selectedClientsLabel = '';

  store: any = [];
  filteredStores: any = [];

  cars: any = [];
  filteredCars: any = [];
  carFilterControl = new FormControl('');
  carsDropdownOpen = false;
  selectedCarLabel = '';

  typePayments: any = [];
  filteredTypePayments: any = []; 
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<AdditionalIncomeModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _IncomeService: IncomeService,
    private _TypePaymentsService: TypePaymentsService,
    private _AuthService: AuthService,
    private _MatDialog: MatDialog,
    private _ClientsService: ClientsService,
    private _StoreService: StoreService,
    private _CarsService: CarsService
  ) 
  {}

  ngOnInit() {
    this.getCars();
    this.getStores();
    this.getClients();
    this.getTypePayments();
    this.init();
    /*
    this.carFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredCars = this.cars.filter((car: any) => {
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

    this.clientsFilterControl.valueChanges.subscribe(term => {
      const value = (term || '').toString().toLowerCase().trim();

      this.filteredClients = this.clients.filter((item: any) => {
        const text = `${item.full_name}`.toLowerCase();
        return text.includes(value);
      });
    });
  
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      // sale_id
      client_id: new FormControl('',Validators.compose([Validators.required])),
      car_id: new FormControl('',Validators.compose([Validators.required])),  
      store_id: new FormControl('',Validators.compose([Validators.required])),
      user_id: new FormControl(this._AuthService.user()?.user_id),
      payment_method_id: new FormControl('',Validators.compose([Validators.required])),
      amount: new FormControl('',Validators.compose([Validators.required])),
      comments: new FormControl(''),
      date_income: new FormControl(this.todayStr),
      file: new FormControl (null),
    });
  }

  async save() {
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

    filledValues['income_type'] = 'cobros_adicionales'
  
    const methodMap = {
      registerIncome: this._IncomeService.registerIncome.bind(this._IncomeService),
      updateIncome:   this._IncomeService.updateIncome.bind(this._IncomeService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.flag !== 0 ? 'registerIncome' : 'updateIncome';
    
      let documentId = '';
      if (this.saveForm.value.file !== null) {
        
        try {
          let type: any = 10;
          const formData = new FormData();
          formData.append('document_type_id', type);
          formData.append('descriptions', 'cobros adicionales');
          formData.append('file', this.saveForm.value.file);

          const token = this._AuthService.tokenValue;
          const response = await fetch(`${environment.apiUrl}/document/`, {
            method: 'POST',
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
        filledValues['document_id'] = documentId;
      }

      if (this.data.flag !== 0) {
        filledValues['description'] = this.saveForm.value.comments;
      }
      
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

  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
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

  get attachmentCtrl() {
    return this.saveForm.get('file');
  }

  get isImage() {
    return !!this.selectedFile?.type?.startsWith('image/');
  }
  get isVideo() {
    return !!this.selectedFile?.type?.startsWith('video/');
  }

  getClients() {
    this.loading = false;
    this._ClientsService.getClient(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.clients = response.items.map((r: any) => ({ ...r }));
          this.filteredClients = [...this.clients];
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getStores() {
    this.loading = false;
    this._StoreService.getStore(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.store = response.items.map((r: any) => ({ ...r }));
          this.filteredStores = [...this.store];
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
    this._CarsService.getCarsBill('',500, 1).subscribe({
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

  getTypePayments() {
    this._TypePaymentsService.getTypePayments(100,1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typePayments = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
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

  toggleClientsDropdown() {
    this.clientsDropdownOpen = !this.clientsDropdownOpen;
    if (this.clientsDropdownOpen) {
      this.clientsFilterControl.setValue('');
      this.filteredClients = [...this.clients];
    }
  }

  closeClientsDropdown() {
    this.clientsDropdownOpen = false;
  }

  selectClient(item: any) {
    this.selectedClientsLabel = `${item.full_name}`;
    this.saveForm.patchValue({ client_id: item.id });
    this.closeClientsDropdown();
  }

}
