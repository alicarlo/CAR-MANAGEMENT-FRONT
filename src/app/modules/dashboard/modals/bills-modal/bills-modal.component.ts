import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ExpenseClasificationService } from 'src/app/core/services/expenseClasification/expense-clasification.service';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { BillService } from 'src/app/core/services/bill/bill.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { environment } from 'src/environments/environment';
import moment from 'moment';


@Component({
  selector: 'app-bills-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './bills-modal.component.html',
  styleUrl: './bills-modal.component.css'
})
export class BillsModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  classification: any[] = [];
  typePayments: any[] = [];
  cars: any[] = [];
  error_messages={
    'option':[
			{type: 'required', message: 'Opcion es requerido'},
		],
    'classification_bill_id':[
      {type: 'required', message: 'Clasificacion es requerido'},
    ],
    'user_created_id':[
      {type: 'required', message: 'Usuario es requerido'},
    ],
    'payment_method_id':[
      {type: 'required', message: 'Metodo de pago es requerido'},
    ],
    'amount':[
      {type: 'required', message: 'Monto es requerido'},
    ],
    'bill_date': [
      {type: 'required', message: 'Fecha de gasto requerido'},
    ]
	}

  user: any[] = [];

  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';

  filteredCars: any[] = [];
  carsDropdownOpen = false;
  carFilterControl = new FormControl('');
  selectedCarLabel = '';
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<BillsModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _ExpenseClasificationService: ExpenseClasificationService,
    private _TypeExpenseService: TypeExpenseService,
    private _BillService: BillService,
    private _CarsService: CarsService,
    private _UsersService: UsersService,
    private _AuthService: AuthService,
    private _TypePaymentsService: TypePaymentsService,
    private _ShopingService: ShopingService
  ) 
  { }

  ngOnInit(): void {
    this.init();
    this.carFilterControl.valueChanges.subscribe(term => {
        const value = (term || '').toString().toLowerCase().trim();

        this.filteredCars = this.cars.filter(car => {
          const text = `${car.key} ${car.make} ${car.model} ${car.plate || ''}`.toLowerCase();
          return text.includes(value);
        });
      });
    this.getClassification();
    this.getCars();
    this.getUsers();
    this.getTypePayments()
    // this.getTypeExpense();
  }

   openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      option: new FormControl (null,this.data?.row !== null ? [] : [Validators.required]),
      classification_bill_id: new FormControl (this.data.row === null ? '' : this.data.row.classification_bill_id,Validators.compose([Validators.required])),
      // car_id: new FormControl (this.data.row === null ? '' : this.data.row.cars.length === 0 ? '' : this.data.row.cars[0].id ),
      car_id: new FormControl (''), 
      name: new FormControl (this.data.row === null ? '' : this.data.row.name),
      user_created: new FormControl (this._AuthService.user()?.user_id),
      payment_method_id: new FormControl ('', this.data?.row !== null ? [] : [Validators.required]),
      amount: new FormControl(
        {
          value: this.data?.row === null ? '' : this.data.row.total,
          disabled: this.data?.row !== null
        },
        Validators.compose([Validators.required])
      ),
      file: new FormControl (null),
      document_type_id: new FormControl (this.data.row === null ? 1 : '',this.data?.row !== null ? [] : [Validators.required]),
      id: new FormControl (this.data.row === null ? '' : this.data.row.id),
      bill_date: new FormControl (this.data.row === null ? '' : moment.utc(this.data.row.bill_date).format('YYYY-MM-DD'), Validators.compose([Validators.required])),
  	});

    if (this.data.row !== null) {
      // this.carFilterControl.setValue(this.data.row.cars[0].id);
      if (this.data.row.cars.length !== 0) {
        //this.selectedCarLabel = `${this.data.row.cars[0].make} - ${this.data.row.cars[0].model}`;
        // this.saveForm.patchValue({ car_id: this.data.row.cars[0].id});  
      }
      
    }
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

  getClassification() {
    this._ExpenseClasificationService.getExpenseClasification(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.classification = response.items
            .map((r: any) => ({ ...r }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
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

  getUsers() {
    this._UsersService.getUsers(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.user = response.items.map((r: any) => ({ ...r.authz[0], ...r.user }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
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
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

  async save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
      return;
    }
    this.loading = true;
    let documentId = '';

    if (this.data.row === null) {
      if (this.saveForm.value.file !== null) {
        try {
          const formData = new FormData();
          formData.append('document_type_id', this.saveForm.value.document_type_id);
          formData.append('descriptions', this.saveForm.value.name);
          formData.append('file', this.saveForm.value.file);
          const token = this._AuthService.tokenValue;
          const response = await fetch(`${environment.apiUrl}/document/${this.saveForm.value.id}`, {
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
    }
    

    const billId: string | boolean | unknown =  await this.addBill();
    if (billId === false) {
      this._ToastrService.error('Problemas al generar el gasto', 'Error');  
      this.loading = false;
      return;
    }

    if (this.data.row === null) {
      await this.addPayment(billId, documentId);  
    }
    
    this.loading = false;
    let msg = this.data.row === null ? 'Gasto registrado correctamente' : 'Gasto actualizado correctamente';
    this._ToastrService.success(msg, 'Éxito');
    this.close(true);
  }

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }


  async addBill() {
    return new Promise((resolve, reject) => {
      let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
      const val = this.saveForm.value[key as keyof typeof this.saveForm.value];
      if (val !== null && val !== '' && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as typeof this.saveForm.value);
    
    let car_id = filledValues.car_id
    filledValues = this.data.row === null ? 
      { name: filledValues.name, 
        classification_bill_id: filledValues.classification_bill_id,
        user_created: filledValues.user_created,
        bill_date: filledValues.bill_date
      } : 
      {...filledValues, id: this.data.row.id};

      if (car_id !== null && car_id !== undefined) {
        filledValues['car_id'] = [car_id]
      }

      const methodMap = {
        registerBill: this._BillService.registerBill.bind(this._BillService),
        updateBill:   this._BillService.updateBill.bind(this._BillService),
      } as const;
      
      type MethodKey = keyof typeof methodMap; 

      const methodSelect: MethodKey =
        this.data.row === null ? 'registerBill' : 'updateBill';
      
        methodMap[methodSelect](filledValues).subscribe({
        next: async (response) => {
          if(response) {
            resolve(response.id)
          }
        },
        error: (err: unknown | any) => {
          this.loading = false;
          if (!Array.isArray(err.error)) {
            this._ToastrService.error(err.error, 'Error');  
            resolve(false)
          }

          if (err.error === "Token expired") {
            resolve(false)
          }

          if (err.error && err.error.length > 0) {
            let errorResponse: any[] = err.error;
            for (const item of errorResponse) {
              this._ToastrService.error(item.msg, 'Error');  
            }
            resolve(false)
          }
          this._ToastrService.error(err.error, 'Error');
        },
      })
    })
  }

  async addPayment(billId: string | boolean | unknown, documentId: string) {
    return new Promise((resolve, reject) => {
      let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
      const val = this.saveForm.value[key as keyof typeof this.saveForm.value];
      if (val !== null && val !== '' && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as typeof this.saveForm.value);
    
    if (this.data.row === null) {
      if (documentId !== null && documentId !== '') {
        filledValues =  { 
          payment_method_id: filledValues.payment_method_id,
          document_id: documentId,
          amount: filledValues.amount,
          bill_id: billId,
        }
      }else{
        filledValues =  { 
          payment_method_id: filledValues.payment_method_id,
          amount: filledValues.amount,
          bill_id: billId,
        }
      }
    }else{
      filledValues = {...filledValues, id: this.data.row.id};
    }

    const methodMap = {
      registerPayment: this._ShopingService.registerPayment.bind(this._ShopingService),
      updatePayment:   this._ShopingService.updatePayment.bind(this._ShopingService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerPayment' : 'updatePayment';
    
      methodMap[methodSelect](filledValues).subscribe({
      next: async (response) => {
        if(response) {
          resolve(true)
        }
      },
      error: (err: unknown | any) => {
        this.loading = false;
        if (!Array.isArray(err.error)) {
          this._ToastrService.error(err.error, 'Error');  
          return;
        }

        if (err.error === "Token expired") {
       
          resolve(false)
        }

        if (err.error && err.error.length > 0) {
          let errorResponse: any[] = err.error;
          for (const item of errorResponse) {
            this._ToastrService.error(item.msg, 'Error');  
          }
          resolve(false)
        }
        this._ToastrService.error(err.error, 'Error');
      },
    })
    })
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
