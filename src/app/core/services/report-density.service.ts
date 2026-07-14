import { Injectable, signal } from '@angular/core';

export type ReportDensityMode = 'normal' | 'normal-compact';

@Injectable({
  providedIn: 'root',
})
export class ReportDensityService {
  private readonly STORAGE_KEY = 'report-density';
  readonly density = signal<ReportDensityMode>('normal');

  constructor() {
    this.load();
  }

  setDensity(density: ReportDensityMode) {
    this.density.set(density);
    localStorage.setItem(this.STORAGE_KEY, density);
  }

  private load() {
    const savedDensity = localStorage.getItem(this.STORAGE_KEY) as ReportDensityMode | null;
    if (savedDensity === 'normal' || savedDensity === 'normal-compact') {
      this.density.set(savedDensity);
    }
  }
}
