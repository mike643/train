import { Routes } from '@angular/router';
import { BegripComponent } from './begrip.component';
import { StartComponent } from './start.component';
import { ExamenComponent } from './examen.component';

export const routes: Routes = [
	{ path: '', component: StartComponent },
	{ path: 'examen', component: ExamenComponent },
	{ path: 'begrip/:index', component: BegripComponent },
	{ path: '**', redirectTo: '' }
];
