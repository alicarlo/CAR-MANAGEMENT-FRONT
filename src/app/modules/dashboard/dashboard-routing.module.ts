import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { CarsComponent } from './pages/cars/cars.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ScopesComponent } from './pages/scopes/scopes.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      { path: 'clients', component: ClientsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'scopes', component: ScopesComponent },
      { path: 'cars', component: CarsComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
