import { inject, Injectable } from '@angular/core';
import { RaceData } from '../models/race-data.model';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Athlete } from '../models/athlete.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private rawRaceFile:File | undefined;
  private currentRaceName:string = "";
  private fileName:string = "";

  private http:HttpClient = inject(HttpClient);
  private BASE_URL:string = "http://localhost:8080/race";

  

  constructor() { }
  

  /**
   * save a new configuration of race.
   * CALLS THE ENDPOINT -> http://localhost8080/race
   * @param configuration RaceData  
   * @returns A File object which contains information about the race that will be useful
   *           for updating the configuration or when running the race.
   */
  public saveConfiguration(configuration:RaceData):Observable<Blob> {
    const body = {
      categories:configuration.categories,
      city:configuration.city,
      date:configuration.date,
      meeting:configuration.meeting,
      laps:configuration.laps,
      organizer:configuration.organizer,
      title:configuration.title,
      description:configuration.description !== "" ? configuration.description : null,
      federation:configuration.federation !== "" ? configuration.federation : null,
      specialty:configuration.specialty !== "" ? configuration.specialty : null,
      type:configuration.type !== "" ? configuration.type : null,
    }
    return this.http.post(this.BASE_URL, body, {responseType: "blob"});
  }


  /**
   * Delete temporary file created in the back-end when a new race configuration has been created.
   * CALLS THE ENDPOINT -> http://localhost8080/race/file/{file}
   * @param fileName:String 
   */
  public deleteTemporaryFile(file:string):Observable<any> {
    return this.http.delete(`${this.BASE_URL}/file/${file}`);
  }

  /**
   * Uploads the file containing information regarding the race and returns data useful for athlete registration.
   * CALLS THE ENDPOINT -> http://localhost8080/race/data-for-athlete
   * @param file the file to send.
   * @returns an Observable of type any
   */
  public getRaceDataForAthlete(file:File|undefined):Observable<any> {   
    if(file !== undefined) {
      const data: FormData = new FormData();
      data.append('file', file, file.name);
      console.log(file.name);
      return this.http.post(this.BASE_URL+'/data-for-athlete', data);
    }

    return of(undefined);
  }


  
  /**
   * Uploads the file containing information regarding the race and returns all registered athletes.
   * CALLS THE ENDPOINT -> http://localhost8080/race/lst-athl
   * @returns an Observable of type Athlete[] or an Observable of type undefined.
   */
  public getRaceAthletes():Observable<Athlete[] | undefined> {

    const file:File | undefined = this.getRawRaceFile();
    if(file !== undefined) {
      const data: FormData = new FormData();
      data.append('file', file, file.name);
      console.log(file.name);
      return this.http.post<Athlete[]>(this.BASE_URL+'/lst-athl', data);
    }

    return of(undefined);
  }


  /**
   * Calls the server to remove from the race configuration the athlete with the ID equal to the ID passed as parameter
   * and return the configuration with changes.
   * @param athleteId 
   * @returns an object of type Blob, basically the file that contains the changed race configuration.
   */
  public removeAthleteFromRace(athleteId:number):Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/excl-athl`, {responseType:"blob", params:{filename:this.getCurrentFileName(), athleteId:athleteId}});

  }


  
  /**
   * Uploads the latest selected configuration file.
   * @returns Observable of type RaceData or of type undefined
   */
  public uploadConfiguration() : Observable<boolean | undefined> {
    console.log('uploadFile:' + this.getCurrentFileName());
    const file:File | undefined = this.getRawRaceFile();
    if(file !== undefined) {
      const data: FormData = new FormData();
      data.append('file', file, file.name);
      console.log(file.name);
      return this.http.post<boolean>(`${this.BASE_URL}/upload`, data);
    }
    return of(undefined);
  }


  /**
   * Calls endpoint to retrieve data of the race configuration that can be changed.
   * ENDPOINT: http://localhost:8080/race/avlb-dt.
   * @returns a RaceData type or undefined.
   */
  public getDataAvailableForChanges():Observable<RaceData | undefined>  {
    const file = this.getRawRaceFile();
    if(file !== undefined) {
      console.log("service",this.getCurrentFileName());
      const filename = this.getCurrentFileName();
      return this.http.get<RaceData | undefined>(`${this.BASE_URL}/avlbl-dt`, {params:{filename:filename}});
      
    }
    return of(undefined);

  }



  /**
   * Retrieves the file that contains the race configuration with the user changes.
   * ENDPOINT: http://localhost:8080/race/updt-bsc.
   * @param changes The configuration data modified by the user;
   * @returns An object of type Blob(basically the file containing the configuration).
   */
  public updateCOnfiguration(changes:RaceData): Observable<Blob> {
    return this.http.put(`${this.BASE_URL}/updt-bsc`, changes, {responseType:"blob", params:{filename:this.getCurrentFileName()}})
  }



  /**
   * Calls endpoint to retrieve the categories from the race configuration.
   * ENDPOINT: http://localhost:8080/race/ctgrs.
   * @returns an array of type
   */
  public getRaceCategories():Observable<Category[] | undefined> {
    const file = this.getRawRaceFile();
    if(file !== undefined) {
      return this.http.get<Category[] | undefined>(`${this.BASE_URL}/ctgrs`, {params:{filename:this.getCurrentFileName()}});
    }

    return of(undefined);
  }


  /**
   * Calls endpoint that change the name of a category in the currently race configuration managed.
   * @param oldName 
   * @param newName 
   * @returns an object of type Category. 
   */
  public changeCategoryName(oldName:string, newName:string): Observable<Category> {
    if(this.getRawRaceFile() !== undefined) {
      let data:string[] = [];
      data.push(this.getCurrentFileName());
      data.push(oldName);
      data.push(newName);
      // const params = new HttpParams();
      // params.append('filename', this.getCurrentFileName());
      // params.append('oldName', oldName);
      // params.append('newName', newName);
      return this.http.put<Category>(`${this.BASE_URL}/chng/nm`, null, { params:{parameter:data}});
    } else {
      const category:Category = {name:"FILE_NOT_FOUND", lapsToDo:-1};
      return of(category);
    }
  }



  /**
   * Calls the endpoint to retrieve the race configuration from the server.
   * ENDPOINT: http://localhost:8080/race/get/cnf.
   * @returns a file that contains a serialized race configuration.
   */
  public getConfiguration(): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/get/cnf`, {responseType:"blob", params:{filename:this.getCurrentFileName()}});
  }



  public checkForPerformedConfiguration(fileParam:File):Observable<boolean | undefined> {
    const file:File | undefined = fileParam;
    if(file !== undefined) {
      const data: FormData = new FormData();
      data.append('file', file, file.name);
      console.log(file.name);
      return this.http.post<boolean>(`${this.BASE_URL}/pld-chck`, data);
    }
    return of(undefined);
  }



  /**
   * Set the ConfigurationService.rawRaceFile File instance and assigns the title
   * of the current race to the ConfigurationService.currentRaceName. 
   * @param file A File reference that contains information about the current race.
   */
  public setRawRaceFile(file:File):void {
    this.rawRaceFile  = file;
    this.fileName = file.name;
    this.currentRaceName =file.name.split('_')[1];
  }


  /**
   * Returns the file related to race we are managing
   * @returns the file if exists otherwise null
   */
  public getRawRaceFile(): File | undefined {
    return this.rawRaceFile ? this.rawRaceFile : undefined;
  }

  /**
   * 
   * @returns The title of current Race
   */
  public getCurrentRaceName(): string {
    return this.currentRaceName;
  }

  public getCurrentFileName():string {
    return this.fileName;
  }

  public resetFileData(): void {
    this.rawRaceFile = undefined;
    this.fileName = '';
    this.currentRaceName = '';
  }

}
