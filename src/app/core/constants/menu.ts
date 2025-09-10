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
            { label: 'Vehiculos', route: '/layout/dashboard/cars' }
          ],
        },
      ],
    }
  ];
}
