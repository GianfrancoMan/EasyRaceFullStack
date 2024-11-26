import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../../Services/configuration.service';
import { MessagesService } from '../../Services/messages.service';
import { catchError, concat, of, tap, withLatestFrom } from 'rxjs';
import { RaceData } from '../../models/race-data.model';
import { MessageType } from '../../models/message.model';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-update-configuration',
  templateUrl: './update-configuration.component.html',
  styleUrl: './update-configuration.component.scss'
})
export class UpdateConfigurationComponent implements OnDestroy, OnInit {
  private confServices:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messages:MessagesService = inject(MessagesService);
  private router:Router = inject(Router);

  title:string = "Update Race";
  uploadTitle:string = "Press the button and choose the race configuration you want to modify";
  uploadView:boolean = true;
  data!:RaceData;

  
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
        this.confServices.resetFileData()
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.confServices.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
    this.confServices.resetFileData();
  }


  ngOnDestroy(): void {
    console.log("destroying")
    if(this.confServices.getRawRaceFile() !== undefined) {
      this.confServices.deleteTemporaryFile(this.confServices.getCurrentFileName()).subscribe();    
      this.confServices.resetFileData();
    }
  }


  public onSelectedFile(value:boolean): void {
    const uploadRequest = this.confServices.uploadConfiguration().pipe(

      tap( res => {
        if(res === true) {
          this.uploadView = !value;
        } 
        if(res === false) {
          this.messages.setupMessageForDialog("Something was wrong, file upload failed.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );

    const dataAvailableForChangesRequest = this.confServices.getDataAvailableForChanges().pipe(
      tap( data => {
        if(data) {
          this.data = data;
        }
        else {
          this.messages.setupMessageForDialog("Something was wrong, download configuration data failed .", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);          
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );

    concat(uploadRequest, dataAvailableForChangesRequest).subscribe(res => {
      if(res === "ERROR"){
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(["/"]);   
      }
      if(res instanceof HttpErrorResponse) {
        this.confServices.resetFileData()         
        if(res.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
  }


  /**
   * The value emitted from the RaceConfigurationComponent when the user confirm changes in race configuration.
   * @param data RaceDate.
   */
  public onRaceConfiguration(data:RaceData): void {
    data.id = this.data.id;
    this.data = data;
    this.updateConfiguration();
  }

  
  public updateConfiguration(): void {
    //TODO: sends configuration changes on the server side.

    const uploadRequest = this.confServices.uploadConfiguration().pipe(
      tap( res => {
        if(res === null || res === undefined) {
          this.messages.setupMessageForDialog("Something Was Wrong, Please Try Again Later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);}
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );


    const updateConfigurationRequest = this.confServices.updateCOnfiguration(this.data).pipe(
      tap(
        blob => {
          if(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.confServices.getCurrentFileName();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.messages.setupMessageForDialog("Well Done! The Configuration Update Operation Was Successful.", MessageType.SIMPLE_MESSAGE);
          }
          else {
            this.messages.setupMessageForDialog("Something Was Wrong, Please Try Again Later.", MessageType.SIMPLE_MESSAGE);           
          }          
          this.router.navigate(["/"]); 
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
    );


    const deleteFile = this.confServices.deleteTemporaryFile(this.confServices.getCurrentFileName()).pipe(
      tap( _=> console.log("file deleted")),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    )

    concat(uploadRequest, updateConfigurationRequest, deleteFile).subscribe(res => {
      if(res === "ERROR") {
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(["/"]);
      }
      if(res instanceof HttpErrorResponse) {       
        if(res.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }

    })
  }


}
