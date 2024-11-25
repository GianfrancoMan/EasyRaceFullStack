import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLogin } from '../../../models/credentials.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  @Output() userLoginEmitter:EventEmitter<UserLogin> = new EventEmitter<UserLogin>();
  dataForm!:FormGroup;

  ngOnInit() {
    this.dataForm = this.setForm();
  }

  public onSubmit():void {
    const loginUser:UserLogin = {
      email:this.dataForm.controls['email'].value,
      password:this.dataForm.controls['password'].value,    
    }    

    this.userLoginEmitter.emit(loginUser);
  }

  private setForm():FormGroup {
    return new FormGroup({
      email:new FormControl("", [Validators.required, Validators.email]),
      password:new FormControl("", [Validators.required, Validators.minLength(8)]),
    });
  }

}
