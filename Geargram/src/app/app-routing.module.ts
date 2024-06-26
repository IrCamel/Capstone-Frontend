import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'homepage', loadChildren: () => import('./pages/homepage/homepage.module').then(m => m.HomepageModule), canActivate: [AuthGuard] },
  { path: 'market', loadChildren: () => import('./pages/market/market.module').then(m => m.MarketModule), canActivate: [AuthGuard] },
  { path: 'profilo', loadChildren: () => import('./pages/profilo/profilo.module').then(m => m.ProfiloModule), canActivate: [AuthGuard] },
  { path: 'aboutus', loadChildren: () => import('./pages/aboutus/aboutus.module').then(m => m.AboutusModule), canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
