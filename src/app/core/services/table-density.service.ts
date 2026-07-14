import { Injectable, computed, signal } from '@angular/core';

export type TableDensityMode = 'normal' | 'normal-compact' | 'compact' | 'super-compact';

type DensityOption = {
  id: TableDensityMode;
  label: string;
};

type DensityClasses = {
  wrapper: string;
  scroll: string;
  table: string;
  thead: string;
  checkboxHead: string;
  th: string;
  td: string;
  row: string;
  actionCell: string;
  rowActions: string;
  actionButton: string;
  footer: string;
  footerPrimary: string;
  footerSecondary: string;
  footerPagination: string;
  footerIconButton: string;
  footerPageButton: string;
  footerSelect: string;
};

type DensityVariables = Record<string, string>;

@Injectable({
  providedIn: 'root',
})
export class TableDensityService {
  private readonly STORAGE_KEY = 'table-density';
  private readonly defaultDensity: TableDensityMode = 'normal-compact';

  readonly options: DensityOption[] = [
    { id: 'normal', label: 'Normal' },
    { id: 'normal-compact', label: 'Normal-compacto' },
    { id: 'compact', label: 'Compacto' },
    { id: 'super-compact', label: 'Super compacto' },
  ];

  readonly density = signal<TableDensityMode>(this.defaultDensity);

  readonly variables = computed<DensityVariables>(() => {
    switch (this.density()) {
      case 'normal':
        return {
          '--td-wrapper-padding': '0.5rem',
          '--td-scroll-px': '1.25rem',
          '--td-checkbox-width': '50px',
          '--td-th-font-size': '13px',
          '--td-th-px': '16px',
          '--td-th-py': '10px',
          '--td-td-font-size': '0.875rem',
          '--td-td-px': '16px',
          '--td-td-py': '12px',
          '--td-action-gap': '0.5rem',
          '--td-action-size': '28px',
          '--td-footer-gap': '1rem',
          '--td-footer-primary-gap': '0.5rem',
          '--td-footer-secondary-gap': '1rem',
          '--td-footer-pagination-gap': '0.5rem',
          '--td-footer-px': '1.25rem',
          '--td-footer-py': '0.75rem',
          '--td-footer-button-size': '28px',
          '--td-footer-button-font-size': '0.875rem',
          '--td-footer-select-width': '4rem',
          '--td-footer-select-padding-y': '0.5rem',
          '--td-footer-select-padding-x': '0.5rem',
        };
      case 'compact':
        return {
          '--td-wrapper-padding': '0.5rem',
          '--td-scroll-px': '0.75rem',
          '--td-checkbox-width': '42px',
          '--td-th-font-size': '12px',
          '--td-th-px': '10px',
          '--td-th-py': '7px',
          '--td-td-font-size': '12px',
          '--td-td-px': '10px',
          '--td-td-py': '7px',
          '--td-action-gap': '0.25rem',
          '--td-action-size': '24px',
          '--td-footer-gap': '0.5rem',
          '--td-footer-primary-gap': '0.5rem',
          '--td-footer-secondary-gap': '0.5rem',
          '--td-footer-pagination-gap': '0.25rem',
          '--td-footer-px': '0.75rem',
          '--td-footer-py': '0.5rem',
          '--td-footer-button-size': '24px',
          '--td-footer-button-font-size': '0.75rem',
          '--td-footer-select-width': '3.5rem',
          '--td-footer-select-padding-y': '0.375rem',
          '--td-footer-select-padding-x': '0.375rem',
        };
      case 'super-compact':
        return {
          '--td-wrapper-padding': '0.375rem',
          '--td-scroll-px': '0.25rem',
          '--td-checkbox-width': '34px',
          '--td-th-font-size': '11px',
          '--td-th-px': '2px',
          '--td-th-py': '6px',
          '--td-td-font-size': '11px',
          '--td-td-px': '2px',
          '--td-td-py': '6px',
          '--td-action-gap': '2px',
          '--td-action-size': '22px',
          '--td-footer-gap': '2px',
          '--td-footer-primary-gap': '2px',
          '--td-footer-secondary-gap': '2px',
          '--td-footer-pagination-gap': '2px',
          '--td-footer-px': '0.25rem',
          '--td-footer-py': '0.375rem',
          '--td-footer-button-size': '22px',
          '--td-footer-button-font-size': '0.6875rem',
          '--td-footer-select-width': '3.25rem',
          '--td-footer-select-padding-y': '0.1875rem',
          '--td-footer-select-padding-x': '0.25rem',
        };
      case 'normal-compact':
      default:
        return {
          '--td-wrapper-padding': '0.5rem',
          '--td-scroll-px': '1rem',
          '--td-checkbox-width': '46px',
          '--td-th-font-size': '13px',
          '--td-th-px': '12px',
          '--td-th-py': '8px',
          '--td-td-font-size': '0.875rem',
          '--td-td-px': '12px',
          '--td-td-py': '8px',
          '--td-action-gap': '0.5rem',
          '--td-action-size': '28px',
          '--td-footer-gap': '0.75rem',
          '--td-footer-primary-gap': '0.5rem',
          '--td-footer-secondary-gap': '0.75rem',
          '--td-footer-pagination-gap': '0.25rem',
          '--td-footer-px': '1rem',
          '--td-footer-py': '0.75rem',
          '--td-footer-button-size': '28px',
          '--td-footer-button-font-size': '0.875rem',
          '--td-footer-select-width': '4rem',
          '--td-footer-select-padding-y': '0.5rem',
          '--td-footer-select-padding-x': '0.5rem',
        };
    }
  });

  readonly classes = computed<DensityClasses>(() => {
    return {
      wrapper: 'table-density-root',
      scroll: 'table-density-scroll',
      table: 'table-density-table',
      thead: 'table-density-thead',
      checkboxHead: 'table-density-checkbox-head',
      th: 'table-density-th',
      td: 'table-density-td',
      row: 'table-density-row',
      actionCell: 'table-density-action-cell',
      rowActions: 'table-density-row-actions',
      actionButton: 'table-density-action-button',
      footer: 'table-density-footer',
      footerPrimary: 'table-density-footer-primary',
      footerSecondary: 'table-density-footer-secondary',
      footerPagination: 'table-density-footer-pagination',
      footerIconButton: 'table-density-footer-icon-button',
      footerPageButton: 'table-density-footer-page-button',
      footerSelect: 'table-density-footer-select',
    };
  });

  constructor() {
    this.load();
  }

  setDensity(density: TableDensityMode) {
    this.density.set(density);
    localStorage.setItem(this.STORAGE_KEY, density);
  }

  private load() {
    const savedDensity = localStorage.getItem(this.STORAGE_KEY) as TableDensityMode | null;
    if (savedDensity && this.options.some((option) => option.id === savedDensity)) {
      this.density.set(savedDensity);
    }
  }
}
