import { inject, Injectable } from '@angular/core';
import { Athlete } from '../models/athlete.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DataForRegistration } from '../models/data-for-registration.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class AthleteService {

  private http:HttpClient = inject(HttpClient);
  BASE_URL:string = "http://localhost:8080/athlete"

  constructor() { }


  /**
   * Retrieves a filtered athlete list based on their name and surname.
   * CALLS THE ENDPOINT -> http://localhost:8080/athlete/{filterName}/{filterSurname}
   * @param filterName
   * @param filterSurname 
   * @returns an Observable list of type Athlete object
   */
  public getFilteredAthletes(filterName:string, filterSurname:string):Observable<Athlete[]>{
    let url:string;
    //for now return mock athletes
    filterName = filterName.trim();
    filterSurname = filterSurname.trim();
    if(filterName === "") {
      url = `${this.BASE_URL}/_/${filterSurname}`;
    } else if (filterSurname === "") {
      url = `${this.BASE_URL}/${filterName}/_`;
    } else {
      url = `${this.BASE_URL}/${filterName}/${filterSurname}`;
    }
      
    return this.http.get<Athlete[]>(url);
  }

  /**
   * Upload a file related to race that we are managing.
   * CALLS THE ENDPOINT -> http://localhost:8080/athlete/register/upload
   * @param file
   * @returns Observable of type boolean, true if success otherwise false.
   */
  public sendFileForRegistration(file:File | undefined):Observable<boolean> {    
    if(file != undefined) {
      const data: FormData = new FormData();
      data.append('file', file, file.name);

      const url = `${this.BASE_URL}/register/upload`;
      
      return this.http.post<boolean>(url, data);
    }
    return of(false);
  }



  /**
   * Submit data to register an athlete for a race and retrieve the race configuration updated with
   * the athlete registration.
   * CALLS THE ENDPOINT -> http://localhost:8080/athlete/register/data
   * @param data the athlete's registration data
   * @returns an Observable of type Blob, basically the file that contains the race configuration.
   */
  public sendDataForRegistration(data:DataForRegistration, options:{observe:'response'}):Observable<HttpResponse<Blob>> {
    const url = `${this.BASE_URL}/register/data`;
    return this.http.post(url, data, {responseType: "blob", ...options});
  }

  public getAllAthleteByIds(ids:number[]): Observable<Athlete[]> {
    let url:string =`${this.BASE_URL}/partial`;
    return this.http.get<Athlete[]>(url, {params:{ids:ids}});
  }


  /**
   * Get the current race category of the athlete selected  from the user. 
   * @param filename the name of the file were the race configuration is stored.
   * @param id the unique id of the athlete to reach.
   * @returns The category of the selected athlete.
   */
  public getAthleteCategory(filename:string, id:number): Observable<Category> {
    return this.http.get<Category>(`${this.BASE_URL}/ctgr`, { params: { fileName: filename, athleteId: id } });
  } 


  
  /**
   * Updates race configuration chancing the current athlete category with the one selected  from the user. 
   * @param filename the name of the file were the race configuration is stored.
   * @param id the unique id of the athlete to reach.
   * @returns boolean true if the operation was successful otherwise false.
   */
  public updateAthleteRaceCategory(filename:string, id:number | undefined, category:Category):Observable<boolean | undefined> {
    if(id !== undefined){
      return this.http.post<boolean>(`${this.BASE_URL}/pdt-ctgr`, category, { params: { filename:filename, idAthlete:id } })
    }
    else return of(undefined);
  }

}
