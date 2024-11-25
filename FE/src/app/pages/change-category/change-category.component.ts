import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Athlete } from '../../models/athlete.model';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, concat, of, tap } from 'rxjs';
import { Router, RouterEvent } from '@angular/router';
import { Category } from '../../models/category.model';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { AthleteService } from '../../Services/athlete.service';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-change-category',
  templateUrl: './change-category.component.html',
  styleUrl: './change-category.component.scss'
})
export class ChangeCategoryComponent implements OnDestroy, OnInit {
  private router:Router = inject(Router);
  private confService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messages:MessagesService = inject(MessagesService);
  private athleteService:AthleteService = inject(AthleteService);

  uploadView = true;
  title:string = "Change Category";
  uploadTitle:string = "Select the race configuration in which the athlete whose category we want to change is registered.";
  athletes:Athlete[] = [];
  categories:Category[] = [];
  selectedAthlete!:Athlete;
  currentCategory!:Category;
  newestCategory!:Category;


  
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
    console.log("destroying")
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


  //when refreshing go to home page and come back.
  @HostListener('window:beforeunload') goToPage() {
    this.router.navigate(['/']);
  }

  /**
   * If the value of the 'upload' param is true 
   * @param upload
   */
  public onSelectedFile(value:boolean): void {
    const athletesRequest = this.confService.getRaceAthletes().pipe(
      tap(res => {
        if(res !== undefined && res.length > 0) {
          this.athletes = res;
          this.sortAthlete();
          this.uploadView = false;
          console.log(this.athletes);
        } else {
          this.messages.setupMessageForDialog("Something was wrong retrieving athletes", MessageType.SIMPLE_MESSAGE);
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );

  const categoriesRequest = this.confService.getRaceCategories().pipe(
    tap(res => {
      if(res !== undefined && res.length > 0) {
        this.categories = res;
        console.log(this.categories);
      } else {
        this.messages.setupMessageForDialog("Something was wrong retrieving categories", MessageType.SIMPLE_MESSAGE);
        this.router.navigate(['/']);
      }
    }),
    catchError( (error)=> {
      const errorResolved = this.authService.loginExpiredHandler(error);
      if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
    }),
  );

  const deleteRequest = this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
    tap( res => {
      if(res === true)
          console.log('File Deleted');
    }),
    catchError( (error)=> {
      const errorResolved = this.authService.loginExpiredHandler(error);
      if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
    }),
  )

    concat(athletesRequest, categoriesRequest, deleteRequest).subscribe(res => {
      if(res === "ERROR"){
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
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
  }



  public onSelectedAthlete(item:any):void {  
    this.selectedAthlete = <Athlete>item;
    console.log(this.selectedAthlete);
    if(this.selectedAthlete.id) {
      const uploadRequest = this.confService.uploadConfiguration().pipe(
        tap(res=>{
          if(!res) this.messages.setupMessageForDialog("Something was wrong retrieving categories", MessageType.SIMPLE_MESSAGE);
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      );


      const athleteCategoryRequest = this.athleteService.getAthleteCategory(this.confService.getCurrentFileName(), this.selectedAthlete.id).pipe(
        tap(res => {
          if(res && res.name !== 'not_found') {
            this.currentCategory = res;
            console.log(this.currentCategory);
          }
          else this.messages.setupMessageForDialog("Something was wrong retrieving the athlete category", MessageType.SIMPLE_MESSAGE);
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      );


      const deleteFileRequest = this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
        tap(res => console.log("file deleted")),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      )


      concat(uploadRequest, athleteCategoryRequest, deleteFileRequest).subscribe( res => {
        if(res === "ERROR") {
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);
        }
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
      })

    }
    else {
      this.messages.setupMessageForDialog("Something was wrong retrieving categories", MessageType.SIMPLE_MESSAGE);
      this.router.navigate(['/']);
    }
  }


  public onCategorySelected(category:Category) {
    console.log("Selected Category:"  + category.name);
    if(category){
      this.newestCategory = category;

      const uploadRequest =
        this.confService.uploadConfiguration().pipe(
          tap(res=>{
            if(!res) {
              this.messages.setupMessageForDialog("Something Was Wrong Selecting a New Category for the Athlete.", MessageType.SIMPLE_MESSAGE);
              this.router.navigate(['/']);
            }
          }),
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),
        );

      const updateCategoryRequest = 
        this.athleteService.updateAthleteRaceCategory(this.confService.getCurrentFileName(), this.selectedAthlete.id, category).pipe(
          tap( res => {
            console.log("updateCategoryRequest passed:" + res);
            if(res === null) {
              this.messages.setupMessageForDialog("Something was wrong changing the athlete category, Please try again later.", MessageType.SIMPLE_MESSAGE);
              this.router.navigate(['/']);
            }
            if(res === undefined) {
              this.messages.setupMessageForDialog("Something was wrong trying to reach the target athlete, Please try again later.", MessageType.SIMPLE_MESSAGE);
              this.router.navigate(['/']);
            }
          }),
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),
        );

      const configurationRequest = 
        this.confService.getConfiguration().pipe(
          tap( blob => {
            if(blob) {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = this.confService.getCurrentFileName();
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.messages.setupMessageForDialog({
                name:`${this.selectedAthlete.name} ${this.selectedAthlete.surname}`,
                id: this.selectedAthlete.id,
                previous:this.currentCategory,
                next:this.newestCategory,
              }, MessageType.UPDATE_CATEGORY);
            }
            else {
              this.messages.setupMessageForDialog("Something Was Wrong Downloading The Race Configuration", MessageType.SIMPLE_MESSAGE);
            }

            this.router.navigate(['/']);
          }),
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),
        );

        const deleteFileRequest = this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
          tap(res => console.log("file deleted")),
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),
        )


        concat(uploadRequest, updateCategoryRequest, configurationRequest, deleteFileRequest).subscribe( res => {
          if(res === "ERROR") {
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);
          }
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
        })

    }
    else {
      this.messages.setupMessageForDialog("Something Was Wrong Selecting a New Category for the Athlete.", MessageType.SIMPLE_MESSAGE);
      this.router.navigate(['/']);
    }
  }



  private sortAthlete() {
    this.athletes.sort((item1:Athlete, item2:Athlete)=> {    
      if(item1.surname > item2.surname) return 1;
      if(item1.surname < item2.surname) return -1;
      return 0;
    });
  }
}
