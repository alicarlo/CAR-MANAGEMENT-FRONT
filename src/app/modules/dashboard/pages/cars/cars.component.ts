import { Component } from '@angular/core';
import { CARS, CarsHeader } from 'src/app/core/constants/cars';
import { Cars } from 'src/app/core/models/cars.model';
import { TableComponent } from 'src/app/modules/uikit/pages/table/table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'

@Component({
  selector: 'app-cars',
  imports: [TableComponent, MatDialogModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {
  cars: Cars[] = [];
  carsHeader: string[] = [];
  constructor(
    private _MatDialog: MatDialog
  ) {
    this.cars = CARS
    this.carsHeader = CarsHeader
  }
}
