import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NavService } from '../../../Services/nav.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../Services/user.service';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../../Services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BasicDialogComponent } from '../basic-dialog/basic-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessagesService } from '../../../Services/messages.service';
import { MessageType } from '../../../models/message.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit{
  //DECLARATIONS
  navService: NavService = inject(NavService);
  userService:UserService = inject(UserService);
  authService:AuthService = inject(AuthService);
  messages:MessagesService = inject(MessagesService);
  dialog:MatDialog = inject(MatDialog);

  @Input() title: string =  "";
  @Input() manage = false;
  @Output() racePerformedEmitter:EventEmitter<boolean> = new EventEmitter<boolean>();

  user!:User;

  //LIFE CLICLE METHODS
  constructor() {}

  ngOnInit(): void {
    const cashedUser = localStorage.getItem('loggedUser');
    if(cashedUser == undefined) {
      this.userService.getUser().pipe(
        tap(u=> {
          this.user = u;
          localStorage.setItem('loggedUser', JSON.stringify(this.user));
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      ).subscribe();
    } else {
      this.user = JSON.parse(cashedUser)
    }
  }



  //METHODS
  public onMarkComplete(value:boolean) {
    if(confirm("Do you confirm that this race is over?\nIn this case, its configuration will be locked and can no longer be managed."))
      this.racePerformedEmitter.emit(value);
  }



  public onCancelExit(value:boolean) {
    if(confirm("Do you want to exit and cancel this race?\nIn this case, all recorded performances will be considered void."))
      this.racePerformedEmitter.emit(value);
  }



  public onLogout() {
    if(confirm('Are you sure you want to log out?')){
      localStorage.removeItem('jwtkn');
    }
  }



  public prepareDialog() {
    this.messages.setupMessageForDialog(this.user, MessageType.ACCOUNT);
    this.openDialog();    
  }


  //open the account dialog
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messages.getMessage();
    dialogConfig.position = {top:"0", right:"5"};
    dialogConfig.disableClose = true;
    dialogConfig.height = '300';
    dialogConfig.width = '150'
    this.dialog.open(BasicDialogComponent, dialogConfig);
    this.messages.reset();
  }

}
