import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'homepage',
    loadChildren: () => import('./pages/homepage/homepage.module').then(m => m.HomepageModule),
    canActivate: [AuthGuard], canActivateChild: [AuthGuard]
  },
  { path: 'market',
    loadChildren: () => import('./pages/market/market.module').then(m => m.MarketModule),
    canActivate: [AuthGuard], canActivateChild: [AuthGuard]
  },
  { path: 'profilo/:id', loadChildren: () => import('./pages/profilo/profilo.module').then(m => m.ProfiloModule)
  },
  { path: 'aboutus',
    loadChildren: () => import('./pages/aboutus/aboutus.module').then(m => m.AboutusModule),
    canActivate: [AuthGuard], canActivateChild: [AuthGuard]
  },
  { path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'homepage',
    loadChildren: () => import('./pages/homepage/homepage.module').then(m => m.HomepageModule),
    canActivate: [AuthGuard], canActivateChild: [AuthGuard]
  },
  { path: 'savedPost', loadChildren: () => import('./pages/saved-post/saved-post.module').then(m => m.SavedPostModule),
    canActivate: [AuthGuard], canActivateChild: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
