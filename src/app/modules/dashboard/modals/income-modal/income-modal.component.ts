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
import moment from 'moment';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-income-modal',
  imports: [NgxMaskDirective, NgxMaskPipe,ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  providers: [provideNgxMask()],
  templateUrl: './income-modal.component.html',
  styleUrl: './income-modal.component.css'
})
export class IncomeModalComponent {
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
		]
	}

  typePayments: any[] = [];
  todayStr = new Date().toISOString().slice(0, 10); 

  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<IncomeModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _IncomeService: IncomeService,
    private _TypePaymentsService: TypePaymentsService,
    private _AuthService: AuthService
  ) 
  {}

  ngOnInit(): void {

    this.init();
    this.getTypePayments();
  }

   init() {
    if (this.data.flag === 0) {
      this.saveForm = this._FormBuilder.group({
        user_id: new FormControl(this._AuthService.user()?.user_id),
        layaway_id: new FormControl(this.data.row.layaway.id),
        payment_method_id: new FormControl(this.data.row === null ? '' : this.data.row.payment_method_id,Validators.compose([Validators.required])),
        amount: new FormControl(this.data.row === null ? '' : this.data.row.layaway.incomes[0].amount,Validators.compose([Validators.required])),
        comments: new FormControl(this.data.row === null ? '' : this.data.row.layaway.comments),
        id: new FormControl(this.data.row === null ? '' : this.data.row.id),
      });
    }else{
      this.saveForm = this._FormBuilder.group({
        user_id: new FormControl(this._AuthService.user()?.user_id),
        layaway_id: new FormControl(this.data.row.id),
        payment_method_id: new FormControl('',Validators.compose([Validators.required])),
        amount: new FormControl('',Validators.compose([Validators.required])),
        comments: new FormControl(''),
        date_income: new FormControl(this.todayStr),
        file: new FormControl (null),
        name: new FormControl (''),
      });
    }
  }

  dateFormat(date: string) { 
    return moment.utc(date).format('YYYY-MM-DD');
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

  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
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

    if (this.data.flag === 1) {
      filledValues['income_type'] = 'abono_apartados'
    }else
    if(this.data.flag === 4){
      // filledValues['income_type'] = 'cobros_adicionales'
    }
  
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
          formData.append('descriptions', 'Abono de apartado');
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
