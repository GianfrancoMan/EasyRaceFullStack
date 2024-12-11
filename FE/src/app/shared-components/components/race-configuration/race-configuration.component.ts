import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RaceData } from '../../../models/race-data.model';

@Component({
    selector: 'app-race-configuration',
    templateUrl: './race-configuration.component.html',
    styleUrl: './race-configuration.component.scss',
    providers: [provideNativeDateAdapter()],
    standalone: false
})
export class RaceConfigurationComponent implements OnInit {
  @Input() raceData!:RaceData ;
  @Output() raceConfiguration:EventEmitter<RaceData> = new EventEmitter<RaceData>();
  dataForm!: FormGroup;
  categories:string = "";
  laps:string = "";
  categoryError:boolean = true;
  lapsError = true;
  selectedCategories:string[] = [];
  selectedLaps:number[] = [];
  formFilled:boolean = false;
  dateString:string = "";  
  dateToFix:boolean  = false;

  constructor() {
  }

  ngOnInit(): void {
    this.createDataForm();
  }

  

  /*
  * format the date piked on the material DatePiker
  */
  public dateChangeHandler(date: Date){
    this.dateToFix = true;
    const stringDate: string = `${date.getMonth() +1}/${date.getDate()}/${date.getFullYear()}`;
    this.dataForm.get('date')?.setValue(stringDate);
  }




  /*
   * gets Data from the 'dataForm' FormGroup
   */
  public onSubmitData() {
    this.selectedCategories.forEach( c => this.categories += `${c}¢`);
    this.selectedLaps.forEach( l => this.laps += `${l}¢`);

    this.raceData = {
      categories : this.categories,
      laps: this.laps,
      city : this.dataForm.value.city.toUpperCase().trim(),
      date: this.dateToFix ? this.fixDateValue(this.dataForm.value.date) : this.dataForm.value.date,
      meeting : this.dataForm.value.meeting.toUpperCase().trim(),
      organizer : this.dataForm.value.organizer.toUpperCase().trim(),
      title : this.dataForm.value.title.toUpperCase().trim(),
      federation : this.dataForm.value.federation ? this.dataForm.value.federation.toUpperCase().trim() : "",
      type : this.dataForm.value.type ? this.dataForm.value.type.toUpperCase().trim() : "",
      specialty : this.dataForm.value.specialty ? this.dataForm.value.specialty.toUpperCase().trim() : "",
      description : this.dataForm.value.description ? this.dataForm.value.description.toUpperCase().trim() : "",
    }

    this.formFilled = true;
    this.raceConfiguration.emit(this.raceData);
  }



  /*
   * gets the category tha has been added, from the 'catForm' FormGroup
   */
   public onSubmitCategory() {
    this.categoryError = true;
    this.lapsError = true;
    const valueTyped:string = this.dataForm.controls["catForm"].value.category.toUpperCase().trim();    
    const numberTyped:number = this.dataForm.controls["catForm"].value.laps;
    if(valueTyped !== "") {
      if(this.isValidValue(valueTyped, numberTyped)) {
        this.selectedCategories.push(valueTyped);
        this.selectedLaps.push(this.dataForm.controls["catForm"].value.laps);
        this.dataForm.controls["removeForm"].setValue({remove:valueTyped});
      }
    }
    this.dataForm.controls["catForm"].reset();
    if(!this.raceData && this.selectedCategories.length <= 0) {
      this.categoryError = false;
      this.lapsError = false;
      this.selectedLaps = [];
    }
    this.dataForm.controls["catForm"].setValue({laps:1, category:""});
   }


   /**
    * remove the category that has been selected.
    */
   public onSubmitRemove() {
    let removedCategory:string = this.dataForm.controls["removeForm"].value.remove;
    let removedIndex:number = -1;
    for(let i = 0; i < this.selectedCategories.length; i ++) {
      if(this.selectedCategories[i] == removedCategory) {
        removedIndex = i;
        break;
      }
    }
    if(removedIndex >= 0) {
      this.selectedCategories.splice(removedIndex, 1);
      this.selectedLaps.splice(removedIndex, 1);
      if(!this.raceData && this.selectedCategories.length <= 0) {
        this.categoryError = false;
        this.selectedLaps = [];
      }
    }
   }




  /*
   * Create the 'dataForm' FormGroup that is used to send race basic-data 
   */
  private createDataForm() {    
    this.categories = "";
    this.categoryError = true;
    this.lapsError = true;
    this.selectedCategories = [];
    this.dataForm = new FormGroup({
      title : new FormControl(
        { value:this.raceData ? this.raceData.title : "", disabled:this.formFilled }, 
        [ Validators.required, Validators.minLength(4), ]
      ),
      city : new FormControl(
        { value:this.raceData ? this.raceData.city : "", disabled:this.formFilled, },
        [ Validators.required, Validators.minLength(2) ]
      ),
      meeting : new FormControl(
        { value:this.raceData ? this.raceData.meeting : "", disabled:this.formFilled, },
        [ Validators.required, Validators.minLength(5), ]
      ),
      date: new FormControl(
        { value:this.raceData ? this.raceData.date : "", disabled:this.formFilled, },
         [ Validators.required ]
      ),
      organizer : new FormControl(
        { value:this.raceData ? this.raceData.title : "", disabled:this.formFilled  },
        [ Validators.required, Validators.minLength(4), ]
      ),
      federation : new FormControl({ value:this.raceData ? this.raceData?.federation : "", disabled:this.formFilled, }),
      type: new FormControl({ value:this.raceData ? this.raceData?.type : "", disabled:this.formFilled, }),
      specialty : new FormControl({ value:this.raceData ? this.raceData?.specialty : "", disabled:this.formFilled ,}),
      description : new FormControl({ value:this.raceData ? this.raceData?.description : "", disabled:this.formFilled, }, [Validators.min(1)]),
      catForm : new FormGroup({
        category: new FormControl({ value:"", disabled:this.formFilled }),
        laps: new FormControl({ value:1, disabled:this.formFilled, }, [Validators.min(1)]),
      }),
      removeForm: new FormGroup({
        remove: new FormControl({ value:"", disabled:this.formFilled  }),
      })
    });
  }



  /*  
   * Check and return 'FALSE' both if the 'value' parameter is contained ia the array of string  obtained
   * from a string splitted by ';' character and if it's a string of spaces,
   * otherwise return TRUE.
  */
  private isValidValue( value : string, num:number): boolean {
    if(value === null) return false; //'value' parameter equal to null is no valid value
    if((value.replace(/\s/g, '').length==0)) return false; // if 'value' parameter is empty or a string of spaces is not a valid value
    if(this.selectedCategories.find( v => v === value ) != undefined) return false; // value already exists inside the array
    if(num <= 0) {
      this.lapsError = false;
      return false;
    }

    return true; // if value both isn't in the array and isn't  a string of spaces and if the laps number typed is major or equal 1, otherwise false.
  }


  /**
   * 
   * @param date:Date
   * @returns 
   */
  private fixDateValue(date:Date): Date {
    const dateStr:string = this.dataForm.value.date;
    const dateArr:string[] = dateStr.split('/');
    const fixedDate =  new Date(+dateArr[2], (+dateArr[0])-1, (+dateArr[1])+1);
    return fixedDate;
  }

}
