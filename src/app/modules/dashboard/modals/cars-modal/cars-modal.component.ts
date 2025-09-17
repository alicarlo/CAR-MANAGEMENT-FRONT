import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CHECKS_FIELDS, CHECKS_INIT } from 'src/app/core/constants/cars';
import { AcquisitionDto, AcquisitionType, Checks } from 'src/app/core/models/cars.model';
import { Clients } from 'src/app/core/models/clients.model';
import { CreateClientError } from 'src/app/core/models/error';
import { Investor } from 'src/app/core/models/investor.model';
import { Store } from 'src/app/core/models/store.model';
import { TypeCars } from 'src/app/core/models/typeCars.model';
import { Users } from 'src/app/core/models/users.model';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ClientsService } from 'src/app/core/services/clients/clients.service';
import { InvestorService } from 'src/app/core/services/investors/investor.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

type CheckKey = keyof Checks;
@Component({
  selector: 'app-cars-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule,MatDatepickerModule, MatNativeDateModule],
  templateUrl: './cars-modal.component.html',
  styleUrl: './cars-modal.component.css'
})
export class CarsModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  open: boolean = false;
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
		'car_acquisition':[
			{type: 'required', message: 'Adquisicion es requerido'},
		],
    'car_type_id': [
      {type: 'required', message: 'Tipo es requerido'},
    ]
	}

  carAcquisition: Array<string> = [ 'compras' ,'consigna'];
  todayStr = new Date().toISOString().slice(0, 10); 

  typeCars: TypeCars[] = [];
  store: Store[] = [];
  clients: Clients[] = [];
  user: Users[] = [];
  investor: Investor[] = [];
  checks = CHECKS_FIELDS;
  
   constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<CarsModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _CarsService: CarsService,
    private _TypeCarsService: TypeCarsService,
    private _StoreService: StoreService,
    private _ClientsService: ClientsService,
    private _UsersService: UsersService,
    private _InvestorService: InvestorService
  ) {}
  
  ngOnInit(): void {
    this.init();
    this.getTypeCar();
    this.getStore();
    this.getClients();
    this.getUsers();
    this.getInvestor();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      make: new FormControl (this.data.row === null ? '' : this.data.row.make,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      model: new FormControl (this.data.row === null ? '' : this.data.row.model,Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(60)])),
      version: new FormControl(this.data.row === null ? '' : this.data.row.version),
      color: new FormControl(this.data.row === null ? '' : this.data.row.color),
      vin: new FormControl(this.data.row === null ? '' : this.data.row.vin),
      km: new FormControl(this.data.row === null ? '' : this.data.row.km),
      cylinders: new FormControl(this.data.row === null ? '' : this.data.row.cylinders),
      engine_number: new FormControl(this.data.row === null ? '' : this.data.row.engine_number),
      sale_price: new FormControl(this.data.row === null ? null : this.data.row.sale_price),
      car_acquisition: new FormControl(this.data.row === null ? '' : this.data.row.car_acquisition, Validators.compose([Validators.required])),
      arrived_at: new FormControl (this.data.row === null ? '' : this.dateFormat(this.data.row.arrived_at),Validators.compose([Validators.required])),
      car_type_id: new FormControl(this.data.row === null ? null : this.data.row.car_type_id,Validators.compose([Validators.required])),
      store_id: new FormControl(this.data.row === null ? '' : this.data.row.store_id),
      user_id: new FormControl(this.data.row === null ? '' : this.data.row.user_id),
      client_id: new FormControl(this.data.row === null ? '' : this.data.row.client_id),
      status: new FormControl(this.data.row === null ? '' : this.data.row.status),
      investor_id: new FormControl<string[]>(this.data.row === null ? [] : this.data.row.investor_id),
      checks: new FormControl<Checks>(
        this.data?.row?.checks ? { ...CHECKS_INIT, ...this.data.row.checks } : CHECKS_INIT,
        { nonNullable: true }
      ),
    });
  }

  save() {
    console.log(this.saveForm.value)
 
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


    this.saveForm.patchValue({ arrived_at: moment(this.saveForm.value.arrived_at).format('YYYY-MM-DD HH:mm:ss.SSS') })
    filledValues = this.data.row === null ? filledValues : {...filledValues, id: this.data.row.id};

    const methodMap = {
      registerCars: this._CarsService.registerCars.bind(this._CarsService),
      updateCars:   this._CarsService.updateCars.bind(this._CarsService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.row === null ? 'registerCars' : 'updateCars';
    
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

  getTypeCar() {
    this.loading = false;
    this._TypeCarsService.getTypeCar(200, 1).subscribe({
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

  getStore() {
    this.loading = false;
    this._StoreService.getStore(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.store = response.items.map((r: any) => ({ ...r }));
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

  getUsers() {
    this.loading = false;
    this._UsersService.getUsers(200, 1).subscribe({
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

  getInvestor() {
    this.loading = false;
    this._InvestorService.getInvestor(200, 1).subscribe({
      next: async (response: any) => {
        if(response) {
          this.investor = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this.loading = true;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  get checksCtrl() {
    return this.saveForm.get('checks') as FormControl<Checks>;
  }

  getCheck(key: CheckKey): boolean {
    return !!this.checksCtrl.value[key];
  }

  setCheck(key: CheckKey, checked: boolean): void {
    const curr = this.checksCtrl.value;     
    const next: Checks = { ...curr, [key]: checked };
    this.checksCtrl.setValue(next);
  }

  trackById = (_: string, s: Investor) => s.id;
  
  isChecked(id: string) {
    const ids = (this.saveForm.value.investor_id ?? []).map(String);
    return ids.includes(id);
  }

  toggleScope(id: string) {
    console.log(id)
    const curr = (this.saveForm.value.investor_id ?? []).map(String);
    const nid = id
    const next = curr.includes(nid) ? curr.filter((x: any) => x !== nid) : [...curr, nid];
    console.log(next)
    this.saveForm.patchValue({ investor_id: next }, { emitEvent: true });
    console.log(this.saveForm.value)
  }

  selectedLabel() {
    const ids = (this.saveForm.value.investor_id ?? []).map(String);
    if (!ids.length) return 'Selecciona…';
    return this.investor.filter(s => ids.includes(s.id)).map(s => s.full_name).join(', ');
  }
  
}
