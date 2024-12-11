import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrl: './subscription.component.scss',
    standalone: false
})
export class SubscriptionComponent implements OnInit{

  @Output() userEmitter:EventEmitter<User> = new EventEmitter<User>();
  dataForm!:FormGroup;

  ngOnInit() {
    this.dataForm = this.setForm();
  }

  public onSubmit():void {
    const user = {
      name:this.dataForm.controls['name'].value,
      surname:this.dataForm.controls['surname'].value,
      email:this.dataForm.controls['email'].value,
      password:this.dataForm.controls['password'].value,    
    }    

    this.userEmitter.emit(user);
  }

  private setForm():FormGroup {
    return new FormGroup({
      name:new FormControl("", [Validators.required, Validators.minLength(2)]),
      surname:new FormControl("", [Validators.required, Validators.minLength(2)]),
      email:new FormControl("", [Validators.required, Validators.email]),
      password:new FormControl("", [Validators.required, Validators.minLength(8)]),
    });
  }

}
