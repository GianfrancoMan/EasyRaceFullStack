import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { RaceService } from '../../Services/race.service';
import { Category } from '../../models/category.model';
import { catchError, of, tap } from 'rxjs';
import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { Router } from '@angular/router';
import { CrossingData } from '../../models/crossing-data.model';
import { ConfigurationService } from '../../Services/configuration.service';
import { AuthService } from '../../Services/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OfficerDialogComponent } from '../../shared-components/components/officer-dialog/officer-dialog.component';


@Component({
  selector: 'app-officer',
  templateUrl: './officer.component.html',
  styleUrl: './officer.component.scss'
})
export class OfficerComponent implements OnDestroy, OnInit {
  title:string = "Race Management";
  manage:boolean = false;
  fileSelected:boolean = false;

  private router:Router = inject(Router);
  private raceService:RaceService = inject(RaceService);
  private authService:AuthService = inject(AuthService);
  private messageService:MessagesService = inject(MessagesService);
  private confService:ConfigurationService = inject(ConfigurationService);

  dialog:MatDialog = inject(MatDialog);

  categories:Category[] = [];
  rankingCategories:Category[] = [];
  sectionCategories:Category[] = [];
  selectedIndexes:boolean[] = [];
  startedCategories:string[] = [];
  selectedIndex:number = 0;
  overallEnabled:boolean = false;
  ranking:CrossingData[] = [];
  filename:string = "";
  isOverall:boolean = false;
  overallChecked = false;
  

  constructor() {
    const data = localStorage.getItem('cache');
    if(data) {
      this.retrievesState(data);
    }
  }


  ngOnInit(): void {
    this.authService.clearFiles().pipe(
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    ).subscribe( response => {
      if(response === "ERROR") {
        this.confService.resetFileData()
        this.messageService.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.confService.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        }
      }
    });
    this.confService.resetFileData();
  }


  ngOnDestroy(): void {
      if(this.raceService.performing === true) {
        localStorage.setItem('cache', this.prepareDataForCaching());
      }
      else {
        if(this.confService.getRawRaceFile() !== undefined) {
          this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
            catchError( (error)=> {
              const errorResolved = this.authService.loginExpiredHandler(error);
              if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
            }),        
          ).subscribe(res => {
            if(res instanceof HttpErrorResponse) {
              this.confService.resetFileData()         
              if(res.status === HttpStatusCode.Forbidden) {            
                localStorage.removeItem("jwtkn");
                this.router.navigate(['/auth']);
              }
            }        
          });
          this.confService.resetFileData();
        }
    }
    
  }




  @HostListener('window:beforeunload') storeData() {
    if(this.manage === true)
      localStorage.setItem('cache', this.prepareDataForCaching());
  }


  /**
   * When the user selects the configuration of the race that will be take place
   * the categories of this race are requested from the server so that the user 
   * can choose which ones to start
   * @param selected true if the configuration has been prepared for the execution of the race otherwise false
   */
  public onUpload(value:boolean): void {
    this.selectedIndexes = [];
    this.categories = [];
    this.manage = true;
    this.fileSelected = value;
    if(value) {
      this.raceService.prepareRaceToRun({observe:"response"}).pipe(
        tap( response => {
          this.raceService.performing = true;
          this.filename = this.confService.getCurrentFileName();
          if(response.status === 205) {
            this.exit(MessageType.SIMPLE_MESSAGE);
          } else {
              this.categories = response.body;
              if(this.categories != undefined && this.categories.length > 0) {
                this.categories.forEach(c => {
                  this.rankingCategories.push(c);
                  this.selectedIndexes.push(false);
                  this.sectionCategories.push(c);
                });
                this.overallEnabled = this.checkForOverallEnabled();
              }
          }
        }),
        catchError( _error => {
          const errResponse = new HttpResponse();  
          return of(errResponse);
        })
      ).subscribe(x=> {if(x.url === null) this.exit(MessageType.DOWN)});
    }
  }

  

  public onSelectedIndex(indexValue:number) {
    this.selectedIndexes[indexValue] = !this.selectedIndexes[indexValue];
  }




  public onStartCategories(value:boolean) {
      let startCategoryNames:Category[] = [];
      let noStartedCategories:Category[] = [];
  
      for(let i:number = 0; i < this.selectedIndexes.length; i ++) {
        if(this.selectedIndexes[i]) {
          startCategoryNames.push(this.sectionCategories[i]);
          this.startedCategories.push(`${this.sectionCategories[i].name} (started)`);
        }
        else 
          noStartedCategories.push(this.sectionCategories[i])      
      }

      this.raceService.startCategories(startCategoryNames).pipe(
        tap(result => {

          this.sectionCategories = noStartedCategories;
          this.selectedIndexes = [];
          this.sectionCategories.forEach( _c => this.selectedIndexes.push(false));
        }),
        catchError( _=> of("ERROR")),
      ).subscribe(res=> {
        if(res==="ERROR") {
          this.messageService.setupMessageForDialog("THE APPLICATION HAS STOPPED WORKING!!", MessageType.RACE_OFF_LINE);
          this.openDialog();
        }
      });  
  }



  public onCategoryForRanking(category:Category): void {
    if(category.name !== "" && category.name !== "GENERAL") {
      this.raceService.getCategoryRanking(category.name).pipe(
        tap(r => this.setRankingToDisplay(category, r)),
        catchError( _=> of("ERROR")),
      ).subscribe(res=> {
        if(res==="ERROR") {
          this.messageService.setupMessageForDialog("THE APPLICATION HAS STOPPED WORKING!!", MessageType.RACE_OFF_LINE);
          this.openDialog();
        }
      });
    }
    if(category.name === "GENERAL") {
      this.raceService.getGeneralRanking().pipe(
        tap(r => this.setRankingToDisplay(category, r))
      ).subscribe();

    }
  }

  private setRankingToDisplay(category:Category, ranking:CrossingData[]) {
    if(ranking.length > 0) this.ranking = ranking;
    if(this.categories.length > 0) {
      for(let i:number =0; i<this.categories.length; i++) {
        if(this.categories[i].name === category.name) {
          this.selectedIndex = i;
          i = this.categories.length;
        }
      }
    }
  }



  public onOverallChange(isOverall:boolean):void {
    this.isOverall = isOverall;
    let index;
    if(isOverall === true){
      this.rankingCategories.push({name:"GENERAL", lapsToDo:this.categories[0].lapsToDo});
    }
    else{
      this.rankingCategories.find((c:Category,i:number) => {
        c.name === "GENERAL"
        index = i;
      }); 
      if(index != undefined) {
        this.rankingCategories.splice(index, 1);
        this.selectedIndex=0;
        this.onCategoryForRanking({name:this.categories[0].name, lapsToDo:this.categories[0].lapsToDo})
      }
    }
  }


  private exit(option:MessageType):void {
    if(option === MessageType.SIMPLE_MESSAGE) {
      this.messageService.setupMessageForDialog(
        "An error occurred while setting up the race you want to start.\nPlease try again later.",
        MessageType.SIMPLE_MESSAGE
      );
    } else {
      this.messageService.setupMessageForDialog("",  MessageType.DOWN);
    }  
    this.router.navigate(["/"]); 
  }


  /**
   * This method serialize the state of this page to cache it in the local storage when needed. 
   * @return the serialized state in form of string type
   */
  private prepareDataForCaching(): string {
    const data = JSON.stringify([
      {fileSelected:this.fileSelected},
      {manage:this.manage},
      {categories:this.categories},
      {sectionCategories:this.sectionCategories},
      {startedCategories:this.startedCategories},
      {rankingCategories:this.rankingCategories},
      {selectedIndexes:this.selectedIndexes},
      {selectedIndex:this.selectedIndex},
      {ranking:this.ranking},
      {file:this.filename},
      {status:this.raceService.performing},
      {overallEnabled:this.overallEnabled},
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
      this.fileSelected = cachedData[0].fileSelected;
      this.manage = cachedData[1].manage;
      this.categories = cachedData[2].categories,
      this.sectionCategories = cachedData[3].sectionCategories;
      this.startedCategories = cachedData[4].startedCategories;
      this.rankingCategories = cachedData[5].rankingCategories;
      this.selectedIndexes = cachedData[6].selectedIndexes;
      this.selectedIndex = cachedData[7].selectedIndex;
      this.ranking = cachedData[8].ranking;
      this.filename = cachedData[9].file;
      this.raceService.performing = cachedData[10].status;
      this.overallEnabled = cachedData[11].overallEnabled;
      this.isOverall = cachedData[12].isOverall;
    }
  }


  /**
   * This Method is called when the user decide both that the race is finished or cancel its execution.
   * if the race is finished, a service call server side endpoint that marks the race as performed.
   * From now on this race configuration can no longer be updated or executed.
   * @param performed boolean rue if the race is finished, false if it is canceled.
   */
  public onRacePerformed(performed:boolean): void {
    if(performed) {
      this.raceService.markRaceAsPerformed(this.filename).pipe(
        tap(blob => {
          if(blob) {
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = this.confService.getCurrentFileName();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.messageService.setupMessageForDialog({filename:this.filename}, MessageType.RACE_PERFORMED);
            this.manage = false;
            localStorage.removeItem('cache');
            localStorage.removeItem('cacheCategories');
            this.raceService.performing = false;
            this.router.navigate(['/']);
          }
          else {
            alert("Something was wrong downloading the race configuration, please try again later.");
          }          
        }),
        catchError(_=>{return of("ERROR")}),
      ).subscribe( res => {
          if(res === "ERROR"){
            this.raceService.performing = false;
            this.messageService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);
          }
        });
    } else {
        this.manage = false;
        const result:string = performed ? 'Completed' : 'Abort';
        localStorage.removeItem('cache');
        localStorage.removeItem('cacheCategories');
        console.log(result);
        this.raceService.performing = false;
        this.router.navigate(['/']);
    }
    
    localStorage.removeItem('cache');
  }




  private checkForOverallEnabled():boolean {
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


  
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messageService.getMessage();
    dialogConfig.position = {top:"0", right:"0"};
    this.dialog.open(OfficerDialogComponent, dialogConfig);
    this.messageService.reset();
  }

}
/*END of CLASS*/