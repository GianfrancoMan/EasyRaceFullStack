import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RaceData } from '../../models/race-data.model';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, concat, Observable, of, tap } from 'rxjs';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-new-race',
  templateUrl: './new-race.component.html',
  styleUrl: './new-race.component.scss'
})
export class NewRaceComponent implements OnDestroy, OnInit {
  router:Router = inject(Router);
  configurationService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  messagesService:MessagesService = inject(MessagesService);

  
  title:string = "New Race";
  raceData!:RaceData;


  
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
        this.messagesService.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.configurationService.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messagesService.setupMessageForDialog("", MessageType.DOWN);
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
            this.messagesService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }        
      }); 
      this.configurationService.resetFileData();
    }
  }

  public onRaceConfiguration(raceDataConfiguration:RaceData) {
    alert("Take care of the file you are about to download, it will be essential for the subsequent configuration operations of the race, such as registering athletes for the race, to modify or delete an existing configuration and obviously for the execution phase of the race.\nI recommend that you save it in a dedicated folder, so that you can easily find it when required.")
    this.raceData = raceDataConfiguration;
    const newRaceRequest = this.configurationService.saveConfiguration(this.raceData).pipe(
      tap(
        blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `race_${this.raceData.title}_${this.raceData.date.getFullYear()}.srr`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url); 
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) 
            return of(errorResolved)
            else
              return of("ERROR")
        })
    );
    
    const deleteFileRequest= this.configurationService.deleteTemporaryFile(`race_${this.raceData.title}_${this.raceData.date.getFullYear()}.srr`).pipe(
      tap( _=> console.log("deleted file")),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );
    
    concat(newRaceRequest, deleteFileRequest).pipe(
      catchError(err => {
        return of("ERROR");
      }),
    ).subscribe(
      resp=> {
        if(resp !== "ERROR" && !(resp instanceof HttpErrorResponse)){
          this.messagesService.setupMessageForDialog(raceDataConfiguration, MessageType.RACE_CONFIGURATION);          
          this.router.navigate(["/"]);
        }
        if(resp==="ERROR"){
          this.messagesService.setupMessageForDialog("Something Went Wrong, Try Again Later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);
        }
        if(resp instanceof HttpErrorResponse) {
          this.configurationService.resetFileData()         
          if(resp.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messagesService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }     
        }
      },
    );
  }

}
