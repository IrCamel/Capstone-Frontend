import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SavedPostComponent } from './saved-post.component';

const routes: Routes = [{ path: '', component: SavedPostComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SavedPostRoutingModule { }
