import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthorizationComponent } from './authorization/authorization.component';
import { SharedComponentsModule } from '../shared-components/shared-components.module';


@NgModule({
  declarations: [
    AuthorizationComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedComponentsModule
  ]
})
export class AuthModule { }
