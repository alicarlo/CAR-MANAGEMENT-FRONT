import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { CarsComponent } from './pages/cars/cars.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ScopesComponent } from './pages/scopes/scopes.component';
import { UsersComponent } from './pages/users/users.component';
import { TypCarsComponent } from './pages/typ-cars/typ-cars.component';
import { TypDocumentsComponent } from './pages/typ-documents/typ-documents.component';
import { TypeExpenseComponent } from './pages/type-expense/type-expense.component';
import { ExpenseClassificationComponent } from './pages/expense-classification/expense-classification.component';
import { StoreComponent } from './pages/store/store.component';
import { InvestorComponent } from './pages/investor/investor.component';
import { InvestmentComponent } from './pages/investment/investment.component';
import { ShoppingComponent } from './pages/shopping/shopping.component';
import { TypePaymentsComponent } from './pages/type-payments/type-payments.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { ArrivalReviewComponent } from './pages/arrival-review/arrival-review.component';
import { BillsComponent } from './pages/bills/bills.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      { path: 'clients', component: ClientsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'scopes', component: ScopesComponent },
      { path: 'cars', component: CarsComponent },
      { path: 'type-cars', component: TypCarsComponent },
      { path: 'typ-documents', component: TypDocumentsComponent },
      { path: 'typ-expense', component: TypeExpenseComponent },
      { path: 'store', component: StoreComponent },
      { path: 'expense-classification', component: ExpenseClassificationComponent },
      { path: 'investor', component: InvestorComponent },
      { path: 'shopping', component: ShoppingComponent },
      { path: 'type-payments', component: TypePaymentsComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'arrival-review', component: ArrivalReviewComponent },
      { path: 'bills', component: BillsComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
