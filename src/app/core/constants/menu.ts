import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Menu',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Catalogos',
          route: '/dashboard',
          children: [
            { label: 'Clientes', route: '/layout/dashboard/clients' },
            { label: 'Autos', route: '/layout/dashboard/cars' },
            { label: 'Tipos de Autos', route: '/layout/dashboard/type-cars' },
            { label: 'Tipo de documento', route: '/layout/dashboard/typ-documents' },
            { label: 'Tipos de gastos', route: '/layout/dashboard/typ-expense' },
            { label: 'Tipos de pagos', route: '/layout/dashboard/type-payments' },
            { label: 'Sucursales', route: '/layout/dashboard/store' },
            { label: 'Clasificación de gasto', route: '/layout/dashboard/expense-classification' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/lock-closed.svg',
          label: 'Administración',
          route: '/dashboard',
          children: [
            { label: 'Usuarios', route: '/layout/dashboard/users' },
            { label: 'Roles', route: '/layout/dashboard/roles' },
            { label: 'Scopes', route: '/layout/dashboard/scopes' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/document.svg',
          label: 'Reportes',
          route: '/dashboard',
          children: [
            { label: 'Lista de precios', route: '/layout/dashboard/price-list' },
            { label: 'Lista de documentos', route: '/layout/dashboard/documents-list' },
            { label: 'Tiempo en Piso', route: '/layout/dashboard/floor-time' },
            { label: 'Reporte de ventas', route: '/layout/dashboard/report-sales' },
            { label: 'Reporte de comisiones', route: '/layout/dashboard/report-comisions' },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Configuracion',
          route: '/layout/dashboard/configuration',
        },
        {
          icon: 'assets/icons/heroicons/outline/user-groups.svg',
          label: 'Inversionistas',
          route: '/layout/dashboard/investor',
        },
        {
          icon: 'assets/icons/heroicons/outline/shopping.svg',
          label: 'Compras',
          route: '/layout/dashboard/shopping',
        },
        {
          icon: 'assets/icons/heroicons/outline/check.svg',
          label: 'Revisión de llegada',
          route: '/layout/dashboard/arrival-review',
        },
         {
          icon: 'assets/icons/heroicons/outline/bills.svg',
          label: 'Gastos',
          route: '/layout/dashboard/bills',
        },
        { 
           icon: 'assets/icons/heroicons/outline/document-upload.svg',
          label: 'Carga de Documentos', 
          route: '/layout/dashboard/documents' 
        },
        { 
          icon: 'assets/icons/heroicons/outline/wallet.svg',
          label: 'Apartados', 
          route: '/layout/dashboard/layaway' 
        },
         { 
          icon: 'assets/icons/heroicons/outline/layaway.svg',
          label: 'Ventas', 
          route: '/layout/dashboard/sales' 
        },
        {
          icon: 'assets/icons/heroicons/outline/income.svg',
          label: 'Ingresos', 
          route: '/layout/dashboard/incomes' 
        },
        {
          icon: 'assets/icons/heroicons/outline/folder-plus.svg',
          label: 'Cobranza', 
          route: '/layout/dashboard/collections' 
        },
      ],
    }
  ];
}
