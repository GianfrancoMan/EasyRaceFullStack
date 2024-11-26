import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ConfigurationService } from '../../../Services/configuration.service';
import { catchError, of, tap } from 'rxjs';
import { MessagesService } from '../../../Services/messages.service';
import { MessageType } from '../../../models/message.model';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
 
  private authService:AuthService = inject(AuthService);
  private configurationService:ConfigurationService = inject(ConfigurationService);
  private messages:MessagesService = inject(MessagesService);
  private router:Router = inject(Router);
  
  @Input() title:string ='Press the button and select the Race you are managing..';
  @Input() requirePerformed:boolean = false;
  @Output() selectedFile:EventEmitter<boolean> = new EventEmitter<boolean>();



  public onFileSelected(event: any):void {
    const file: File = event.target.files[0];
    this.configurationService.resetFileData();

    if (file && file.name.substring(file.name.length-3) === 'srr') {
      this.configurationService.setRawRaceFile(file);
      this.configurationService.checkForPerformedConfiguration(file).pipe(
        tap( res => {
          if(res!== undefined && res !== null) {
            if(this.requirePerformed === res) {
              this.selectedFile.emit(true);
            }
            else {
              this.configurationService.resetFileData();
              const message = res===true  
                ? "The race that the configuration you want to manage refers to is already running, so you cannot update this configuration or start the race it refers to."
                : "This race configuration cannot be used to display results because the race it refers to has not yet been run.";
  
                this.messages.setupMessageForDialog(message, MessageType.SIMPLE_MESSAGE);
                this.router.navigate(['/']);
            }}
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      ).subscribe( response => {
        if(response === "ERROR") {
          this.configurationService.resetFileData()
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);
        }
        if(response instanceof HttpErrorResponse) {
          this.configurationService.resetFileData()         
          if(response.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }
      });
    } else {
      alert("No File Selected.");
    }
  }

}
