import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewRaceComponent } from './new-race/new-race.component';
import { AthletesComponent } from './athletes/athletes.component';
import { OfficerComponent } from './officer/officer.component';
import { AthleteDeleteComponent } from './athlete-delete/athlete-delete.component';
import { UpdateConfigurationComponent } from './update-configuration/update-configuration.component';
import { ChangeCategoryComponent } from './change-category/change-category.component';
import { CategoryNameComponent } from './category-name/category-name.component';
import { ResultsComponent } from './results/results.component';
import { authenticateGuard } from '../guards/authenticate.guard';

const routes: Routes = [
  { path:"home",
    component:HomeComponent,
    title:"Easy Race - home",
  },
  { path:"new",
    component:NewRaceComponent,
    title:"Easy Race - new race",
    canActivate:[authenticateGuard],
  },
  { path:"add", 
    component:AthletesComponent,
    title:"Easy Race - athletes",
    canActivate:[authenticateGuard],
  },
  { path:"run",
    component:OfficerComponent,
    title:"Easy Race in progress",
    canActivate:[authenticateGuard],
  },
  { path:"exclude",
    component:AthleteDeleteComponent,
    title:"Easy Race - remove athlete",
    canActivate:[authenticateGuard],
  },
  { path:"update",
    component:UpdateConfigurationComponent,
    title:"Easy Race - update",
    canActivate:[authenticateGuard],
  },
  { path:"change-cat",
    component:ChangeCategoryComponent,
    title:"Easy Race - change category",
    canActivate:[authenticateGuard],
  },
  { path:"chg-ct-name",
    component:CategoryNameComponent,
    title:"Easy Race - category name",
    canActivate:[authenticateGuard],
  },
  { path:"results",
    component:ResultsComponent,
    title:"Easy Race - results",
    canActivate:[authenticateGuard],
  },
  { 
    path:"",
    redirectTo:"home",
    pathMatch:"full"
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
