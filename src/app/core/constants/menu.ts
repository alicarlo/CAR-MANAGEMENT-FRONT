import { MenuItem } from '../models/menu.model';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard',
          children: [
            { label: 'Clientes', route: '/layout/dashboard/clients' },
            { label: 'Vehiculos', route: '/layout/dashboard/cars' },
            { label: 'Tipos de vehiculos', route: '/layout/dashboard/type-cars' },
            { label: 'Tipos de documentos', route: '/layout/dashboard/typ-documents' },
            { label: 'Tipos de gastos', route: '/layout/dashboard/typ-expense' },
            { label: 'Sucursales', route: '/layout/dashboard/store' },
            { label: 'Documentos', route: '/layout/dashboard/expense-classification' },
            { label: 'Inversores', route: '/layout/dashboard/investor' },
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
        
      ],
    }
  ];
}
