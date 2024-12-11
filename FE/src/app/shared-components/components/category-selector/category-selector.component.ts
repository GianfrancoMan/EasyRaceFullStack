import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Category } from '../../../models/category.model';
import { Router } from '@angular/router';
import { Athlete } from '../../../models/athlete.model';

@Component({
    selector: 'app-category-selector',
    templateUrl: './category-selector.component.html',
    styleUrl: './category-selector.component.scss',
    standalone: false
})
export class CategorySelectorComponent {
  @Input() categories:Category[] = [];
  @Input() category!:Category;
  @Input() currentCategory!:Category;
  @Input() athlete!:Athlete;
  @Output() categoryEmitter:EventEmitter<Category> = new EventEmitter<Category>;

  private router:Router = inject(Router);

  public clickCategory(cat:Category):void {
    this.category = cat;
  }

  public onClickSendButton() {
    if(this.currentCategory.name === this.category.name) alert("This is athlete's current category, Please choose another one or press the Cancel button");
    else this.categoryEmitter.emit(this.category);
  }

  public onClickCancelButton() {
    this.router.navigate(['/']);
  }


}
