import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { Category } from '../../../models/category.model';
import { RaceService } from '../../../Services/race.service';
import { catchError, of, tap } from 'rxjs';
import { MessagesService } from '../../../Services/messages.service';
import { MessageType } from '../../../models/message.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OfficerDialogComponent } from '../officer-dialog/officer-dialog.component';

@Component({
  selector: 'app-section-category',
  templateUrl: './section-category.component.html',
  styleUrl: './section-category.component.scss'
})
export class SectionCategoryComponent implements OnInit {
  private raceService:RaceService = inject(RaceService);
  private messages:MessagesService = inject(MessagesService);

  dialog:MatDialog = inject(MatDialog);

  @Input() categories:Category[] = [];
  @Input() selectedIndexes:boolean[] = [];
  @Output() overall:EventEmitter<boolean> = new EventEmitter<boolean>();
  started:String[] = [];
  isOverall:boolean = false;
  overallEnabled:boolean = false;
  overallChecked:boolean = false;



    ngOnInit() {
      const data = localStorage.getItem('cacheCategories');
      if(data) {
        this.retrievesState(data);     
      }
      this.overallChecked = false;
    }

    @HostListener('window:beforeunload')
    storeData() {
      localStorage.setItem('cacheCategories', this.prepareDataForCaching());
    }

  

    /**
   * Negates the selected index value related to the checkbox that changed the state. 
   * @param index the index related to the selected check box.
   */
    public onChangeCheckBox(index:number) {this.selectedIndexes[index] = !this.selectedIndexes[index];}


    public onChangeOverall(): void {
      this.isOverall = !this.isOverall;
      this.overall.emit(this.isOverall);
    }


  
    public onStartCategories() {
      let startCategoryNames:Category[] = [];
      let noStartedCategories:Category[] = []
  
      for(let i:number = 0; i < this.selectedIndexes.length; i ++) {
        if(this.selectedIndexes[i]) {
          startCategoryNames.push(this.categories[i]);
          this.started.push(`${this.categories[i].name} (started)`);
        }
        else 
          noStartedCategories.push(this.categories[i])      
      }

      this.raceService.startCategories(startCategoryNames).pipe(
        tap(result => {
          console.log(result);

          this.categories = noStartedCategories;
          this.selectedIndexes = [];
          this.categories.forEach( _c => this.selectedIndexes.push(false));
          console.log(this.categories);
        }),
        catchError( _=> of("ERROR")),
      ).subscribe(res=> {
        if(res==="ERROR") {
          this.messages.setupMessageForDialog("THE APPLICATION HAS STOPPED WORKING!!", MessageType.RACE_OFF_LINE);
          this.openDialog();
        }
      });
    }


    /**
     * General Ranking Constraint:
     * The general classification is only allowed if all athletes complete the same race circuit and complete it the same number of times. 
     * This Application can only verify the number of laps, but it is the organizer's responsibility to verify for the same circuit.  
     * @returns boolean true if all athlete performs the same number of the laps.
     */
    public checkForOverall():boolean {
      if(!this.overallChecked){
        if(this.categories.length > 0) {
          this.overallEnabled = true;
          this.overallChecked = true;
          let lapsNumber:number = this.categories[0].lapsToDo;
          for(let c of this.categories) {
            if(c.lapsToDo !== lapsNumber) {
              this.overallEnabled = false;
              break;
            }
          }
          return this.overallEnabled;
        }
        else {return false;}
      }
      return this.overallEnabled
    }


    

  /**
   * This method serialize the state of this page to cache it in the local storage when needed. 
   * @return the serialized state in form of string type
   */
  private prepareDataForCaching(): string {
    const data = JSON.stringify([
      {categories:this.categories},
      {selectedIndexes:this.selectedIndexes},
      {started:this.started},
      {isOverall:this.isOverall},
    ]);

    return data;
  }


  /**
   * set the state of the component leveraging on local storage data
   * @param data tha data stored in the local storage
   */
  private retrievesState(data:string) {    
    const cachedData = JSON.parse(data);
    if(cachedData) {
      this.categories = cachedData[0].categories;
      this.selectedIndexes = cachedData[1].selectedIndexes;
      this.started = cachedData[2].started,
      this.isOverall = cachedData[3].isOverall;
      if(this.started.length > 0) {
        let idxs:number[] = [];
        this.started.forEach( s=> {
          let idx:number = 0
          cachedData[0].categories.forEach( (c:Category) => {
            if(s === c.name) {
              idxs.push(idx);
            }
            idx++;
          })
        })
        idxs.forEach( index => {
          cachedData[0].categories.splice(index, 1);
        })
        this.categories = cachedData[0].categories;
        console.log(this.categories);
      }
    }  
  }


  
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messages.getMessage();
    dialogConfig.position = {top:"0", right:"0"};
    this.dialog.open(OfficerDialogComponent, dialogConfig);
    this.messages.reset();
  }

}
