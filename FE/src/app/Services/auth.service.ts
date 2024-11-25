import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LoginResponse, UserLogin } from '../models/credentials.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http:HttpClient = inject(HttpClient);
  BASE_URL:string = `http://localhost:8080/auth`;
  logged:boolean = true;
  token:string = "";

  constructor() { }

  /**
   * Calls endpoint to subscribe the provided user
   * @param user Call endpoint that provide the user subscription.
   * @returns Observable<User>
   */
  public subscribeUser(user:User):Observable<User> {
    return this.http.post<User>(`${this.BASE_URL}/signup`, user);
  }

  
  public logUser(userLogin:UserLogin):Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, userLogin);
  }

  public loginExpiredHandler(error:any):HttpErrorResponse | null {
    if(error instanceof HttpErrorResponse) {
      let er:HttpErrorResponse = new HttpErrorResponse({error:error, status:error.status});
      return er
    }
    return null;      
  }
  

  /**
   * Clears useless temporary files.
   */
  public clearFiles() {
    return this.http.get(`${this.BASE_URL}/context_clr`);
  }
}
