import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path:"",
    loadChildren:()=> import('./pages/pages.module').then(module => module.PagesModule),
  },
  {
    path:"auth",
    loadChildren:()=>import("./auth/auth.module").then(module => module.AuthModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
