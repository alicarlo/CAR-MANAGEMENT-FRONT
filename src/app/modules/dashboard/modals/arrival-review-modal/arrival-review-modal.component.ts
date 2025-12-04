import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { STATUS } from 'src/app/core/constants/global';
import { CreateClientError } from 'src/app/core/models/error';
import { TypeCars } from 'src/app/core/models/typeCars.model';
import { ArrivalreviewService } from 'src/app/core/services/arrivalReview/arrivalreview.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { TypeCarsService } from 'src/app/core/services/typeCars/type-cars.service';
import { TypeExpenseService } from 'src/app/core/services/typeExpense/type-expense.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-arrival-review-modal',
  imports: [ButtonComponent, CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './arrival-review-modal.component.html',
  styleUrl: './arrival-review-modal.component.css'
})
export class ArrivalReviewModalComponent {
  saveForm : FormGroup | undefined | any;
  loading: boolean = false;
  error_messages={
    'car_id':[
			{type: 'required', message: 'Auto es requerido'},
		],
		'abbreviation':[
			{type: 'required', message: 'Abreviación es requerido'},
      {type: 'minlength', message: 'Minimo 3 caracteres'},
		]
	}

  status = [STATUS.ACTIVE, STATUS.INACTIVE]; 
  purchase: any[] = [];
  cars: any[] = [];
  constructor(
    private _FormBuilder: FormBuilder,                                               
    private dialog: MatDialog,                                 
    @Optional() public dialogRef: MatDialogRef<ArrivalReviewModalComponent> | null, 
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _ToastrService: ToastrService,
    private _TypeCarsService: TypeCarsService,
    private _ArrivalreviewService: ArrivalreviewService,
    private _AuthService: AuthService,
    private _TypeExpenseService: TypeExpenseService,
    private _CarsService: CarsService
  ) 
  { }
  


  ngOnInit(): void {
    this.init();
    this.getCars();
  }

  init() {
    this.saveForm = this._FormBuilder.group({
      car_id: new FormControl (this.data.row === null ? '' : this.data.row.id,Validators.compose([Validators.required])),
      user_review: new FormControl (this._AuthService.user()?.user_id),
      review: new FormGroup({
        servicio: new FormControl(
          {
            value: this.data.row?.review?.servicio ?? false,
            disabled: false//this.data.row === null
          }
        ),
        proximo_servicio: new FormControl(
          {
            value: this.data.row?.review?.proximo_servicio ?? null,
            disabled: false// this.data.row !== null
          }
        ),
        servicio_agua: new FormControl(
          {
            value: this.data.row?.review?.servicio_agua ?? false,
            disabled: false // disabled: this.data.row !== null
          }
        ),
        proximo_servicio_agua: new FormControl(
          {
            value: this.data.row?.review?.proximo_servicio_agua ?? null,
            disabled: false// disabled: this.data.row !== null
          }
        ),
        servicio_aceite: new FormControl(
          {
            value: this.data.row?.review?.servicio_aceite ?? false,
            disabled: false// disabled: this.data.row !== null
          }
        ),
        proximo_servicio_aceite: new FormControl(
          {
            value: this.data.row?.review?.proximo_servicio_aceite ?? null,
            disabled: false// disabled: this.data.row !== null
          }
        ),
        garantia: new FormControl(
          {
            value: this.data.row?.review?.garantia ?? false,
            disabled: false// disabled: this.data.row !== null
          }
        ),
        expira_garantia: new FormControl(
          {
            value: this.data.row?.review?.expira_garantia ?? null,
            disabled: false// disabled: this.data.row === null
          }
        ),
      }),
      status: new FormControl (this.data.row === null ? '' : this.data.row.status),
  	});
  }


  getPurchase() {
    this.loading = false;
    this._TypeExpenseService.getPurchase(500, 1).subscribe({
      next: async (response: any) => {
        if(response) {;
          this.purchase = response.items.map((r: any) => ({ ...r, 
            make: r.car.make, 
            car_type: r.car.car_type.name, 
            line: r.car.version, 
            model: r.car.model, 
            color: r.car.color, 
            arrived_at: r.car.arrived_at,  }));
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
    this._CarsService.getCars('',500, 1, 'pendiente_revision').subscribe({
      next: async (response: any) => {
        if(response) {
          this.cars = response.items.map((r: any) => ({ ...r }));
        }
      },
      error: (err) => {
        if (err.error === "Token expired") return;
        this._ToastrService.error(err.error, 'Error');
      },
    })
  }

  save() {
    let filledValues = Object.keys(this.saveForm.value).reduce((acc, key) => {
    const val = this.saveForm.value[key as keyof typeof this.saveForm.value];

    if (key === 'review' && val && typeof val === 'object') {
      const review = val as any;

      const cleanedReview = Object.keys(review).reduce((acc2, key2) => {
        const val2 = review[key2];

        if (val2 !== null && val2 !== '' && val2 !== undefined) {
          acc2[key2] = val2;
        }

        return acc2;
      }, {} as any);

      if (Object.keys(cleanedReview).length > 0) {
        (acc as any)[key] = cleanedReview;
      }

      return acc;
    }

    if (val !== null && val !== '' && val !== undefined) {
      (acc as any)[key] = val;
    }

    return acc;
  }, {} as typeof this.saveForm.value);

    const methodMap = {
      registerArrival: this._ArrivalreviewService.registerArrival.bind(this._ArrivalreviewService),
      updateArrival:   this._ArrivalreviewService.updateArrival.bind(this._ArrivalreviewService),
    } as const;
    
    type MethodKey = keyof typeof methodMap; 

    const methodSelect: MethodKey =
      this.data.action === 'add' ? 'registerArrival' : 'updateArrival';
    
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

  dateFormat(date: string) { 
    return moment.utc(date).format('YYYY-MM-DD');
  }

   close(flag: boolean = false) {
    this.dialogRef?.close(flag);
  }

}
