import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RaceService } from '../../../Services/race.service';
import { catchError, of, tap } from 'rxjs';
import { CrossingData } from '../../../models/crossing-data.model';
import { MessagesService } from '../../../Services/messages.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OfficerDialogComponent } from '../officer-dialog/officer-dialog.component';
import { MessageType } from '../../../models/message.model';
import { Category } from '../../../models/category.model';

@Component({
    selector: 'app-finish-line',
    templateUrl: './finish-line.component.html',
    styleUrl: './finish-line.component.scss',
    standalone: false
})
export class FinishLineComponent implements OnInit {
  private raceService:RaceService = inject(RaceService);
  private messagesService:MessagesService = inject(MessagesService);

  dialog:MatDialog = inject(MatDialog);

  crossingData!:CrossingData;
  raceNumberForm!: FormGroup;
  raceNumberMarked:string = "";
  bestLap:string = " --- ";

  @Output() categoryForRanking:EventEmitter<Category> = new EventEmitter<Category>();

  ngOnInit(): void {
    this.createForm();    
  }


  public onMarkPassage(): void {
    this.raceNumberMarked = this.raceNumberForm.value.raceNumber;
    if(this.raceNumberMarked !== "") {
      const num:number = +this.raceNumberMarked;
      if(num) {
        this.raceService.markPassage(num).pipe(
          tap( cd => {
            this.handleCrossingData(cd);
            this.raceNumberForm.setValue({raceNumber:""});
          }),
          catchError( _err =>  {
            return of(this.setCrossingDataForErrorConnection());
          }),
        ).subscribe( ecd => {
          if(ecd.responseStatus === "error_connection")
            this.handleCrossingData(ecd);
          });
      } 
      else {
        this.messagesService.setupMessageForDialog(`${this.raceNumberMarked} Is Not a Number.`, MessageType.SIMPLE_MESSAGE);
        this.openDialog();
      };
    }
  }

  private createForm() {
    this.raceNumberForm = new FormGroup({
      raceNumber: new FormControl({value : "", disabled : false})
    })
  }

  /*Setup a default CrossingData model interface to handle connection issues.
  * setting its responseStatus property as "error_connection"
  */
  private setCrossingDataForErrorConnection(): CrossingData {
    const crossingData:CrossingData = {
      raceNumber:0,
      athlete: {name: '', surname: '', birthday: new Date(), cityOfBirth: '', team: ''},
      category: {name:'', lapsToDo:0},
      times: [],
      responseStatus: "error_connection",
      gap: 0,
      finished: false,
      position: 0,
      textGap: '',
      textTimes: [],
      textOverall: '',
    }
    return crossingData;
  }



  /*
  * Handles the CrossingData type returned from the server based to its "responseStatus" property
  */
  private handleCrossingData(cd:CrossingData) {
    switch (cd.responseStatus) {
      case "valid" : 
        this.crossingData = cd;
        const best = Math.min(...this.crossingData.times);
        for(let i = 0; i < this.crossingData.times.length; i++){
          if(this.crossingData.times[i] === best) {
            this.bestLap = this.crossingData.textTimes[i];
            i= this.crossingData.times.length;
          }
        }
        this.categoryForRanking.emit(cd.category);
        break;
      case "valid_finished" :
        this.messagesService.setupMessageForDialog(cd, MessageType.VALID_FINISHED_CROSSING);
        this.openDialog();
        break;
      case "no_valid" :
        this.messagesService.setupMessageForDialog(cd, MessageType.NO_VALID_CROSSING);
        this.openDialog();
        break
      case "error_connection":
        this.messagesService.setupMessageForDialog("THE APPLICATION HAS STOPPED WORKING!!", MessageType.RACE_OFF_LINE);
        this.openDialog();
    }
  }


  //open the success dialog
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messagesService.getMessage();
    dialogConfig.position = {top:"0", right:"0"};
    this.dialog.open(OfficerDialogComponent, dialogConfig);
    this.messagesService.reset();
  }

}
