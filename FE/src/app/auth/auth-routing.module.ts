import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './authorization/authorization.component';

const routes: Routes = [
  {path:"auth", component:AuthorizationComponent, title:"Easy Race - Authorization"},
  {path:"", redirectTo:"auth", pathMatch:"full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
