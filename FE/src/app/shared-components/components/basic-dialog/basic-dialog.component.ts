import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Message } from '../../../models/message.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-basic-dialog',
  templateUrl: './basic-dialog.component.html',
  styleUrl: './basic-dialog.component.scss'
})
export class BasicDialogComponent {
  router:Router = inject(Router);
  data!:Message;
  constructor(private dialogRef: MatDialogRef<BasicDialogComponent>, @Inject(MAT_DIALOG_DATA)   data:any) {
    this.data = data;
  }

  public onClose() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}
