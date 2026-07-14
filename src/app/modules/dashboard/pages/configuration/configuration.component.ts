import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ReportDensityMode, ReportDensityService } from 'src/app/core/services/report-density.service';
import { TableDensityMode, TableDensityService } from 'src/app/core/services/table-density.service';

@Component({
  selector: 'app-configuration',
  imports: [CommonModule, MatIconModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent {
  activeSection: 'table-density' | 'report-density' = 'table-density';
  reportDensityOptions: Array<{ id: ReportDensityMode; label: string }> = [
    { id: 'normal', label: 'Normal' },
    { id: 'normal-compact', label: 'Normal-compacto' },
  ];

  constructor(
    public tableDensityService: TableDensityService,
    public reportDensityService: ReportDensityService,
    private toastrService: ToastrService
  ) {}

  setActiveSection(section: 'table-density' | 'report-density') {
    this.activeSection = section;
  }

  applyTableDensity(density: TableDensityMode) {
    if (this.tableDensityService.density() === density) {
      return;
    }

    this.tableDensityService.setDensity(density);
    this.toastrService.success('Densidad de tablas actualizada', 'Exito');
  }

  applyReportDensity(density: ReportDensityMode) {
    if (this.reportDensityService.density() === density) {
      return;
    }

    this.reportDensityService.setDensity(density);
    this.toastrService.success('Densidad de reportes actualizada', 'Exito');
  }
}
