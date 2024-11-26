import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Category } from '../../../models/category.model';
import { RaceService } from '../../../Services/race.service';
import { MessagesService } from '../../../Services/messages.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-section-category',
  templateUrl: './section-category.component.html',
  styleUrl: './section-category.component.scss'
})
export class SectionCategoryComponent {
  private raceService:RaceService = inject(RaceService);
  private messages:MessagesService = inject(MessagesService);

  dialog:MatDialog = inject(MatDialog);

  @Input() categories!:Category[];
  @Input() started!:string[];
  @Input() isOverall:boolean = false;
  @Input() overallEnabled:boolean = false;
  @Output() selectedIndex:EventEmitter<number> = new EventEmitter<number>();
  @Output() overall:EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startCategory:EventEmitter<boolean> = new EventEmitter<boolean>();

  

    /**
   * Negates the selected index value related to the checkbox that changed the state. 
   * @param index the index related to the selected check box.
   */
    public onChangeCheckBox(index:number) {
      this.selectedIndex.emit(index);
      //this.selectedIndexes[index] = !this.selectedIndexes[index];
      }


    public onChangeOverall(): void {
      //this.isOverall = !this.isOverall;
      this.overall.emit(!this.isOverall);
    }


  
    public onStartCategories() {
      this.startCategory.emit(true);
    }
}
