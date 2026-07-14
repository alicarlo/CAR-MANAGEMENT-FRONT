import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { CarsService } from 'src/app/core/services/cars/cars.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
  selector: 'app-floor-time-edit-price-modal',
  imports: [
    ButtonComponent,
    CommonModule,
    MatDialogModule,
    MatIconModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ReactiveFormsModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './floor-time-edit-price-modal.component.html',
  styleUrl: './floor-time-edit-price-modal.component.css',
})
export class FloorTimeEditPriceModalComponent {
  saveForm: FormGroup;
  loading = false;
  row: any;

  errorMessages = {
    sale_price: [
      { type: 'required', message: 'Precio de venta es requerido' },
      { type: 'min', message: 'El precio no puede ser menor a 0' },
    ],
  };

  constructor(
    private _FormBuilder: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<FloorTimeEditPriceModalComponent> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _CarsService: CarsService,
    private _ToastrService: ToastrService
  ) {
    this.row = data?.row ?? {};
    this.saveForm = this._FormBuilder.group({
      sale_price: new FormControl(this.row?.sale_price ?? null, [
        Validators.required,
        Validators.min(0),
      ]),
    });
  }

  get carLabel() {
    const parts = [
      this.row?.key,
      this.row?.make,
      this.row?.model,
      this.row?.version,
      this.row?.color,
    ]
      .map((value) => String(value ?? '').trim())
      .filter((value) => value && value !== '-');

    return parts.join(' - ') || '-';
  }

  close(flag = false) {
    this.dialogRef?.close(flag);
  }

  save() {
    if (this.saveForm.invalid) {
      this.saveForm.markAllAsTouched();
      return;
    }

    const carId = this.getCarId();
    if (!carId) {
      this._ToastrService.error('No se encontro el id del auto', 'Error');
      return;
    }

    this.loading = true;
    const payload = {
      sale_price: Number(this.saveForm.value.sale_price),
    };

    this._CarsService.patchCar(carId, payload).subscribe({
      next: (response) => {
        if (response) {
          this._ToastrService.success('Precio actualizado con exito', 'Exito');
          this.loading = false;
          this.close(true);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err?.error === 'Token expired') {
          return;
        }
        this._ToastrService.error(err?.error ?? 'No se pudo actualizar el precio', 'Error');
      },
    });
  }

  private getCarId() {
    return this.row?.id ?? this.row?.car_id ?? this.row?.car?.id ?? null;
  }
}
