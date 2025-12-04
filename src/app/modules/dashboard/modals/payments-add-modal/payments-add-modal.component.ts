import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { STATUS } from 'src/app/core/constants/global';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DocumentsService } from 'src/app/core/services/documents/documents.service';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { TypeDocumentsService } from 'src/app/core/services/typeDocuments/type-documents.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';


@Component({
  selector: 'app-payments-add-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './payments-add-modal.component.html',
  styleUrl: './payments-add-modal.component.css'
})
export class PaymentsAddModalComponent {
  saveForm : FormGroup | undefined | any;
  typePayments: any[] = [];
  documents: any[] = [];
  loading: boolean = false;
  typeDocument: any = [];
  error_messages={
		'payment_method_id':[
      {type: 'required', message: 'Metodo es requerido'},
		],
		'amount':[
			{type: 'required', message: 'Monto es requerido'},
		],
    'document_type_id':[
			{type: 'required', message: 'Campo es requerido'},
		],
		'descriptions':[
      {type: 'required', message: 'Campo es requerido'},
		],
		'file':[
			{type: 'required', message: 'Archivo es requerido'},
		],
	}

  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 

  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';
  flagFile: boolean = false;

  isUrl = false;
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<PaymentsAddModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypeCarsService: TypeCarsService,
    private _TypePaymentsService: TypePaymentsService,
    private _InvestorService: InvestorService,
    private _ShopingService: ShopingService,
    private _AuthService: AuthService,
    private _DocumentsService: DocumentsService,
    private _TypeDocumentsService: TypeDocumentsService,
  ) 
  { }

  ngOnInit(): void {
    this.init();
    this.getTypePayments();
    this.getDocuments();
    this.getTypeDocument();
  }

  getTypeDocument() {
    this._TypeDocumentsService.getTypeDocument(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeDocument = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    }) 
  }

   init() {
    console.log(this.data);
    if (this.data.flag  === 0) {
      this.saveForm = this._FormBuilder.group({
        payment_method_id: new FormControl (this.data.row === null ? '' : this.data.row.payment_method_id,Validators.compose([Validators.required])),
        amount: new FormControl (this.data.row === null ? '' : this.data.row.amount,Validators.compose([Validators.required])),
        status: new FormControl (this.data.row === null ? '' : this.data.row.status),
        document_id: new FormControl (this.data.row === null ? '' : this.data.row.document_id),
        id: new FormControl (this.data.row === null ? '' : this.data.row.id),
        document_type_id: new FormControl (this.data.row === null ? '' : 1,Validators.compose([Validators.required])),
        descriptions: new FormControl (this.data.row === null ? '' : this.data.row.document.descriptions,Validators.compose([Validators.required])),
        file: new FormControl (this.data.row === null ? '' : this.data.row.document.url,Validators.compose([Validators.required])),
        bill_id: new FormControl (this.data.row === null ? '' : this.data.row.bill.id,Validators.compose([Validators.required])),
  	  });
    }else
    if (this.data.flag  === 1) {
      this.saveForm = this._FormBuilder.group({
        payment_method_id: new FormControl ('',Validators.compose([Validators.required])),
        amount: new FormControl ('',Validators.compose([Validators.required])),
        status: new FormControl (''),
        document_id: new FormControl (''),
        id: new FormControl (''),
        document_type_id: new FormControl (1,Validators.compose([Validators.required])),
        descriptions: new FormControl ('',Validators.compose([Validators.required])),
        file: new FormControl ('',Validators.compose([Validators.required])),
  	  });
    }else{
      this.saveForm = this._FormBuilder.group({
        payment_method_id: new FormControl (this.data.row === null ? '' : this.data.row.payment_method_id,Validators.compose([Validators.required])),
        amount: new FormControl (this.data.row === null ? '' : this.data.row.amount,Validators.compose([Validators.required])),
        status: new FormControl (this.data.row === null ? '' : this.data.row.status),
        document_id: new FormControl (this.data.row === null ? '' : this.data.row.document_id),
        id: new FormControl (this.data.row === null ? '' : this.data.row.id),
        document_type_id: new FormControl (1,Validators.compose([Validators.required])),
        descriptions: new FormControl (this.data.row === null ? '' : this.data.row.document.descriptions,Validators.compose([Validators.required])),
        file: new FormControl (this.data.row === null ? '' : this.data.row.document.url,Validators.compose([Validators.required])),
  	  });
    }

    if (this.data.row !== null && this.data.row.document)
      this.isUrl = this.data.row !== null && !!this.data.row.document.url;
    }

  getDocuments() {
    this.loading = false;
    this._DocumentsService.getDocuments(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.documents = response.items.map((r: any) => ({ ...r, document_type: r.document_type.name}));
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

  close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

  async save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
      return;
    }

    this.loading = true;
    let id = '';
    try {
      if (this.isUrl === false) {
        const formData = new FormData();
        formData.append('document_type_id', this.saveForm.value.document_type_id);
        formData.append('descriptions', this.saveForm.value.descriptions);
        formData.append('file', this.saveForm.value.file);
        if (this.data.row !== null) {
          // formData.append('id', this.saveForm.value.id);
        }
        const token = this._AuthService.tokenValue;
        // ${this.saveForm.value.id}
        const response = await fetch(`https://automotriz-api.naatteam.com/document/`, {
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
        id = data.id;
    
      }else {
        id = this.data.row.document.id  
      }
    } catch (err: any) {
      this.loading = false;
      this._ToastrService.error(err.message, 'Error');
    }


    let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
      const val = this.saveForm.value[key as keyof typeof this.saveForm.value];
      if (val !== null && val !== '' && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {} as typeof this.saveForm.value);
    
    /*filledValues = this.data.flag === 1 ? 
      { amount: this.saveForm.value.amount, payment_method_id: this.saveForm.value.payment_method_id, document_id: id, purchase_id: this.data.row.id } : 
      {...filledValues, id: this.data.row.id};
      */

    if (this.data.flag === 1) {
      filledValues =  { amount: this.saveForm.value.amount, payment_method_id: this.saveForm.value.payment_method_id, document_id: id, purchase_id: this.data.row.id }
    }else
    if(this.data.flag === 0) {
      /*
      filledValues = this.isUrl === false
        ? { amount: this.saveForm.value.amount, payment_method_id: this.saveForm.value.payment_method_id, document_id: id, bill_id: this.saveForm.value.bill_id } 
        : { amount: this.saveForm.value.amount, payment_method_id: this.saveForm.value.payment_method_id, bill_id: this.saveForm.value.bill_id } 
        */
       filledValues = { amount: this.saveForm.value.amount, payment_method_id: this.saveForm.value.payment_method_id, document_id: id, bill_id: this.saveForm.value.bill_id }
    }else{
      filledValues = {...filledValues, id: this.data.row.id};
    }

    const methodMap = {
      registerPayment: this._ShopingService.registerPayment.bind(this._ShopingService),
      updatePayment:   this._ShopingService.updatePayment.bind(this._ShopingService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.flag === 1 || this.data.flag === 0 ? 'registerPayment' : 'updatePayment';
    
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

  /*get isUrl(): boolean {
    console.log(this.data.row)
    return this.data.row !== null && !!this.data.row.document.url;
  }
    */

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
