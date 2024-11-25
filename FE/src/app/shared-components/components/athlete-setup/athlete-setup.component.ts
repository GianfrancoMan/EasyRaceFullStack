import { Component, OnInit, inject } from '@angular/core';
import { ConfigurationService } from '../../../Services/configuration.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Athlete } from '../../../models/athlete.model';
import { AthleteService } from '../../../Services/athlete.service';
import { RaceService } from '../../../Services/race.service';
import { formatDate } from '@angular/common';
import { Category } from '../../../models/category.model';
import { catchError, concat, of, tap } from 'rxjs';
import { DataForRegistration } from '../../../models/data-for-registration.model';
import { Router } from '@angular/router';
import { MessagesService } from '../../../Services/messages.service';
import { MessageType } from '../../../models/message.model';
import { AuthService } from '../../../Services/auth.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { BasicDialogComponent } from '../basic-dialog/basic-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-athlete-setup',
  templateUrl: './athlete-setup.component.html',
  styleUrl: './athlete-setup.component.scss'
})
export class AthleteSetupComponent implements OnInit{

  configurationService:ConfigurationService = inject(ConfigurationService);
  messages:MessagesService = inject(MessagesService);
  authService:AuthService = inject(AuthService);
  athleteService:AthleteService = inject(AthleteService);
  raceService:RaceService = inject(RaceService);
  router:Router = inject(Router);
  dialog:MatDialog = inject(MatDialog);
  
  messagesService: MessagesService = inject(MessagesService);

  title:string = "Press the button and select the race in which you want to register athletes."
  athletes!: Athlete[];
  athlete!:Athlete;
  categories:Category[] = [];
  customizedRaceNumbers:number[] = [];
  status:boolean = false;
  selectedRace: boolean = false;
  disabledLaps:boolean = true;
  boldStyle:boolean = false;
  autoFilled:boolean = false;
  currentTime:number = Date.now();
  latestTime:number = Date.now();
  athleteName:string = "";
  athleteSurname:string = "";
  raceTitle:string = "";
  raceNumber:number = 0;
  dataForRegistration:DataForRegistration;
  dataRegistrationHeader:String = "";
  fileToSendName:string = "";

  constructor() {
    this.athletes  = [];
    this.categories = [];
    this.selectedRace  = false;
    this.disabledLaps = true;
    this.boldStyle = false;
    this.autoFilled = false;
    this.currentTime = Date.now();
    this.latestTime = Date.now();
    this.athleteName = "";
    this.athleteSurname = "";
    this.raceNumber = 0;
    this.dataForRegistration = {
      athletes: [],
      categories: [],
      persistenceOperations: [],
      raceNumbers: [],
      raceNumbersAutoAssign: [],
      fileName: ""
    };
  }

  formAthleteData!:FormGroup;

  ngOnInit() {
    this.createForm();
  }




  /**
   * Select the file related to the race we are managing and send it to the
   * configuration service where it will be used for the management of the race.
   * @param event
   */
  public onUpload(selected:boolean):void {
    this.selectedRace = selected;

    const dataForAthleteRequest = this.configurationService.getRaceDataForAthlete(this.configurationService.getRawRaceFile()).pipe( 
      tap(dfa => {
        this.status = dfa.performed;
        if(dfa !== undefined) {
          this.raceTitle = dfa.raceTitle;
          this.categories = dfa.categories;
          this.customizedRaceNumbers = dfa.customizedNumberAssigned;
          this.raceNumber = dfa.raceNumber;
          this.formAthleteData?.get("raceNumber")?.setValue(this.raceNumber);
        } else {
          this.messagesService.setupMessageForDialog("Something Went Wrong, Please try again later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);
        }
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      })
    );

    concat(dataForAthleteRequest).subscribe(
      resp=> {
        console.log(resp);
        if(resp instanceof HttpErrorResponse) {
          if(resp.status === HttpStatusCode.Forbidden) {            
            localStorage.removeItem("jwtkn");
            this.router.navigate(['/auth']);
          } else {            
            this.messages.setupMessageForDialog("", MessageType.DOWN);
            this.router.navigate(['/']);   
          }
        };
        if(resp==="ERROR") {
          this.messagesService.setupMessageForDialog("Something Went Wrong, Try Again Later.", MessageType.SIMPLE_MESSAGE);
          this.router.navigate(["/"]);
        }
      },
    );
  }


  /**
   * Takes the value entered by the user in the athlete's "name" field
   * and assigns it to the "athleteName" variable but only if at least
   * one second has passed between one typing and the other, in order to
   * limit requests to the backend.
   */
  public onInputName(): void {
    let valueTyped:string = this.formAthleteData?.value.name;

    //To limit the number of the requests.
    if(this.timeLimit()) return;

    this.athleteName = valueTyped;
    if(this.athleteName !== "")this.callForAthlete(); 
  }


  /**
   * Takes the value entered by the user in the athlete's "surname" field
   * and assigns it to the "athleteSurname" variable but only if at least
   * one second has passed between one typing and the other, in order to
   * limit requests to the backend.
   */
  public onInputSurname(): void {
    let valueTyped:string = this.formAthleteData?.value.surname;

    //To limit the number of the requests.
    if(this.timeLimit()) return;

    this.athleteSurname = valueTyped;
    if(this.athleteSurname !== "")this.callForAthlete(); 
  }


  /**
   * Calls service method to get a list of athlete filtered based on partial values of the  athlete name and surname
   */
  private callForAthlete(): void {
    this.athleteService.getFilteredAthletes(this.athleteName, this.athleteSurname).pipe(
      tap(filtered => {
        this.athletes = filtered;
        this.athleteName = "";
        this.athleteSurname = "";
      }),
      catchError( (error)=> {
        const errorResolved = this.authService.loginExpiredHandler(error);
        if(errorResolved !== null) return of(errorResolved); else return of("ERROR")
      })
    ).subscribe( response => {
      if(response === "ERROR") {
        this.messages.setupMessageForDialog("", MessageType.DOWN);
        this.router.navigate(['/']);
      }
      if(response instanceof HttpErrorResponse) {
        if(response.status === HttpStatusCode.Forbidden) {            
          localStorage.removeItem("jwtkn");
          this.router.navigate(['/auth']);
        } else {            
          this.messages.setupMessageForDialog("", MessageType.DOWN);
          this.router.navigate(['/']);   
        }
      };
    });
  }


  //Delays the time between one request for filtered athletes and another by one second
  private timeLimit():boolean {
    let value:boolean = false;
    
    //To limit the number of the requests.
    this.currentTime = Date.now(); 

    if(this.currentTime - this.latestTime < 1000)
      value =true;
    else
     this.latestTime = this.currentTime;

    return value;
  }


  /**
   * When the user selects the category the laps to run are automatically assigned
   * based on the race configuration
   * @param value the category selected
   */
  public onClickCategory(value: string): void {
    let selectedCategory:string = this.formAthleteData.value.category;
    if(selectedCategory) {
      for(let i = 0; i < this.categories.length; i ++)
        if(this.categories[i].name === selectedCategory)
          this.formAthleteData?.get("lapsNumber")?.setValue(this.categories[i].lapsToDo+"");
    }
  }



  /**
   * Whenever the race number box is unchecked, race number validators
   * are created to only accept numbers between 1 and 99 which is the
   * number range reserved to be assigned directly by the organizer.
   * Other side when it is checked raceNumber field is disabled and 
   * and the race number for the athlete is latest race number available
   * provided by the RaceService
   */
  public onClickBoxNumber() {
    if(this.disabledLaps === true) {
      this.formAthleteData?.get("raceNumber")?.addValidators([Validators.min(1), Validators.max(99)]);
      this.formAthleteData?.get("raceNumber")?.setValue(1);
      this.formAthleteData?.get("raceNumber")?.enable();
      this.formAthleteData?.get("raceNumber")?.updateValueAndValidity({onlySelf:true});
    } else {
      this.formAthleteData?.get("raceNumber")?.removeValidators([Validators.min(1), Validators.max(99)]);
      this.formAthleteData?.get("raceNumber")?.setValue(this.raceNumber);
      this.formAthleteData?.get("raceNumber")?.disable();
      this.formAthleteData?.get("raceNumber")?.updateValueAndValidity({onlySelf:true, emitEvent:false});
    }
    this.disabledLaps = !this.disabledLaps;
    
  }



  
  /**
   * When the user selects an Athlete, the data of that athlete will be displayed 
   * in the formAthleteData.
   */
  public onClickAthlete(item:any) {
    const athlete:Athlete = <Athlete> item;
    if(this.dataForRegistration.athletes.length > 0) {
      if(this.dataForRegistration.athletes.find(a => a.id === athlete.id)) {
        alert("This Athlete is already in this Registrations List of this Race");
        return;
      }
    }
    this.athlete = athlete;
    this.athletes = [];
    this.formAthleteData.setValue({ 
      name : athlete.name, 
      surname : athlete.surname,
      birthday :formatDate(athlete.birthday, "yyyy-MM-dd", "en"),
      cityOfBirth: athlete.cityOfBirth,
      team: athlete.team,
      lapsNumber: null,
      category: "",
      raceNumber:this.raceNumber,
      checkRaceNumber: true,
    });
    this.formAthleteData?.get("raceNumber")?.disable();
    this.disabledLaps = true;

    this.boldStyle = true;    
    this.enableAutoFilled(true);
  }


  /**
   * Disables fields in the athlete form and set autoFilled value to true.
   * By the autoFilled value we know if the athlete that we are registering
   * has been  retrieved from the DB or if it is a new athlete that needs
   * to be stored for the first time.
   */
  private enableAutoFilled(enable:boolean): void{
    if(enable === true) {
      this.formAthleteData?.get("name")?.disable();
      this.formAthleteData?.get("surname")?.disable();
      this.formAthleteData?.get("birthday")?.disable();
      this.formAthleteData?.get("cityOfBirth")?.disable();
    } else {
      this.formAthleteData?.get("name")?.enable();
      this.formAthleteData?.get("surname")?.enable();
      this.formAthleteData?.get("birthday")?.enable();
      this.formAthleteData?.get("cityOfBirth")?.enable();
    }
    this.autoFilled = enable;
  }



  /**
   * Resets the data of the athlete typed
   */
  onResetAthleteData() {    
    this.formAthleteData.setValue({ 
    name : "", 
    surname : "",
    birthday :"",
    cityOfBirth: "",
    team: "",
    lapsNumber: null,
    category: "",
    raceNumber:this.raceNumber,
    checkRaceNumber: true,
   });   
   this.formAthleteData?.get("raceNumber")?.disable();
   this.disabledLaps = true;
   
   this.boldStyle = false;
   this.enableAutoFilled(false);

   this.makeUntouched();
  }

  /**
   * Cancel all the registrations entered
   */
  public onCancel() {
    if(confirm("If you exit without saving the registrations all data will be lost\nDo you want exit again?")) {
      this.router.navigate(["/"]);
    }
  }


  /**
   * Collect all data inserted from the user
   * 
   */
  public addAthlete() {
    if(this.customizedRaceNumbers.length > 0) {
      if(this.customizedRaceNumbers.find( n => n === this.formAthleteData.get("raceNumber")?.value)) {
        alert("Customized race number " + this.formAthleteData.get("raceNumber")?.value + "\nIs already assigned");
        return;
      }
    }
    if(this.formAthleteData.get("raceNumber")?.value === 0) {
      alert("It is necessary to assign a race number to the athlete");
      return;
    }
    let dbOperation:string = "save";
    if(this.autoFilled) {     
      if(this.athlete.team !== this.formAthleteData.get("team")?.value) {
        this.athlete.team = (this.formAthleteData.get("team")?.value).toUpperCase();
        dbOperation = "update";
      } else {
        dbOperation = "nop";
      }
    } else {
      this.athlete = {
        name:this.formAthleteData.get("name")?.value.toUpperCase().trim(),
        surname:this.formAthleteData.get("surname")?.value.toUpperCase().trim(),
        birthday:this.formAthleteData.get("birthday")?.value.toUpperCase().trim(),
        cityOfBirth:this.formAthleteData.get("cityOfBirth")?.value.toUpperCase().trim(),
        team:this.formAthleteData.get("team")?.value ? this.formAthleteData.get("team")?.value.toUpperCase().trim() : null,
      }
    }
    const registrationCategory:Category = {
      name:this.formAthleteData.get("category")?.value,
      lapsToDo:this.formAthleteData.get("lapsNumber")?.value,        
    }

    this.dataForRegistration.athletes.push(this.athlete);
    this.dataForRegistration.categories.push(registrationCategory);
    this.dataForRegistration.raceNumbers.push(this.formAthleteData.get("raceNumber")?.value);
    this.customizedRaceNumbers.push(this.formAthleteData.get("raceNumber")?.value);
    this.dataForRegistration.persistenceOperations.push(dbOperation);
    this.dataForRegistration.raceNumbersAutoAssign.push(this.formAthleteData.get("checkRaceNumber")?.value);
    
    this.raceNumber++;

    this.onResetAthleteData();
  }


  /**
   * Send registrations to the backend
   */
  public sendAthleteData() {
    if(this.dataForRegistration.athletes.length > 0) {
      /*
      if  when we press the button to send the athlete's registration, the form is valid,
      it means that the user has entered the data to add a new athlete to the registration
      list but has forgotten to add it via the Add button, so we ask the user if he wants
      to send the list of the athlete registrations as is or not
      */
      if(this.formAthleteData.valid) {
        if(!this.confirmChoose()) return;
      }
      
      /*
      if when we press the button to send the athlete's registration, the form is "touched",
      it means that the user has entered some data in the registration module but this module
      is incomplete so we ask the user if he wants to send the list of the athlete entries as is or not
      */
      if(this.formAthleteData.touched) {
        if(!this.confirmChoose()) return;
      }
      let possibleFile = this.configurationService.getRawRaceFile();
      if(possibleFile != undefined) {
        console.log("addAthlete:",possibleFile.name)
        let fileToSend:File;
        fileToSend = possibleFile;
        this.fileToSendName = fileToSend.name;
        this.dataForRegistration.fileName = this.fileToSendName;
        
        const uploadForRegistrationRequest = this.athleteService.sendFileForRegistration(fileToSend)
        .pipe(
          tap( x => {
            if(x===true) {
              this.configurationService.setRawRaceFile(fileToSend);
              console.log("uploadForRegistrationRequest", this.configurationService.getCurrentFileName())
            }
            else throw new Error("File not sended");
          }),
          catchError( err => {
            const errorResolved = this.authService.loginExpiredHandler(err);
            if(errorResolved !== null) return of(errorResolved)
            else {
              this.messagesService.setupMessageForDialog("Something Went Wrong Uploading Configuration, Try Again Later.", MessageType.SIMPLE_MESSAGE);
              return of("ERROR");
            }
          })
        );

        const sendDataRegistrationRequest = this.athleteService.sendDataForRegistration(this.dataForRegistration, {observe : 'response'})
          .pipe(
            tap( x => {
              if(x.body) {
                this.dataRegistrationHeader = new String(x.headers.get('Data-Registration'));
                const url = window.URL.createObjectURL(x.body);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.fileToSendName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.configurationService.setRawRaceFile(fileToSend);
                this.messagesService.setupMessageForDialog(
                this.dataRegistrationHeader,
                this.dataRegistrationHeader.toString().trim() === "unsuccess for:" ? MessageType.ATHLETE_REGISTRATION : MessageType.ATHLETE_PARTIAL_REGISTRATION);
                this.openDialog();
              } 
            }),
            catchError( err => {
              const errorResolved = this.authService.loginExpiredHandler(err);
              if(errorResolved !== null) return of(errorResolved)
              else{
                return of("ERROR")
              }
            })
          );
  
        concat(
          uploadForRegistrationRequest,
          sendDataRegistrationRequest).subscribe( response => {
            if(response instanceof HttpErrorResponse) {
              if(response.status === HttpStatusCode.Forbidden) {            
                localStorage.removeItem("jwtkn");
                this.router.navigate(['/auth']);
              } else {            
                this.messages.setupMessageForDialog("", MessageType.DOWN);
                this.router.navigate(['/']);   
              }
            }
            if(response === "ERROR") {
              this.messagesService.setupMessageForDialog("Something Went Wrong Sending Athlete Data, Try Again Later.", MessageType.SIMPLE_MESSAGE);
              this.router.navigate(['/']);
            }
          });
      } else {
        //console.log("ERROR SENDING DATA FOR REGISTRATION:file undefined")
      }        
    } else {
      alert("Add at least an athlete")
    }
  }



  //create the form to add Athletes to the race.
  private createForm() {
    this.formAthleteData = new FormGroup({
      name: new FormControl("", [ Validators.required ]),
      surname: new FormControl("", [ Validators.required ]),
      birthday: new FormControl("", [ Validators.required, Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) ]),
      cityOfBirth: new FormControl("", [ Validators.required ]),
      team: new FormControl(""),
      lapsNumber: new FormControl({ value : null, disabled : true }, [ Validators.required ]),
      category: new FormControl("", [ Validators.required ]),
      raceNumber: new FormControl({value:this.raceNumber, disabled:this.disabledLaps}, [ Validators.required ]),
      checkRaceNumber: new FormControl(true),
    });
  }


  //set the formAthleteData FormGroup as untouched
  private makeUntouched():void {
    // (<any>Object).values(this.formAthleteData.controls).forEach( (field:any) => {
    //   field.markAsUntouched();this.formAthleteData
    // });
    this.formAthleteData.markAsUntouched();
    this.formAthleteData.markAsPristine();
  }


  //ask the user if confirm the subscriptions
  private confirmChoose() : boolean {
    if(this.formAthleteData.valid)
      return confirm("The form is complete and valid, but the last data entered has not been added to the list of the registered athletes.\nDo you want to save these lists of registered athletes without this latest data?");
    
    return confirm("There are some fields filled in, check if you need to add another athlete or send the entries of the athletes added so far./nDo you want to submit the athlete entries added so far?");
  }


  //open the success dialog
  private openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data =this.messages.getMessage();
    dialogConfig.position = {top:"0", right:"0"};
    dialogConfig.disableClose = true;
    this.dialog.open(BasicDialogComponent, dialogConfig);
    this.messagesService.reset();
  }

}
