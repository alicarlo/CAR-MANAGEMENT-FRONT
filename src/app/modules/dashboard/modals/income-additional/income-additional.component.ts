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
import { IncomeService } from 'src/app/core/services/income/income.service';

@Component({
  selector: 'app-income-additional',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './income-additional.component.html',
  styleUrl: './income-additional.component.css'
})
export class IncomeAdditionalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
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


  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<IncomeAdditionalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _AuthService: AuthService,
    private _IncomeService: IncomeService
   ) { }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      name: new FormControl (''),
      file: new FormControl (null),
      document_type_id: new FormControl (1,Validators.compose([Validators.required])),
      id: new FormControl (''),
  	});
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
    let documentId = '';
    if (this.saveForm.value.file !== null) {
      
      try {
        let type: any = 10;
        const formData = new FormData();
        formData.append('document_type_id', type);
        formData.append('descriptions', 'Cobros adicionales');
        formData.append('file', this.saveForm.value.file);
        const token = this._AuthService.tokenValue;
        const response = await fetch(`https://automotriz-api.naatteam.com/document/${this.saveForm.value.id}`, {
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

        let dataIncome: any = {
          id: this.data.row.id,
          document_id: documentId
        }
        this._IncomeService.updateIncome(dataIncome).subscribe({
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
      } catch (err: any) {
        this.loading = false;
        this._ToastrService.error(err.message, 'Error');
      }
    }
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
