import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import  {MatDividerModule } from '@angular/material/divider'

import { SharedComponentsRoutingModule } from './shared-components-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { RaceConfigurationComponent } from './components/race-configuration/race-configuration.component';
import { BasicDialogComponent } from './components/basic-dialog/basic-dialog.component';
import { AthleteSetupComponent } from './components/athlete-setup/athlete-setup.component';
import { UploadComponent } from './components/upload/upload.component';
import { SectionCategoryComponent } from './components/section-category/section-category.component';
import { FinishLineComponent } from './components/finish-line/finish-line.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { CategorySelectorComponent } from './components/category-selector/category-selector.component';
import { ListItemsComponent } from './components/list-items/list-items.component';
import { LoginComponent } from './components/login/login.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { OfficerDialogComponent } from './components/officer-dialog/officer-dialog.component';


@NgModule({
  declarations: [
    NavComponent,
    RaceConfigurationComponent,
    BasicDialogComponent,
    AthleteSetupComponent,
    UploadComponent,
    SectionCategoryComponent,
    FinishLineComponent,
    RankingComponent,
    CategorySelectorComponent,
    ListItemsComponent,
    LoginComponent,
    SubscriptionComponent,
    OfficerDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedComponentsRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    MatListModule,
    MatCheckboxModule,
    MatGridListModule,
    MatTabsModule,
    MatDividerModule,
  ],
  exports: [
    NavComponent,
    RaceConfigurationComponent,
    AthleteSetupComponent,
    UploadComponent,
    SectionCategoryComponent,
    FinishLineComponent,
    RankingComponent,
    CategorySelectorComponent,
    ListItemsComponent,
    LoginComponent,
    SubscriptionComponent,
  ],
})
export class SharedComponentsModule { }
