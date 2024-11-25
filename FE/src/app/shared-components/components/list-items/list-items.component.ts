import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrl: './list-items.component.scss'
})
export class ListItemsComponent {
  @Input() title:string = '';
  @Input() type:string = 'athlete';
  @Input() items:any[] = [];
  @Output() selectedItem:EventEmitter<any> = new EventEmitter<any>();
  
  public clickItem(item:any) {
    this.selectedItem.emit(item);
  }
}
