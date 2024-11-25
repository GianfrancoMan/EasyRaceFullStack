import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Category } from '../../../models/category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.scss'
})
export class CategorySelectorComponent {
  @Input() categories:Category[] = [];
  @Input() category!:Category;
  @Output() categoryEmitter:EventEmitter<Category> = new EventEmitter<Category>;

  private router:Router = inject(Router);

  public clickCategory(cat:Category):void {
    this.category = cat;
  }

  public onClickSendButton() {
    this.categoryEmitter.emit(this.category);
  }

  public onClickCancelButton() {
    this.router.navigate(['/']);
  }


}
