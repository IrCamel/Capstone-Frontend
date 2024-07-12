import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SavedPostRoutingModule } from './saved-post-routing.module';
import { SavedPostComponent } from './saved-post.component';


@NgModule({
  declarations: [
    SavedPostComponent
  ],
  imports: [
    CommonModule,
    SavedPostRoutingModule
  ]
})
export class SavedPostModule { }
