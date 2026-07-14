import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { SALESTYPE, STATUS, CARSALETYPE, FUELTANK, PAYMENTSSALE, PAYMENTDAYS, METHODPAYMENTSALE  } from 'src/app/core/constants/global';
import { Clients } from 'src/app/core/models/clients.model';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { LoadingComponent } from 'src/app/modules/uikit/pages/loading/loading.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import moment from 'moment-timezone';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SalesService } from 'src/app/core/services/sales/sales.service';
import { IncomeService } from 'src/app/core/services/income/income.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import { environment } from 'src/environments/environment';


interface AttachmentItem {
  id: string;
  name: string;
  description: string;
  file: File;
  previewUrl?: string;
}
@Component({
  selector: 'app-sales-modal',
  imports: [
    NgxMaskDirective, NgxMaskPipe,
    LoadingComponent,
    ButtonComponent, CommonModule, MatDialogModule,MatIconModule, MatTooltipModule,
    FormsModule, ReactiveFormsModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './sales-modal.component.html',
  styleUrl: './sales-modal.component.css'
})
export class SalesModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  salesType = [SALESTYPE.APARTADO, SALESTYPE.NORMAL];

  carSaleType = [CARSALETYPE.PRIVADO, CARSALETYPE.EMPRESARIAL];
  fuelTank = [FUELTANK.VACIO, FUELTANK.Q1_4, FUELTANK.Q1_2, FUELTANK.Q3_4, FUELTANK.LLENO];
  paymentsSale = [PAYMENTSSALE.CLIENTE, PAYMENTSSALE.AVAL1, PAYMENTSSALE.AVAL2];
  paymentDays = [PAYMENTDAYS.MES1, PAYMENTDAYS.MES15,PAYMENTDAYS.FIN_MES];
  paymentMethod = [METHODPAYMENTSALE.CHEQUE, METHODPAYMENTSALE.TRANSFERENCIA, METHODPAYMENTSALE.EFECTIVO, METHODPAYMENTSALE.TARJETA];

  error_messages={
    'sales_type':[
      {type: 'required', message: 'Tipo de venta  es requerido'},
    ],
    'client_id':[
      {type: 'required', message: 'Cliente es requerido'},
    ],
    'car_id':[
      {type: 'required', message: 'Auto es requerido'},
    ],
    'sale_price': [
      {type: 'required', message: 'Precio es requerido'},
    ],
    'sale_price_contado': [
      {type: 'required', message: 'Precio es requerido'},
    ],
    'car_sector':[
      {type: 'required', message: 'Tipo de auto es requerida'},
    ],
    'percentage_gasoline': [
      {type: 'required', message: 'Cantidad de gasolina es requerido'},
    ],
    'guarantee': [
      {type: 'required', message: 'Quien firmara es requerido'},
    ],
    'payment_method': [
      {type: 'required', message: 'Modalidad de pago es requerido'},
    ],
    'payment_days': [
      {type: 'required', message: 'Dias de pago es requerido'},
    ],
    'date_delivery': [
      {type: 'required', message: 'Fecha de entrega es requerido'},
    ],
    'hour_delivery': [
      {type: 'required', message: 'Hora de entrega es requerido'},
    ],
    'payment_method_id': [
      {type: 'required', message: 'Metodo de pago es requerido'},
    ],
    'desired_advance': [
      {type: 'required', message: 'Anticipo deseado es requerido'},
    ]
  }

  clients: Clients[] = []
  cars: any[] = [];
  carsSelected: any = null
  typePayments: any[] = [];
  clientsLoading: boolean = false;
  carsLoading: boolean = false;
  todayStr = moment().tz('America/Tijuana').format('YYYY-MM-DD');
  monthlyPayments: Array<{ month: string; year: number; amount?: number }> | any = [];

  attachments: AttachmentItem[] = [];
  maxSizeBytes = 25 * 1024 * 1024; // 25MB
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileIcon: string = 'insert_drive_file';
  fileExt: string = '';
  allowMultiple = true;
  maxFiles = 3;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  typeDocument: any[] = [];


  carFilterControl = new FormControl('');
  filteredCars: any[] = [];
  carsDropdownOpen = false;
  selectedCarLabel = '';

  get hasSelectedClient() {
    const clientId = this.saveForm?.get('client_id')?.value;
    return clientId !== null && clientId !== undefined && String(clientId).trim() !== '';
  }
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<SalesModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypePaymentsService: TypePaymentsService,
   private _ClientsService: ClientsService,
   private _CarsService: CarsService,
   private _AuthService: AuthService,
   private _SalesService: SalesService,
   private _IncomeService: IncomeService,
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
    // this.getClients();
    this.getTypePayments();
    this.getTypeDocument();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      sales_type: new FormControl ("",Validators.compose([Validators.required])),
      client_id: new FormControl ({ value: this.data.row === null ? null : this.data.row.client_id, disabled: true },Validators.compose([Validators.required])),
      car_id: new FormControl ({ value: this.data.row === null ? '' : this.data.row.car_id, disabled: true},Validators.compose([Validators.required])),
      sale_price: new FormControl(
        this.data.row === null
          ? ''
          : this.data.row.sale_price === null
            ? (this.data.row.purchases?.length
                ? this.data.row.purchases[0].total
                : '')
            : this.data.row.sale_price,
        Validators.required
      ),
      sale_price_contado: new FormControl (null,Validators.compose([Validators.required])),
      qty_months: new FormControl ({value: '', disabled: true}),
      desired_advance: new FormControl (null,Validators.compose([Validators.required])),
      liquidate: new FormControl (false),
      car_sector: new FormControl ('',Validators.compose([Validators.required])),
      percentage_gasoline: new FormControl ('',Validators.compose([Validators.required])),
      guarantee: new FormControl ('',Validators.compose([Validators.required])),
      guarantee_name: new FormControl ('',Validators.compose([Validators.required])),
      payment_method: new FormControl ('',Validators.compose([Validators.required])),
      init_day: new FormControl (''),
      payment_days: new FormControl ('',Validators.compose([Validators.required])),
      date_delivery: new FormControl ('',Validators.compose([Validators.required])),
      hour_delivery: new FormControl ('',Validators.compose([Validators.required])),
      payment_method_id: new FormControl ('',Validators.compose([Validators.required])),
      file: new FormControl(null, Validators.required),
      guarantee_flag: new FormControl (false),
      guarantee_time: new FormControl (0),
  	});

    this.saveForm.get('sales_type')?.valueChanges.subscribe((value: any) => {
      this.clients = [];
      this.cars = [];
      this.filteredCars = [];
      this.selectedCarLabel = '';
      this.carsSelected = null;
      this.carsDropdownOpen = false;
      this.saveForm.get('client_id')?.setValue(null);
      this.saveForm.get('car_id')?.setValue('');
      this.saveForm.get('car_id')?.disable();
      this.saveForm.get('client_id')?.enable();
      if (value === 'apartado') {
        this.getClientsApart();
      }

      if (value === 'normal') {
        this.getClients();
      }

    });

    this.saveForm.get('client_id')?.valueChanges.subscribe((value: any) => {
      this.cars = [];
      this.filteredCars = [];
      this.selectedCarLabel = '';
      this.carsSelected = null;
      this.carsDropdownOpen = false;
      this.saveForm.get('car_id')?.setValue('');
      this.saveForm.get('car_id')?.disable();

      if (value  === null || value === undefined || value === '') return;
      if (this.saveForm.get('sales_type')?.value === 'apartado') {
        this.getCarByUserId();
      }else{
        this.getCarFull();
      }
    });

    this.saveForm.get('car_id')?.valueChanges.subscribe((value: any) => {
      if (value  === '') return;
      this.carsSelected = this.cars.find((r: any) => r.id === value);
      if (this.carsSelected === undefined) return;  
      // this.saveForm.get('sale_price')?.setValue(this.carsSelected.sale_price === null ? this.carsSelected.purchases.length ?  this.carsSelected.purchases[0].total : this.carsSelected.sale_price);
      // this.saveForm.get('sale_price_contado')?.setValue(this.carsSelected.sale_price);
      this.saveForm.get('sale_price')?.setValue(
        this.carsSelected.sale_price === null
          ? (this.carsSelected.purchases?.length
              ? this.carsSelected.purchases[0].total
              : null)
          : this.carsSelected.sale_price
      );

      this.saveForm.get('sale_price_contado')?.setValue(
        this.carsSelected.sale_price === null
          ? (this.carsSelected.purchases?.length
              ? this.carsSelected.purchases[0].total
              : null)
          : this.carsSelected.sale_price
      );

      if (this.saveForm.get('sales_type')?.value === 'apartado') {
        if (this.saveForm.get('liquidate')?.value === false) {
          this.saveForm.get('sale_price')?.disable();
        }else{
          this.saveForm.get('sale_price')?.disable();
          this.saveForm.get('sale_price_contado')?.enable();
        }
        this.saveForm.get('desired_advance')?.setValue(this.carsSelected.amount_layaway);
        
      }else{
        this.saveForm.get('desired_advance')?.setValue(this.carsSelected.down_payment);
      }
    });

    this.saveForm.get('liquidate')?.valueChanges.subscribe((value: any) => {
      if (this.saveForm.get('sales_type')?.value === 'normal') {
 
      if (value) {
        this.saveForm.get('sale_price')?.enable(); 
        this.saveForm.get('payment_days')?.clearValidators();
        this.saveForm.get('payment_days')?.updateValueAndValidity();

        // this.saveForm.get('desired_advance')?.setValue(null);
        this.saveForm.get('desired_advance')?.disable();
        
      }else{
        this.saveForm.get('qty_months')?.setValue('');
        // this.saveForm.get('desired_advance')?.setValue(null);
        this.saveForm.get('desired_advance')?.enable();

        this.saveForm.get('payment_days')?.setValidators([Validators.required]);
        this.saveForm.get('payment_days')?.updateValueAndValidity();
        this.saveForm.get('payment_days')?.setErrors(null); 
      }
      // apartado 
      }else{
        if (value) {
          this.saveForm.get('qty_months')?.setValue('');
          this.saveForm.get('desired_advance')?.setValue(null);
          this.saveForm.get('desired_advance')?.disable();
        }else{
          this.saveForm.get('desired_advance')?.enable();
          this.saveForm.get('sale_price_contado')?.enable();  
        }
      }

      this.maxFiles = value ? 1 : 3
     
      if (value) { 
      this.saveForm.get('guarantee')?.setValue('cliente');
      this.saveForm.get('guarantee')?.disable();
      this.saveForm.get('payment_days')?.disable();
      }else{
      this.saveForm.get('guarantee')?.enable();
      this.saveForm.get('payment_days')?.enable();
      }
      this.removeAllFiles();
    });

    this.saveForm.get('qty_months')?.valueChanges.subscribe((value: any) => {
      if (value === 0) {
        this._ToastrService.error('La cantidad de meses debe ser mayor a 0');
        return
      }

      if (value > 71) {
        this._ToastrService.error('El maximo de meses no puede ser mayor a 70');
        return;
      }
      this.generateMonthlyPayments(value);
    });

    this.saveForm.get('guarantee')?.valueChanges.subscribe((value: any) => {
      if (value  === '') return;
      if (value === 'cliente') {
      this.saveForm.get('guarantee_name')?.setValue(this.clients.find((c: any) => c.id === this.saveForm.value.client_id)?.full_name);
      }
    });

    this.saveForm.get('payment_days')?.valueChanges.subscribe((value: any) => {
       if (value) { 
        this.saveForm.get('qty_months')?.enable();
       }else{
        this.saveForm.get('qty_months')?.disable();
       }
    });

    this.saveForm.get('init_day')?.valueChanges.subscribe((value: any) => {
      if (value) { 
        this.monthlyPayments = [];
        setTimeout(() => {
          this.generateMonthlyPayments(this.saveForm.value.qty_months);  
        },500)
       }
    });
  }

  toggleCarsDropdown() {
    if (this.carsLoading) {
      return;
    }
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
    this.selectedCarLabel = [car.make, car.model, car.version]
      .filter(Boolean)
      .join(' - ');
    this.saveForm.patchValue({ car_id: car.id });
    this.closeCarsDropdown();
  }

  openPicker(input: HTMLInputElement) {
    (input as any).showPicker?.();
    if (!('showPicker' in (HTMLInputElement.prototype as any))) {
      input.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-cars-dropdown="true"]')) {
      this.closeCarsDropdown();
    }
  }

  private resolveInstallmentStartDate() {
    const initDay = String(this.saveForm?.value?.init_day ?? '').trim();
    const now = new Date();

    if (initDay) {
      const [yearRaw, monthRaw] = initDay.split('-');
      const year = Number(yearRaw);
      const month = Number(monthRaw);

      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        return {
          startYear: year,
          startMonthIndex: month - 1,
        };
      }
    }

    return {
      startYear: now.getFullYear(),
      startMonthIndex: now.getMonth(),
    };
  }

  clear() {
    this.monthlyPayments = this.monthlyPayments.map((p: any) => ({
      ...p,
      amount: null
    }));
  }

  async getTypeDocument() {
    this.typeDocument = ['4','2','3']
  }

  onClickGeneratePayments() {
    this.generatePayments();
  }

  generateMonthlyPayments(qty: number) {
    const result: any[] = [];
    const { startMonthIndex, startYear } = this.resolveInstallmentStartDate();

    for (let i = 0; i < qty; i++) {
      const date = new Date(startYear, startMonthIndex + i, 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      const month = date.getMonth() + 1; 
      const year = date.getFullYear();

      result.push({
        monthName,
        month,
        // monthNumber,
        year,
        amount: null,
        paid: false,
        paid_at: ""
      });
    }
    this.monthlyPayments = result;
  }

  

  syncManualAmounts() {
    this.monthlyPayments = this.monthlyPayments.map((p: any, i: number) => {
      let parsedAmount: any = this.parseMoneyValue(p.amount);
      parsedAmount = !isNaN(parsedAmount) ? parsedAmount : null;
      return {
        ...p,
        amount: parsedAmount
      };
    });
  }

  parseMoneyValue(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    const normalized = String(value).replace(/,/g, '').trim();
    const parsed = parseFloat(normalized);

    return isNaN(parsed) ? 0 : parsed;
  }

  private hasEmptyValue(value: any): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }

  generatePayments() {
    let totalAmount;
    let amountPaid;
    const rawAdvanceValue = this.saveForm.get('desired_advance')?.value;

    if (this.hasEmptyValue(rawAdvanceValue)) {
      this._ToastrService.error('Verifica los valores de venta, anticipo y meses');
      return;
    }

    if (this.saveForm.value.sales_type === 'apartado') {
      if (this.saveForm.get('desired_advance')?.value >= this.carsSelected.total) {
        totalAmount = this.carsSelected.amount_sale;
        amountPaid = this.parseMoneyValue(rawAdvanceValue);
      }else{
         this._ToastrService.error('Anticipo deseado debe de ser igual o mas que el enganche');
        return;
      }
    }else{
      totalAmount = this.parseMoneyValue(this.saveForm.get('sale_price')?.value);
      amountPaid = this.parseMoneyValue(rawAdvanceValue);
      let amountCheck =  totalAmount - amountPaid;
      if (amountCheck <= 0) {
        this._ToastrService.error('El Anticipio deseado debe ser menor al precio de venta, si va a liquidar seleccione la opcion liquidar');
        return;
      }
    }
    const qty = parseInt(this.saveForm.get('qty_months')?.value || 0);
    if (!totalAmount || !qty || qty <= 0) {
      this._ToastrService.error('Verifica los valores de venta, anticipo y meses');
      return;
    }

    const amountToDistribute = totalAmount - amountPaid;
    const { startMonthIndex, startYear } = this.resolveInstallmentStartDate();

    const newMonthlyPayments: any = Array.from({ length: qty }).map((_, i) => {
       const date = new Date(startYear, startMonthIndex + i, 1); 

      return {
        monthName: date.toLocaleString('default', { month: 'long' }),
        year: date.getFullYear(),
        amount: null,
        month: date.getMonth() + 1
      };
    });

    let manualSum = 0;
    const manualIndexes = new Set<number>();

    for (let i = 0; i < qty; i++) {
      const parsed = this.parseMoneyValue(this.monthlyPayments?.[i]?.amount ?? null);

      if (!isNaN(parsed) && parsed > 0) {
        newMonthlyPayments[i].amount = parsed;
        manualSum += parsed;
        manualIndexes.add(i);
      }
    }

    const remaining = amountToDistribute - manualSum;

    if (remaining < 0) {
      this._ToastrService.error('Los pagos manuales exceden el total disponible', 'Error');
      return;
    }

    const remainingIndexes = Array.from({ length: qty }, (_, i) => i).filter((i) => !manualIndexes.has(i));
    const remainingSlots = remainingIndexes.length;

    if (remainingSlots === 1) {
      const targetIndex = remainingIndexes[0];
      newMonthlyPayments[targetIndex].amount = parseFloat(remaining.toFixed(2));
    } else if (remainingSlots > 1) {
      const firstIndex = remainingIndexes[0];
      const roundedAmount = Math.floor(remaining / remainingSlots);
      let assignedToOthers = 0;

      for (let i = 1; i < remainingIndexes.length; i++) {
        const targetIndex = remainingIndexes[i];
        newMonthlyPayments[targetIndex].amount = roundedAmount;
        assignedToOthers += roundedAmount;
      }

      newMonthlyPayments[firstIndex].amount = parseFloat((remaining - assignedToOthers).toFixed(2));
    }

    this.monthlyPayments = newMonthlyPayments;
    const totalFinal = this.monthlyPayments.reduce((acc: any, p: { amount: any; }) => acc + (p.amount || 0), 0);
  }
  getClientsApart() {
    this.clientsLoading = true;
    this.clients = [];
    this._ClientsService.getClientApart(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.clients = response.items.map((r: any) => ({ ...r }));
        }
        this.clientsLoading = false;
      },
      error: (err) => {
        this.clientsLoading = false;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

   getClients() {
    this.clientsLoading = true;
    this.clients = [];
    this._ClientsService.getClient(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.clients = response.items.map((r: any) => ({ ...r }));
        }
        this.clientsLoading = false;
      },
      error: (err) => {
        this.clientsLoading = false;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getCarByUserId() {
    this.carsLoading = true;
    this.cars = [];
    this.filteredCars = [];
    this.selectedCarLabel = '';
    this.carsDropdownOpen = false;
    this._CarsService.getCarByUserId(200, 1, this.saveForm.get('client_id')?.value).subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items
            .map((r: any) => ({
              ...r.car,
              amount_down_payment: r.amount_down_payment,
              amount_layaway: r.amount_layaway,
              amount_sale: r.amount_sale,
              total: (r.incomes || []).reduce(
                (acc: number, inc: any) => acc + (Number(inc.amount) || 0),
                0
              ),
            }))
            .filter((car: any) => car.status !== 'venta_realizada');
          this.filteredCars = [...this.cars];
          this.saveForm.get('car_id')?.enable();

        }
        this.carsLoading = false;
      },
      error: (err) => {
        this.carsLoading = false;
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  getCarFull() {
    this.carsLoading = true;
    this.cars = [];
    this.filteredCars = [];
    this.selectedCarLabel = '';
    this.carsDropdownOpen = false;
    this._CarsService.getCars('',500, 1, 'venta').subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items;
          this.filteredCars = [...this.cars];
          this.saveForm.get('car_id')?.enable();
        }
        this.carsLoading = false;
      },
      error: (err) => {
        this.carsLoading = false;
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
        // this.loading = true;
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

    if (this.attachments.length == 0) {
      this._ToastrService.error(
        'Achivo(s) es obligatorio',
        'Error'
      );
      return;
    }

    if (this.maxFiles === 3) {
      if (this.attachments.length < 3) {
        this._ToastrService.error(
          'Achivo(s) es obligatorio',
          'Error'
        );
        return;
      } 
    }

    let filterDescription = this.attachments.some((d: any) => d.description === '' || d.description === null || d.description === undefined);

    if (filterDescription) {
      this._ToastrService.error(
        'La descripción en los archivo(s) es obligatorio',
        'Error'
      );
      return;
    }
    

    if(this.saveForm.value.guarantee_flag === true) {
      if(this.saveForm.value.guarantee_time === 0 || this.saveForm.value.guarantee_time === null || this.saveForm.value.guarantee_time === undefined) {
        this._ToastrService.error(
        'Los dias de garantia es obligatorio',
        'Error'
      );
        return;
      }
    }
    

    this.saveForm.value.guarantee_time = 0;
    this.loading = true;
    const date = this.saveForm.value.date_delivery; 
    const time = this.saveForm.value.hour_delivery; 

    const dateTime = moment(
      `${date} ${time}`,
      'YYYY-MM-DD HH:mm'
    ).format('YYYY-MM-DD HH:mm:ss.SSS');
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched(); 
      return;
    }

    const onlyHour = moment(time, 'HH:mm').format('HH:mm');

    if (this.saveForm.value.liquidate === false ) {
      for (const p of this.monthlyPayments) {
        if (p.amount === 0 || p.amount == null || p.amount === '') {
          this._ToastrService.error(
            'Debe de ingresar los pagos mensuales',
            'Error'
          );
          break; 
        }
      }
    }

    const day =
      this.saveForm.value.payment_days === PAYMENTDAYS.MES1
        ? 1
        : this.saveForm.value.payment_days === PAYMENTDAYS.MES15
          ? 15
          : 28;

    let monthlyPaymentsAux = this.monthlyPayments.map((p: any) => {
      const dayData =
        this.saveForm.value.payment_days === PAYMENTDAYS.MES1
          ? 1
          : this.saveForm.value.payment_days === PAYMENTDAYS.MES15
            ? 15
            : moment(`${p.year}-${p.month}`, 'YYYY-M').daysInMonth();

      const month = p.month;
      const year = p.year;

      const paidAt = moment(
        `${year}-${month}-${dayData} ${time}`,
        'YYYY-M-D HH:mm'
      ).format('YYYY-MM-DD HH:mm:ss.SSS');

      const { monthName, ...rest } = p;

      return {
        ...rest,
        paid_at: paidAt,
        day: dayData
      };
    });

    let saleData = {
      car_id: this.saveForm.value.car_id,
      user_id: this._AuthService.user()?.user_id,
      client_id: this.saveForm.value.client_id,
      date_delivery: dateTime,
      hour_delivery:  moment(time, 'HH:mm').hour(),
      installments: this.monthlyPayments.length,
      installments_data: monthlyPaymentsAux,
      contract: {
          car_sector: this.saveForm.value.car_sector,
          percentage_gasoline: this.saveForm.value.percentage_gasoline,
          guarantee: [
            {
              name: this.saveForm.value.guarantee_name
            }
          ],
          payment_method: this.saveForm.value.payment_method,
          payment_day: day
      },
      sales_type: this.saveForm.value.liquidate === true ? 'contado' : 'credito',
      amount_sale: 
        this.saveForm.value.sales_type === 'apartado' ? this.carsSelected.amount_sale 
        : this.saveForm.value.liquidate == false ? this.saveForm.get('sale_price')?.value 
        : this.saveForm.get('sale_price_contado')?.value,
      cash_prices: this.saveForm.get('sale_price_contado')?.value,
      guarantee: this.saveForm.get('guarantee_flag')?.value,
      guarantee_time: this.saveForm.get('guarantee_time')?.value
    }

    this._SalesService.registerSale(saleData).subscribe({
      next: async (response) => {
        if(response) {
          let amount = this.saveForm.get('sale_price')?.value;
          if (this.saveForm.value.sales_type === 'apartado') {
            if (this.saveForm.get('liquidate')?.value === true) {
              amount = this.carsSelected.amount_sale - this.carsSelected.total
            } else {
              amount =   this.saveForm.get('desired_advance')?.value - this.carsSelected.total
              if (amount === 0) {
                this.attachments[0].description = `Cliente: ${this.attachments[0].description}`
                 if (this.maxFiles > 1) {
                   this.attachments[1].description = `Aval 1: ${this.attachments[1].description}`
                    this.attachments[2].description = `Aval 2: ${this.attachments[2].description}`
                 }
                for (const item of this.attachments) {
                  await this.uploadSaleDouments(item);  
                }
                
                this._ToastrService.success('Registro exitoso', 'Exito');
                this.loading = false;
                this.close(true);
                return;
              }
            }
          }else{
            if (this.saveForm.get('liquidate')?.value === true) {
              amount = this.saveForm.get('sale_price_contado')?.value
            }else{
              amount = this.saveForm.get('desired_advance')?.value
            }
          }

          let dataIncome: any = {
            user_id: this._AuthService.user()?.user_id,
            sale_id: response.id,
            payment_method_id: parseInt(this.saveForm.value.payment_method_id),
            date_income: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            amount: amount
          }
          
          if(this.saveForm.value.liquidate === true) {
            dataIncome['income_type'] = 'venta_contado';
          }else{
            dataIncome['income_type'] = 'enganche_venta';
          }

          this._IncomeService.registerIncome(dataIncome).subscribe({
            next: async (response) => {
              if(response) {
                this.attachments[0].description = `Cliente: ${this.attachments[0].description}`
                 if (this.maxFiles > 1) {
                   this.attachments[1].description = `Aval 1: ${this.attachments[1].description}`
                    this.attachments[2].description = `Aval 2: ${this.attachments[2].description}`
                 }
                for (const item of this.attachments) {
                  await this.uploadSaleDouments(item);  
                }
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
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  async uploadSaleDouments(dataFile: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        let carArray = [this.saveForm.value.car_id]
        formData.append('car_id', this.saveForm.value.car_id);
        formData.append('document_type_id', dataFile.id);
        formData.append('descriptions', dataFile.description);
        formData.append('file', dataFile.file);

        const token = this._AuthService.tokenValue;
        const response = await fetch(`${environment.apiUrl}/document/`, {
          method: this.data.row == null ? 'POST' : 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          this.loading = false;
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        resolve(true);
      } catch (err: any) {
        this._ToastrService.error(err.message, 'Error');
      }
    })
  }

  get attachmentCtrl() {
    return this.saveForm.get('file');
  }
    
  get attachmentsFA(): FormArray {
    return this.saveForm.get('attachments') as FormArray;
  }

  private createAttachmentGroup(item: AttachmentItem): FormGroup {
    return this._FormBuilder.group({
      id: [item.id],
      name: [item.name, Validators.required],
      description: [''],
      file: [item.file],
    });
  }

  isImageFile(file: File) {
    return !!file.type?.startsWith('image/');
  }

  isVideoFile(file: File) {
    return !!file.type?.startsWith('video/');
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (!files.length) return;

    for (const file of files) {
      if (this.allowMultiple && this.attachments.length >= this.maxFiles) break;

      if (!this.isAllowedType(file)) {
        this.attachmentCtrl?.setErrors({ invalidType: true });
        continue;
      }

      if (file.size > this.maxSizeBytes) {
        this.attachmentCtrl?.setErrors({ maxSize: true });
        continue;
      }

      let name: any = '';
      let idTypeDocument = null;
      if (this.saveForm.value.liquidate === true) {
        name = this.clients.find((c: any) => c.id === this.saveForm.value.client_id)?.full_name;
        idTypeDocument = this.typeDocument[0]
      }else{
        name = this.clients.find((c: any) => c.id === this.saveForm.value.client_id)?.full_name;
        idTypeDocument = this.typeDocument[0]
        if (this.attachments.length === 1) {
          idTypeDocument = this.typeDocument[1]
        } else if (this.attachments.length === 2) {
          idTypeDocument = this.typeDocument[2]
        }
      }
      const attachment: AttachmentItem = {
        id: idTypeDocument,
        name: name,          
        description:
        this.attachments.length === 0
          ? name
          : this.attachments.length === 1
            ? ''
            : '',
        file,
        previewUrl:
          this.isImageFile(file) || this.isVideoFile(file)
            ? URL.createObjectURL(file)
            : undefined,
      };

      this.attachments.push(attachment);
    }

    this.updateFormFiles();
    input.value = '';
  }

  updateFormFiles() {
    const cleanValue = this.attachments.map(({ previewUrl, ...rest }) => rest);
    this.attachmentCtrl?.setValue(cleanValue);
    this.attachmentCtrl?.markAsDirty();
    this.attachmentCtrl?.markAsTouched();
  }

  removeAttachment(index: number) {
    const item = this.attachments[index];
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);

    this.attachments.splice(index, 1);
    this.updateFormFiles();

    if (!this.attachments.length) {
      this.attachmentCtrl?.setValue(null);
    }

    const input = document.getElementById('attachmentInput') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  removeAllFiles() {
    for (const item of this.attachments) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }

    this.attachments = [];
    this.attachmentCtrl?.setValue(null);
    this.attachmentCtrl?.setErrors(null);

    const input = document.getElementById('attachmentInput') as HTMLInputElement | null;
    if (input) input.value = '';
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

  resolveIcon(file: File): string {
    const t = (file.type || '').toLowerCase();
    const ext = this.getExt(file.name);

    if (t.startsWith('image/') || ['.jpg','.jpeg','.png','.gif','.webp','.svg'].includes(ext)) return 'image';
    if (t.startsWith('video/') || ['.mp4','.mov','.webm','.mkv'].includes(ext)) return 'movie';
    if (t === 'application/pdf' || ext === '.pdf') return 'picture_as_pdf';
    if (
      t === 'application/msword' ||
      t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.doc' || ext === '.docx'
    ) return 'description';
    return 'insert_drive_file';
  }

  getExt(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i).toLowerCase() : '';
  }
}
