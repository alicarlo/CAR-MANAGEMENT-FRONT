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
import { LayawayComponent } from './pages/layaway/layaway.component';
import { SalesComponent } from './pages/sales/sales.component';
import { IncomesComponent } from './pages/incomes/incomes.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { PriceListReportComponent } from './pages/price-list-report/price-list-report.component';
import { DocumentsListReportComponent } from './pages/documents-list-report/documents-list-report.component';
import { scopeGuard } from 'src/app/core/guards/scope/scope.guard';
import { FloorTimeReportComponent } from './pages/floor-time-report/floor-time-report.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { ReportSalesComponent } from './pages/report-sales/report-sales.component';
import { ReportComisionsComponent } from './pages/report-comisions/report-comisions.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'clients', component: ClientsComponent, canActivate: [scopeGuard], data: { scopes: ['CLIENT', 'CLIENT.GET'] } },
      { path: 'users', component: UsersComponent, canActivate: [scopeGuard], data: { scopes: ['USER', 'USER.GET'] } },
      { path: 'roles', component: RolesComponent, canActivate: [scopeGuard], data: { scopes: ['ROLE', 'ROLE.GET'] } },
      { path: 'scopes', component: ScopesComponent, canActivate: [scopeGuard], data: { scopes: ['SCOPE', 'SCOPE.GET'] } },
      { path: 'cars', component: CarsComponent, canActivate: [scopeGuard], data: { scopes: ['CAR', 'CAR.GET'] } },
      { path: 'type-cars', component: TypCarsComponent, canActivate: [scopeGuard], data: { scopes: ['CATALOGOS', 'CATALOGOS.CAR_TYPE.GET'] } },
      { path: 'typ-documents', component: TypDocumentsComponent, canActivate: [scopeGuard], data: { scopes: ['CATALOGOS', 'CATALOGOS.DOCUMENT_TYPE.GET'] } },
      { path: 'typ-expense', component: TypeExpenseComponent, canActivate: [scopeGuard], data: { scopes: ['CATALOGOS', 'CATALOGOS.BILL_TYPE.GET'] } },
      { path: 'store', component: StoreComponent, canActivate: [scopeGuard], data: { scopes: ['STORE', 'STORE.GET'] } },
      { path: 'expense-classification', component: ExpenseClassificationComponent, canActivate: [scopeGuard], data: { scopes: ['CATALOGOS', 'CATALOGOS.CLASSIFICATION_BILL.GET'] } },
      { path: 'investor', component: InvestorComponent, canActivate: [scopeGuard], data: { scopes: ['INVESTOR', 'INVESTOR.GET'] } },
      { path: 'shopping', component: ShoppingComponent, canActivate: [scopeGuard], data: { scopes: ['PURCHASE', 'PURCHASE.GET'] } },
      { path: 'type-payments', component: TypePaymentsComponent, canActivate: [scopeGuard], data: { scopes: ['CATALOGOS', 'CATALOGOS.PAYMENT_METHOD.GET'] } },
      { path: 'documents', component: DocumentsComponent, canActivate: [scopeGuard], data: { scopes: ['DOCUMENTS', 'DOCUMENTS.GET'] } },
      { path: 'arrival-review', component: ArrivalReviewComponent, canActivate: [scopeGuard], data: { scopes: ['ARRIVAL', 'ARRIVAL.GET'] } },
      { path: 'bills', component: BillsComponent, canActivate: [scopeGuard], data: { scopes: ['BILL', 'BILL.GET'] } },
      { path: 'layaway', component:  LayawayComponent, canActivate: [scopeGuard], data: { scopes: ['LAYAWAY', 'LAYAWAY.GET'] } },
      { path: 'sales', component: SalesComponent, canActivate: [scopeGuard], data: { scopes: ['SALE', 'SALE.GET'] } },
      { path: 'incomes', component:  IncomesComponent, canActivate: [scopeGuard], data: { scopes: ['INCOME', 'INCOME.GET'] } },
      { path: 'collections', component: CollectionsComponent, canActivate: [scopeGuard], data: { scopes: ['COLLECTIONS', 'COLLECTIONS.GET'] } },
      { path: 'price-list', component: PriceListReportComponent, canActivate: [scopeGuard], data: { scopes: ['REPORTS.LISTADO_PRECIOS.GET'] } },
      { path: 'documents-list', component: DocumentsListReportComponent, canActivate: [scopeGuard], data: { scopes: ['REPORTS.LISTADO_DOCUMENTOS.GET'] } },
      { path: 'floor-time', component: FloorTimeReportComponent, canActivate: [scopeGuard], data: { scopes: ['REPORTS.TIEMPO_PISO.GET'] } },
      { path: 'report-sales', component: ReportSalesComponent, canActivate: [scopeGuard], data: { scopes: ['REPORTS.REPORTE_VENTAS.GET'] } },
      { path: 'report-comisions', component: ReportComisionsComponent, canActivate: [scopeGuard], data: { scopes: ['REPORTS.COMISIONES.GET'] } },
      { path: 'configuration', component: ConfigurationComponent },
      
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
