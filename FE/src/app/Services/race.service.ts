import { inject, Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { Category } from '../models/category.model';
import { CrossingData } from '../models/crossing-data.model';
import { Result } from '../models/result.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MessagesService } from './messages.service';
import { MessageType } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private http:HttpClient = inject(HttpClient);

  private configurationService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messages:MessagesService =inject(MessagesService);
  private router:Router = inject(Router);

  private BASE_URL:string ="http://localhost:8080/officer";

  performing:boolean = false;

  
  /**
   * Calls the endpoint http://localhost:8080/officer/upload which takes care of configuring the race to run.
   * @param options the observe:"response" option that allow to check the response
   * @returns 
   */
  public prepareRaceToRun(options:{observe:'response'}):Observable<any> {
    let file:File = this.configurationService.getRawRaceFile() ?? new File(["nothing"], "newfile");
    if(file.name !== "newfile") {      
      if(this.configurationService.getRawRaceFile() != undefined) {
        this.configurationService.deleteTemporaryFile(this.configurationService.getCurrentFileName()).pipe(
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),        
        ).subscribe(res => {
          if(res instanceof HttpErrorResponse) {
            this.configurationService.resetFileData();
            if(res.status === HttpStatusCode.Forbidden) {            
              localStorage.removeItem("jwtkn");
              this.router.navigate(['/auth']);
            }
          }
          if(res === "ERROR") {
            this.messages.setupMessageForDialog("Something Went Wrong:Please Try Again Later.", MessageType.SIMPLE_MESSAGE);
            this.router.navigate(['/']);
          }       
        });
      }
      const data: FormData = new FormData();
      data.append('file', file, file.name);
      console.log(file.name);
      return this.http.post(this.BASE_URL+'/upload', data, {withCredentials:true, ...options});
    }
    return of(new Response());
  }



  public startCategories(categories:Category[]): Observable<number> {
    let names:string[] = [];
    categories.forEach(c => names.push(c.name));
    let params = new HttpParams();
    params = params.append('categories', names.join('¢'));
    return this.http.post<number>(`${this.BASE_URL}/start`, null, {withCredentials:true, params:params});
  }


  public markPassage(raceNumber:number): Observable<CrossingData> {
    let params = new HttpParams();
    params = params.append('rn', raceNumber);

    return this.http.get<CrossingData>(`${this.BASE_URL}/crossing`, {withCredentials:true, params:params});    
  }


  public getCategoryRanking(categoryName:string):Observable<CrossingData[]> {
    let params = new HttpParams();
    params.append('catname', categoryName);

    return this.http.get<CrossingData[]>(`${this.BASE_URL}/category-ranking/${categoryName}`,{withCredentials:true, params:params});
  }

  public getGeneralRanking(): Observable<CrossingData[]> { 
    return this.http.get<CrossingData[]>(`${this.BASE_URL}/ranking`,{withCredentials:true});
  }


  /**
   * Calls the endpoint that marks and returns the race configuration as performed.
   * ENDPOINT: http://localhost:8080/officer/performed
   * @param filename the name of the file in which is stored the race configuration, on server side.
   * @returns a file with the race configuration marked as performed.
   */
  public markRaceAsPerformed(filename:string):Observable<Blob> {

    return this.http.get(`${this.BASE_URL}/performed`, {responseType:"blob", withCredentials:true, params:{"filename":filename}});
  }


  /**
   * Calls the delegate endpoint to retrieve a ranking of a race that has been run,
   * the ranking can be by category or absolute.
   * @param filename the name of the file that contain the race configuration
   * @param rankingName a string that can be both the name of a category or "OVERALL".
   * @returns an array of type Result interface.
   */
  public getRaceResults(filename:string, rankingName:string):Observable<Result[]> {
    console.log(filename, rankingName);
    return this.http.get<Result[]>(`${this.BASE_URL}/results`, {params:{filename, rankingName}})
  }
  

}
