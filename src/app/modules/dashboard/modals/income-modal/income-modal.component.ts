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
import { ActionMessageComponent } from 'src/app/modules/uikit/pages/action-message/action-message.component';

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

  ref: any;
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<IncomeModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _IncomeService: IncomeService,
    private _TypePaymentsService: TypePaymentsService,
    private _AuthService: AuthService,
    private _MatDialog: MatDialog,
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
    }else
    if(this.data.flag === 1){
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
    }else{
      this.saveForm = this._FormBuilder.group({
        // sale_id
        user_id: new FormControl(this._AuthService.user()?.user_id),
        installment_id: new FormControl(this.data.itemSelected.id),
        payment_method_id: new FormControl('',Validators.compose([Validators.required])),
        amount: new FormControl('',Validators.compose([Validators.required])),
        comments: new FormControl(''),
        date_income: new FormControl(this.todayStr),
        file: new FormControl (null),
      });
    }
  }

  incomeAmount() {
    return (this.data.itemSelected.incomes || []).reduce(
      (acc: number, item: any) => acc + (Number(item.amount) || 0),
      0
    );
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
          formData.append('descriptions', this.data.flag === 5 ? 'Abono de apartado' : 'Abono de cobranza');
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

  async actionModalFile(flag: number,action: string, data: any, msg: string, color: string = '!text-blue-500', icon = 'cloud_download') {
      color = flag === 1
        ? '!text-blue-500'
        : flag === 2
          ? '!text-red-500'
          : '!text-green-500';
      icon = flag === 1
        ? 'cloud_download'
        : flag === 2
          ? 'delete'
          : 'check';
          
      let dataSend = {action, row: data, msg, color, icon};
  
      this.ref = this._MatDialog.open(ActionMessageComponent, {
        data: dataSend,
        disableClose: true,
        panelClass: ['custom-dialog-container', 'dialog-40'],
        width: '40vw',
        height: '40vh',
        maxWidth: '40vw'
      });
      
      return new Promise((resolve) => {
        this.ref.componentInstance.accept.subscribe(() => {
          this.ref.close(true);
          resolve(true);
        });

        this.ref.afterClosed().subscribe((result: any) => {
          resolve(!!result);
        });
      });
    }

  async saveMonto() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
      return;
    }

    const flagShow =  await this.actionModalFile(3,'approve', '', 'Desea continuar con el pago?');
    if (flagShow === false) return;
    this.loading = true;
    
    const incomes = this.buildIncomesFromPayment();
    if (!incomes) return;
    const payload = {
      incomes
    };

    let documentId = '';    
    try {
      if (this.saveForm.value.file !== null) {
        let type: any = 10;
        const formData = new FormData();
        formData.append('document_type_id', type);
        formData.append('descriptions', 'Pago en cobranza');
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
      }
      const methodMap = {
        registerIncome: this._IncomeService.registerIncome.bind(this._IncomeService),
        updateInstallment:   this._IncomeService.updateIntallment.bind(this._IncomeService),
      } as const;

      let completed = 0;
      let total = incomes.length;
      let hasError = false;

      for (const income of incomes) {
        const payload: any = {
          user_id: income.user_id,
          installment_id: income.installment_id,
          payment_method_id: income.payment_method_id,
          amount: income.amount,
          comments: income.comments,
          date_income: income.date_income,
          file: income.file,
        };

        if (documentId !== '') {
          payload['document_id'] = documentId;
        }

        methodMap.registerIncome(payload).subscribe({
          next: (response) => {

            if (income.paid === true) {
              methodMap.updateInstallment({ paid: true, id: income.installment_id }).subscribe({
                next: () => finish(),
                error: (err) => handleError(err)
              });
            } else {
              finish();
            }
          },
          error: (err) => handleError(err)
        });
      }

      const finish = () => {
        completed++;

        if (completed === total && !hasError) {
          this.loading = false;
          this._ToastrService.success('Pago registrado correctamente', 'Éxito');
          this.close(true);
        }
      };

      const handleError = (err: any) => {
        hasError = true;
        this.loading = false;

        if (!Array.isArray(err.error)) {
          this._ToastrService.error(err.error, 'Error');  
          return;
        }

        if (err.error === "Token expired") {
          this.close();
          return;
        }

        if (err.error?.length) {
          for (const item of err.error) {
            this._ToastrService.error(item.msg, 'Error');  
          }
        }
      };
    
    } catch (err: any) {
      this.loading = false;
      this._ToastrService.error(err.message, 'Error');
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


  buildIncomesFromPayment() {
    let payment = this.saveForm.value.amount;

    // limpiar formato $13,571.43
    payment = Number((payment + '').replace(/[$,]/g, ''));

    const selected = this.data.itemSelected;

    // ❌ validar monto inválido general
    if (!payment || payment <= 0) {
      this.saveForm.get('amount')?.setErrors({ invalidAmount: true });
      this._ToastrService.error(
        'El monto debe ser mayor, si requieres abonar un monto parcial, usa el botón "Abonar"',
        'Error'
      );
      this.loading = false;
      return null;
    }

    const installments = this.data.data;

    // 🔥 calcular pendiente del seleccionado
    const selectedPaid = (selected.incomes || []).reduce(
      (acc: number, inc: any) => acc + (Number(inc.amount) || 0),
      0
    );

    const selectedPending = Math.max(
      (Number(selected.amount) || 0) - selectedPaid,
      0
    );

    // 🔴 VALIDACIÓN IMPORTANTE
    if (payment < selectedPending) {
      this.saveForm.get('amount')?.setErrors({ minAmount: true });
      this._ToastrService.error(
        `El monto debe ser igual o mayor a ${selectedPending}, si requieres abonar un monto parcial, usa el botón "Abonar"`,
        'Error'
      );
      this.loading = false;
      return null;
    }

    let remaining = payment;
    let startProcessing = false;

    const commonData = {
      user_id: this.saveForm.value.user_id,
      payment_method_id: this.saveForm.value.payment_method_id,
      comments: this.saveForm.value.comments,
      date_income: this.saveForm.value.date_income,
      file: this.saveForm.value.file
    };

    const incomes: any[] = [];

    for (const item of installments) {

      if (item.id === selected.id) {
        startProcessing = true;
      }

      if (!startProcessing) continue;
      if (item.paid) continue;
      if (remaining <= 0) break;

      // 🔥 calcular lo ya pagado
      const totalPaid = (item.incomes || []).reduce(
        (acc: number, inc: any) => acc + (Number(inc.amount) || 0),
        0
      );

      // 🔥 calcular pendiente real
      const pendingAmount = Math.max(
        (Number(item.amount) || 0) - totalPaid,
        0
      );

      if (pendingAmount <= 0) continue;

      if (remaining >= pendingAmount) {
        // ✅ pago completo
        incomes.push({
          installment_id: item.id,
          amount: pendingAmount,
          paid: true,
          ...commonData
        });

        remaining -= pendingAmount;

      } else {
        // ⚠️ pago parcial
        incomes.push({
          installment_id: item.id,
          amount: remaining,
          paid: false,
          ...commonData
        });

        remaining = 0;
      }
    }

    return incomes;
  }

  buildIncomesFromPayment2() {
    let payment = this.saveForm.value.amount;

    // limpiar formato $13,571.43
    payment = Number((payment + '').replace(/[$,]/g, ''));

    const selected = this.data.itemSelected;

    // ❌ validar monto inválido general
    if (!payment || payment <= 0) {
      this.saveForm.get('amount')?.setErrors({ invalidAmount: true });
      this._ToastrService.error(
        'El monto debe ser mayor, si requieres abonar un monto parcial, usa el botón "Abonar"',
        'Error'
      );
      this.loading = false;
      return null;
    }

    // 🔴 VALIDACIÓN IMPORTANTE (la que te faltaba)
    if (payment < selected.amount) {
      this.saveForm.get('amount')?.setErrors({ minAmount: true });
      this._ToastrService.error(
        `El monto debe ser igual o mayor a ${selected.amount}, si requieres abonar un monto parcial, usa el botón "Abonar`,
        'Error'
      );
      this.loading = false;
      return null;
    }

    const installments = this.data.data;

    let remaining = payment;
    let startProcessing = false;

    const commonData = {
      user_id: this.saveForm.value.user_id,
      payment_method_id: this.saveForm.value.payment_method_id,
      comments: this.saveForm.value.comments,
      date_income: this.saveForm.value.date_income,
      file: this.saveForm.value.file
    };

    const incomes: any[] = [];

    for (const item of installments) {

      if (item.id === selected.id) {
        startProcessing = true;
      }

      if (!startProcessing) continue;
      if (item.paid) continue;
      if (remaining <= 0) break;

      if (remaining >= item.amount) {
        // ✅ pago completo
        incomes.push({
          installment_id: item.id,
          amount: item.amount,
          paid: true,
          ...commonData
        });

        remaining -= item.amount;

      } else {
        // ⚠️ pago parcial (solo en siguientes, nunca en el seleccionado)
        incomes.push({
          installment_id: item.id,
          amount: remaining,
          paid: false,
          ...commonData
        });

        remaining = 0;
      }
    }

    return incomes;
  }
}
