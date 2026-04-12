import { Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { ProductsComponent } from './products.component';
import { PurchasesComponent } from './purchases.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'customers', pathMatch: 'full' },
	{ path: 'customers', component: CustomersComponent },
	{ path: 'products', component: ProductsComponent },
	{ path: 'purchases', component: PurchasesComponent },
];
