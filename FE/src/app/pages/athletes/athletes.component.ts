import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';

@Component({
  selector: 'app-athletes',
  templateUrl: './athletes.component.html',
  styleUrl: './athletes.component.scss'
})
export class AthletesComponent implements OnDestroy, OnInit {
  private confService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messages:MessagesService = inject(MessagesService)
  private router:Router = inject(Router);
  title:string = "Add Athletes";


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
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.confService.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
      this.confService.resetFileData();
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
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }        
      });     
      this.confService.resetFileData();
    }
  }

}
