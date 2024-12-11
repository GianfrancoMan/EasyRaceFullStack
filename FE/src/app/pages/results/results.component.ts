import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, concat, Observable, of, tap } from 'rxjs';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { Router } from '@angular/router';
import { Category } from '../../models/category.model';
import { RaceService } from '../../Services/race.service';
import { Result } from '../../models/result.model';
import { PdfCreatorService } from '../../Services/pdf-creator.service';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrl: './results.component.scss',
    standalone: false
})
export class ResultsComponent implements OnInit,OnDestroy{

  private confService:ConfigurationService = inject(ConfigurationService);
  private raceService:RaceService = inject(RaceService);
  private authService:AuthService =inject(AuthService);
  private messages:MessagesService = inject(MessagesService);
  private pdfCreator:PdfCreatorService = inject(PdfCreatorService);
  private router:Router = inject(Router);

  title:string = 'Race Results';
  titleUpload:string = "Press the button and select the race you want to see the results of"
  fileSelected:boolean = false;
  showList:boolean = true;
  raceTitle:string = "";
  categories!:Category[];
  ranking:Result[] = [];
  filename:string = "";
  overallAvailable:boolean = false;
  overallSelected = false;


  
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
          this.confService.resetFileData();
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

  public onUpload(value:boolean): void {
    this.fileSelected = value;

    const uploadRequest = this.utilUploadRequest();

    const categoriesRequest = this.confService.getRaceCategories().pipe(
      tap( raceCategories => {
        if(raceCategories !== undefined) {
          this.overallAvailable = true;
          this.categories = raceCategories;
          this.checkForOverall();
          this.filename = this.confService.getCurrentFileName();
        }
        else {
          this.messages.setupMessageForDialog("Something was wrong, Please try again later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(['/']);
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );

    concat(uploadRequest, categoriesRequest).subscribe( response => {
      if(response === "ERROR") {
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
  }


  public showRanking(rankingName:string) {
    this.ranking = [];
    if(rankingName === "OVERALL")
        this.overallSelected = true;

    const uploadRequest = this.utilUploadRequest();

    const rankingRequest = this.raceService.getRaceResults(this.filename, rankingName).pipe(
      tap( rank => {
        if(rank.length > 0) {
          if(rankingName) {
            this.ranking = rank;
            this.showList = false;
          } else {
            this.messages.setupMessageForDialog("Something Was Wrong Retrieving The Ranking", MessageType.SIMPLE_MESSAGE);
            this.router.navigate(['/']);
          }
        } else alert("even though the selected category is valid for this race,\nit seems that there are no athletes registered with it.")
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    )

    concat(uploadRequest, rankingRequest).subscribe( res => {
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



  public onBack() {
    this.overallSelected = false;
    this.ranking = [];
    this.showList = true;
  }


  public createPdf() {
    if(this.ranking.length > 0)
      this.pdfCreator.setupPdfCreator(this.raceTitle, this.ranking, this.overallSelected );
    else
      alert("The pdf file for this category is not available,\nbecause there are no athletes for this category.");
  }


  private utilUploadRequest() {
    return this.confService.uploadConfiguration().pipe(
      tap( res => {
        if(res === undefined) {
          this.messages.setupMessageForDialog("Something was wrong, Please try again later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(['/']);
        } else {
          const titleArr = this.confService.getCurrentFileName().split('_');
          this.raceTitle = titleArr[1];
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );
  }

  private checkForOverall() {
    if(this.categories.length > 0) {
      let lapsToDo = this.categories[0].lapsToDo;
      for(let i:number = 1; i < this.categories.length; i++) {
        if(this.categories[i].lapsToDo !== lapsToDo) {
          this.overallAvailable = false;
          i = this.categories.length;
        }
      }
    }
  }
}
