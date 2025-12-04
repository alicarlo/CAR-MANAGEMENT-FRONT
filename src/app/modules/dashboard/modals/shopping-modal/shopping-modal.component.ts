import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { STATUS } from 'src/app/core/constants/global';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { TypePaymentsService } from 'src/app/core/services/typePayments/type-payments.service';
import moment from 'moment';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { ShopingService } from 'src/app/core/services/shoping/shoping.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-shopping-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './shopping-modal.component.html',
  styleUrl: './shopping-modal.component.css'
})
export class ShoppingModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  error_messages={
		'make':[
      {type: 'required', message: 'Marca es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
		'model':[
			{type: 'required', message: 'Modelo es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		],
		'arrived_at':[
			{type: 'required', message: 'Fecha es requerida'},
		],
    'car_type_id': [
      {type: 'required', message: 'Tipo es requerido'},
    ]
	}
  typeCars: any[] = [];
  typePayments: any[] = [];
  investor: any[] = [];
  investorSelect: any = null;
  carAcquisition: Array<string> = [ 'compras' ,'consigna'];
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<ShoppingModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypeCarsService: TypeCarsService,
    private _TypePaymentsService: TypePaymentsService,
    private _InvestorService: InvestorService,
    private _ShopingService: ShopingService,
    private _AuthService: AuthService
  ) 
  { }

  ngOnInit(): void {
    this.init();
    this.getTypeCar();
    this.getTypePayments();
    this.getInvestor();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      // name: new FormControl (this.data.row === null ? '' : this.data.row.name,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      // descriptions: new FormControl(this.data.row === null ? '' : this.data.row.descriptions),
      // status: new FormControl (this.data.row === null ? '' : this.data.row.status),
      car: new FormGroup({
        make: new FormControl (this.data.row === null ? '' : this.data.row.car.make,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
        model: new FormControl (this.data.row === null ? '' : this.data.row.car.model,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
        version: new FormControl(this.data.row === null ? '' : this.data.row.car.version),
        color: new FormControl(this.data.row === null ? '' : this.data.row.car.color),
        car_acquisition: new FormControl(this.data.row === null ? 'compras' : this.data.row.car.car_acquisition, Validators.compose([Validators.required])),
        car_type_id: new FormControl(this.data.row === null ? null : this.data.row.car.car_type_id,Validators.compose([Validators.required])),
        arrived_at: new FormControl (this.data.row === null ? '' : this.dateFormat(this.data.row.car.arrived_at),Validators.compose([Validators.required])),
        user_id: new FormControl(this._AuthService.user()?.user_id),
      }),
      investor_id: new FormControl (this.data.row === null ? '' : this.data.row.investor_id,Validators.compose([Validators.required])),
      commission: new FormControl (this.data.row === null ? '' : this.data.row.commission),
      salesperson_name: new FormControl (this.data.row === null ? '' : this.data.row.salesperson_name),
      sales_place_name: new FormControl (this.data.row === null ? '' : this.data.row.sales_place_name),
      require_invoice: new FormControl (this.data.row === null ? false : this.data.row.require_invoice),
      amount_by_invoice: new FormControl (this.data.row === null ? 0 : this.data.row.amount_by_invoice),
  	});
  }

  dateFormat(date: string) { 
    return moment.utc(date).format('YYYY-MM-DD');
  }
  

  getTypeCar() {
    this.loading = false;
    this._TypeCarsService.getTypeCar(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.typeCars = response.items.map((r: any) => ({ ...r }));

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

  getInvestor() {
    this._InvestorService.getInvestor(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  onInvestorChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.investorSelect = this.investor.find(x => String(x.id) === String(id)) ?? null;
    this.saveForm.patchValue({ commission: parseFloat(this.investorSelect.commission) });
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
      registerShopping: this._ShopingService.registerShopping.bind(this._ShopingService),
      updateShopping:   this._ShopingService.updateShopping.bind(this._ShopingService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerShopping' : 'updateShopping';
    
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
