import { Routes } from '@angular/router';
import { BegripComponent } from './begrip.component';
import { StartComponent } from './start.component';

export const routes: Routes = [
	{ path: '', component: StartComponent },
	{ path: 'begrip/:index', component: BegripComponent },
	{ path: '**', redirectTo: '' }
];
