import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Message } from '../../../models/message.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-officer-dialog',
    templateUrl: './officer-dialog.component.html',
    styleUrl: './officer-dialog.component.scss',
    standalone: false
})
export class OfficerDialogComponent {
  router:Router = inject(Router);
  data!:Message;
  constructor(private dialogRef: MatDialogRef<OfficerDialogComponent>, @Inject(MAT_DIALOG_DATA)   data:any) {
    this.data = data;
  }
}
