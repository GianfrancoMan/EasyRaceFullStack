import { inject, Injectable, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavService {  

  constructor() { }

  public isLoggedIn(): boolean {
    const token = localStorage.getItem("jwtkn");
    if(token !== null) {
      return true;
    }
    return false;
  }
 }
