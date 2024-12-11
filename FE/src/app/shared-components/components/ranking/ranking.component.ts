import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { Category } from '../../../models/category.model';
import { RaceService } from '../../../Services/race.service';
import { CrossingData } from '../../../models/crossing-data.model';
import { MatTabChangeEvent } from '@angular/material/tabs';
@Component({
    selector: 'app-ranking',
    templateUrl: './ranking.component.html',
    styleUrl: './ranking.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class RankingComponent {

  @Input() index:number = 0;
  @Input() categories:Category[] = [];
  @Input() ranking:CrossingData[] = [];
  @Output() changeTab:EventEmitter<Category>  = new EventEmitter<Category>();

  tableHeaders:string[] = ["Pos.", "Num.", "Surname", "Best", "Current", "Overall", "Gap", "Currently"];

  private raceService:RaceService = inject(RaceService);

  public setBest(index:number):string | undefined {
    const times = this.ranking[index].times;
    let best = Math.min(...times);
    for(let i:number=0; i< times.length; i++) {
      if(times[i] === best) {
        this.ranking[index].best = this.ranking[index].textTimes[i];
        i= times.length;
      }
    }    
    return this.ranking[index].best;
  }


  public onFocusChange(ev:number) {   
    this.changeTab.emit(this.categories[ev]);
  }

}