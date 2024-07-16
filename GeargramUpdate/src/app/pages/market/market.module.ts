import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRoutingModule } from './market-routing.module';
import { MarketComponent } from './market.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPhotoEditorModule } from 'ngx-photo-editor';




@NgModule({
  declarations: [
    MarketComponent,
  ],
  imports: [
    CommonModule,
    MarketRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPhotoEditorModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MarketModule {}
