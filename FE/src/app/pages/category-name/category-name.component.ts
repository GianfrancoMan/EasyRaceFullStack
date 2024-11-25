import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Category } from '../../models/category.model';
import { ConfigurationService } from '../../Services/configuration.service';
import { catchError, concat, Observable, of, tap } from 'rxjs';
import { MessagesService } from '../../Services/messages.service';
import { Router } from '@angular/router';
import { MessageType } from '../../models/message.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-category-name',
  templateUrl: './category-name.component.html',
  styleUrl: './category-name.component.scss',
})
export class CategoryNameComponent implements OnInit, OnDestroy {
  private confService:ConfigurationService = inject(ConfigurationService);
  private authService:AuthService = inject(AuthService);
  private messages:MessagesService = inject(MessagesService);
  private router:Router = inject(Router);

  categoryNameForm!:FormGroup;

  title:string = 'Change Category Name';
  type:string = 'category';
  uploadView:boolean = true;
  uploadTitle:string = 'Select a race configuration to change category names.';
  categories:Category[] = [];
  currentCategory!:Category;
  newestCategory:string = '';



  ngOnInit() {
    if(localStorage.getItem('cache')) {
      this.router.navigate(['/run']);
    }
    this.authService.clearFiles().pipe(
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    ).subscribe( response => {
      if(response === "ERROR") {
        this.confService.resetFileData()
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        this.confService.resetFileData()         
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    });
    this.confService.resetFileData();
    this.createForm();
  }



  ngOnDestroy(): void {
    console.log("destroying")
    if(this.confService.getRawRaceFile() !== undefined) {
      this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),        
      ).subscribe(res => {
        if(res instanceof HttpErrorResponse) {
          this.confService.resetFileData()         
          if(res.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }        
      });      
      this.confService.resetFileData();
    }
  }



  //when refreshing go to home page and come back.
  @HostListener('window:beforeunload') goToPage() {
    this.router.navigate(['/']);
  }
  

  //value of 'selected' variable come from child component emitter
  public onSelectedFile(value:boolean):void  {
    this.uploadView = !value;
    
    const uploadRequest = this.upload();

    const categoriesRequest = this.confService.getRaceCategories().pipe(
      tap(res => {
        console.log(res);
        if(res) {
          this.categories = res;
          this.sortCategory();
        } else {
          this.messages.setupMessageForDialog("Something Was Wrong Trying To Retrieve The Categories.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(['/']);
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );

    const deleteFileRequest = this.deleteFile();
    
    concat(uploadRequest, categoriesRequest, deleteFileRequest).subscribe( res => {
      if(res === "ERROR") {
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);        
      }
      if(res instanceof HttpErrorResponse) {
        this.confService.resetFileData()         
        if(res.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      }
    }
    );
  }



  public onItemSelected(item:any): void {
    this.currentCategory = <Category>item;
    if(this.currentCategory != undefined){
      this.categoryNameForm.get("newest")?.setValue(this.currentCategory.name);
    }
  }



  public onSaveNewName(): void {
    let fail:boolean = false;
    let newCategory:string = this.categoryNameForm.get("newest")?.value;
    if(newCategory.replace(/\s/g, '').length > 0 && !(this.categoryAlreadyExists(newCategory))) {
      newCategory = newCategory.trim().toUpperCase();
     
      const uploadRequest = this.upload();

      const changeCategoryNameRequest = this.confService.changeCategoryName(this.currentCategory.name, newCategory).pipe(
        tap( res => {            
          console.log('request: ' + res.name);
          this.newestCategory = res.name;          
        }),
        catchError( (error)=> {
          const errorResolved = this.authService.loginExpiredHandler(error);
          if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
        }),
      )

      const configurationRequest = 
        this.confService.getConfiguration().pipe(
          tap( blob => {
            if(blob) {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = this.confService.getCurrentFileName();
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              this.messages.setupMessageForDialog({oldName:this.currentCategory.name, newName:this.newestCategory}, MessageType.CHANGE_CATEGORY_NAME);
            }
            else {
              this.messages.setupMessageForDialog("Something Was Wrong Downloading The Race Configuration", MessageType.SIMPLE_MESSAGE);
            }

            this.router.navigate(['/']);
          }),
          catchError( (error)=> {
            const errorResolved = this.authService.loginExpiredHandler(error);
            if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
          }),
        );

      concat(uploadRequest, changeCategoryNameRequest, configurationRequest).subscribe(res => {
        if(res === "ERROR") {
          this.messages.setupMessageForDialog("Something went wrong, Please try again later", MessageType.DOWN);
          this.router.navigate(['/']);    
        }
        if(res instanceof HttpErrorResponse) {
          this.confService.resetFileData()         
          if(res.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        }
        
      });

      console.log(newCategory);
    }
    else{
      this.categoryNameForm.get("newest")?.setValue('');
      alert("Ops! The category you entered already exists\nPlease enter another one.")
    }
  }



  onCancelCategoryName() {
    this.router.navigate(['/']);
  }



  private createForm() {
    this.categoryNameForm = new FormGroup({
      newest: new FormControl({value : "", disabled : false}, [Validators.required]),
    });
  }



  private upload():Observable<any> {
    return this.confService.uploadConfiguration().pipe(

      tap( res => {
        if(res === false) {
          this.messages.setupMessageForDialog("Something was wrong, file upload failed.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);
        }
        console.log(res);
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );
  }



  private deleteFile(): Observable<any> {
    return this.confService.deleteTemporaryFile(this.confService.getCurrentFileName()).pipe(
      tap( _=> console.log("deleted file")),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      }),
    );
  }



  private sortCategory() {
    this.categories.sort((item1:Category, item2:Category)=> {    
      if(item1.name > item2.name) return 1;
      if(item1.name < item2.name) return -1;
      return 0;
    });
  }

  private categoryAlreadyExists(category:string):boolean {
    if(this.categories && this.categories.length > 0) {
     
      if(this.categories.find( c=> c.name === category)) {
        return true;
      }
      return false; 
    }
    return false;
  }

}
