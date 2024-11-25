import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  http:HttpClient = inject(HttpClient);
  private BASE_URL:string = "http://loacalhost:8080";

  constructor() { }

  public getUser():Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/user`);
  }
}
