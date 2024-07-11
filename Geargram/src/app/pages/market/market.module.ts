import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRoutingModule } from './market-routing.module';
import { MarketComponent } from './market.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MarketComponent
  ],
  imports: [
    CommonModule,
    MarketRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketModule { }
