import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import  {MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { PagesRoutingModule } from './pages-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedComponentsModule } from '../shared-components/shared-components.module';
import { NewRaceComponent } from './new-race/new-race.component';
import { AthletesComponent } from './athletes/athletes.component';
import { OfficerComponent } from './officer/officer.component';
import { AthleteDeleteComponent } from './athlete-delete/athlete-delete.component';
import { UpdateConfigurationComponent } from './update-configuration/update-configuration.component';
import { ChangeCategoryComponent } from './change-category/change-category.component';
import { CategoryNameComponent } from './category-name/category-name.component';
import { ResultsComponent } from './results/results.component';



@NgModule({
  declarations: [
    HomeComponent,
    NewRaceComponent,
    AthletesComponent,
    OfficerComponent,
    AthleteDeleteComponent,
    UpdateConfigurationComponent,
    ChangeCategoryComponent,
    CategoryNameComponent,
    ResultsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    SharedComponentsModule,
    MatIconModule,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
})
export class PagesModule { }
