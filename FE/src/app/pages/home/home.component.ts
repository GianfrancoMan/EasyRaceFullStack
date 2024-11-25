
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavService } from '../../Services/nav.service';
import { MessagesService } from '../../Services/messages.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BasicDialogComponent } from '../../shared-components/components/basic-dialog/basic-dialog.component';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageType } from '../../models/message.model';
import { RaceService } from '../../Services/race.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit, OnDestroy {


  private confService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private router:Router = inject(Router);
  private messagesService:MessagesService = inject(MessagesService);

  dialog:MatDialog = inject(MatDialog);

  title:string = "Easy Race";


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
        this.confService.resetFileData()
        this.messagesService.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.confService.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messagesService.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
    this.confService.resetFileData();
    if(!(this.messagesService.getMessage().title === "" && this.messagesService.getMessage().messages.length === 0))
      this.openDialog();
  }

  
  ngOnDestroy(): void {
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
          } else {            
            this.messagesService.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }        
      });  
      this.confService.resetFileData();
    }
    
    this.messagesService.reset();
  }


  //open the success dialog
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messagesService.getMessage();
    this.dialog.open(BasicDialogComponent, dialogConfig);
    this.messagesService.reset();
  }
}
