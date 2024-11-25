import { Component, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../Services/auth.service';
import { catchError, of, tap } from 'rxjs';
import { MessagesService } from '../../Services/messages.service';
import { MessageType } from '../../models/message.model';
import { Router } from '@angular/router';
import { LoginResponse, UserLogin } from '../../models/credentials.model';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrl: './authorization.component.scss'
})
export class AuthorizationComponent {
  auth:AuthService = inject(AuthService);
  message:MessagesService = inject(MessagesService);
  router:Router = inject(Router);

  currentUser!:User;
  loginResponse!:LoginResponse;

  displayLogin:boolean = true;

  public goToSignUp() {this.displayLogin = false;}

  public onUserEmitter(user:User):void {
    console.log(user);
    this.auth.subscribeUser(user).pipe(
      tap(res => {
        if(res) {
          this.displayLogin = true;
          this.currentUser = res;
          console.log(this.currentUser);
        }
        else {
          this.message.setupMessageForDialog("Something was wrong: user not retrieved.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(['/']);
        }
      }),
      catchError( _=> {
        return of("ERROR");
      }),
    ).subscribe( response => {
      if(response === "ERROR") {
        this.message.setupMessageForDialog("", MessageType.DOWN);
      }
    });
  }


  
  public onUserLoginEmitter(userLogin:UserLogin):void {
    const token:string | null = localStorage.getItem('jwtkn');
    if(token !== null) {
      this.router.navigate(['/']);
    }
    else {
      console.log(userLogin);
      this.auth.logUser(userLogin).pipe(
        tap(res => {
          if(res) {
            this.displayLogin = true;
            this.loginResponse = res;
            localStorage.removeItem('loggedUser');
            localStorage.setItem("jwtkn", res.token);
            console.log(this.loginResponse);
            this.router.navigate(['/']);
          }
          else {
            alert("Something was wrong: login failed.");
          }
        }),
        catchError( _=> {
          return of("ERROR");
        }),
      ).subscribe( response => {
        if(response === "ERROR") {
          alert("Something went wrong: incorrect email or password.");
        }
      });}
  }
}
