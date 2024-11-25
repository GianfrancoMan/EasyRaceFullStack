import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, concat, of, tap } from 'rxjs';
import { Athlete } from '../../models/athlete.model';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-athlete-delete',
  templateUrl: './athlete-delete.component.html',
  styleUrl: './athlete-delete.component.scss'
})
export class AthleteDeleteComponent implements OnDestroy, OnInit{
  private configurationService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messageService:MessagesService = inject(MessagesService);
  private router:Router = inject(Router);
  private serverError:boolean = false;
  
  title:string = "Remove Athlete";
  titleUpload:string = "Press the button and select the race in which you want to remove an athlete";
  fileSelected:boolean  = false;
  athletes:Athlete[] = [];
  athleteToDelete!:Athlete;


  ngOnInit(): void {
    if(localStorage.getItem('cache')) {
      this.router.navigate(['/run']);
    }
      this.authService.clearFiles().pipe(
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      ).subscribe( response => {
        if(response === "ERROR") {
          this.configurationService.resetFileData()
          this.messageService.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);
        }
        if(response instanceof HttpErrorResponse) {
          this.configurationService.resetFileData()         
          if(response.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messageService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }
      });
      this.configurationService.resetFileData();
  }

  ngOnDestroy(): void {
    if(this.configurationService.getRawRaceFile() !== undefined) {
      this.configurationService.deleteTemporaryFile(this.configurationService.getCurrentFileName()).pipe(
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),        
      ).subscribe(res => {
        if(res instanceof HttpErrorResponse) {
          this.configurationService.resetFileData()         
          if(res.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messageService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }        
      });    
      this.configurationService.resetFileData();
    }
  }

  public onSelectedFile(value:boolean) {
    this.fileSelected = this.fileSelected = value;
    
    this.configurationService.getRaceAthletes().pipe(
      tap(res => {
        if(res !== undefined) {
          this.athletes = res;
          this.sortAthlete();
          if(this.athletes.length === 0) {
            this.messageService.setupMessageForDialog("It appears that there are no athletes registered for the selected race.", MessageType.SIMPLE_MESSAGE);
            this.router.navigate(["/"]) ;
          }
          console.log(this.athletes);
        }
      }),
      catchError( (error)=> {
        this.serverError = true;
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of(undefined)
      }),
    ).subscribe( r => {
      if(r === null) {
        this.messageService.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(["/"]) ;
      }
      if(r == undefined) {
        this.messageService.setupMessageForDialog("Something was wrong, please try again later.", MessageType.SIMPLE_MESSAGE);
        this.router.navigate(["/"]) ;
      }
      if(r instanceof HttpErrorResponse) {
        this.configurationService.resetFileData()         
        if(r.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messageService.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
  }

  
  public onSelectedAthlete(item:any) {
    this.athleteToDelete = <Athlete>item;
    console.log(item);
  }



  public onRemoveAthlete():void {
    if(confirm("Are you sure...\nDo you want remove this athlete from the race?")) {
      let id:number = this.athleteToDelete.id ?? -1;
      if(id !== -1) {
        const removeRequest = this.configurationService.removeAthleteFromRace(id).pipe(
          tap(
            blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = this.configurationService.getCurrentFileName();
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.messageService.setupMessageForDialog(this.athleteToDelete, MessageType.ATHLETE_REMOVED);
              this.router.navigate(["/"]);
            }),
            catchError( err => {
              const errorResolved = this.authService.loginExpiredHandler(err);
              if(errorResolved !== null) return of(errorResolved); else return of(new Blob([]));
            }),
        );

        const deleteRequest = this.configurationService.deleteTemporaryFile(this.configurationService.getCurrentFileName()).pipe(
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),        
        );

        concat(removeRequest, deleteRequest).subscribe( res => {
          if( (res instanceof Blob && res.size === 0)|| (res === "ERROR")) {
            this.messageService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(["/"]);
          }
          if(res instanceof HttpErrorResponse) {
            this.configurationService.resetFileData()         
            if(res.status === HttpStatusCode.Forbidden) {            
              localStorage.removeItem("jwtkn");
              this.router.navigate(['/auth']);
            } else {            
              this.messageService.setupMessageForDialog("", MessageType.DOWN);
              this.router.navigate(['/']);   
            }
          }
        });
      }      
    }
  }


  public goHome():void {
    this.configurationService.deleteTemporaryFile(this.configurationService.getCurrentFileName()).pipe(
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),        
    ).subscribe(res => {
      if(res instanceof HttpErrorResponse) {
        this.configurationService.resetFileData()         
        if(res.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messageService.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }        
    });  
    this.router.navigate(["/"]);
  }



  private sortAthlete() {
    this.athletes.sort((item1:Athlete, item2:Athlete)=> {    
      if(item1.surname > item2.surname) return 1;
      if(item1.surname < item2.surname) return -1;
      return 0;
    });
  }

}
