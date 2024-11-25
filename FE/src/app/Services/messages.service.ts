import { inject, Injectable } from '@angular/core';
import { Message, MessageType } from '../models/message.model';
import { RaceData } from '../models/race-data.model';
import { AthleteService } from './athlete.service';
import { CrossingData } from '../models/crossing-data.model';
import { Athlete } from '../models/athlete.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  athleteService:AthleteService = inject(AthleteService);
  private message:Message;
  

  constructor() {
    this.message  = { title : "", messages : [] };
  }

  public getMessage() : Message {
    return this.message;
  }

  public setMessages(message:Message) : void {
    this.message = message;
  }

  public getMessageByIndex(index:number) : string {
    return this.message.messages[index];
  }

  public addMessage(message:string) : void {
    this.message.messages.push(message);
  }

  public setupMessageForDialog(obj:Object, messageType:MessageType) {    
    this.message.messages = [];

    switch(messageType) {

      case MessageType.RACE_CONFIGURATION: {
        let data:RaceData = <RaceData>obj;
        this.message.title = "The race configuration for " + data.title + " has been successful.";       
        this.message.messages.push(`Make sure to save your new race configuration.`);
      }
      break;

      case MessageType.ATHLETE_REGISTRATION: {
        this.getMessage().title = "All registrations for the races were successful";
        this.message.messages.push(`Make sure to save your new race configuration.`);
        this.message.messages.push(`(tip: it's best to overwrite the old configuration with the new one)`);
      }
      break;

      case MessageType.ATHLETE_PARTIAL_REGISTRATION: {
        let unsuccessRegistrations:String = <String>obj;
        this.message.title = "The last registrations for the races have been partially satisfied";
        this.message.messages.push("The athletes below result already registered for this race:");
        unsuccessRegistrations.substring(14).toString().split(',').forEach(name => {
          this.message.messages.push(name);
        });        
        this.message.messages.push(`Make sure to save your new race configuration.`);
        this.message.messages.push(`(tip: it's best to overwrite the old configuration with the new one)`);
      }
      break;

      case MessageType.SIMPLE_MESSAGE: {
        let text:String = <String>obj; 
        this.getMessage().title = text.toString();
      }
      break;
      
      case MessageType.DOWN: {
        this.message.title = "the server does not respond.";
        this.message.messages.push("Please try again later.")
      }
      break;

      case MessageType.NO_VALID_CROSSING: {
        let data:CrossingData = <CrossingData>obj;
        this.message.title = `There Are No Athletes With The Race Number ${data.raceNumber}.`;
        this.message.messages.push("What may have happened:");
        this.message.messages.push("The number you entered is incorrect and does not belong to any athlete in the race.");
        this.message.messages.push("The category of the athlete with the race number you entered may not have started yet.");
      }
      break;
      
      case MessageType.VALID_FINISHED_CROSSING: {
        let data:CrossingData = <CrossingData>obj;
        this.message.title = `It looks like the athlete with the race number ${data.raceNumber} had already finished the race.`;
        this.message.messages.push("Make sure that:");
        this.message.messages.push("The number you entered is correct.");
        this.message.messages.push("If the number is correct, stop the athlete please!!");
      }
      break;

      case MessageType.ATHLETE_REMOVED: {
        let data:Athlete = <Athlete>obj;
        this.message.title = `The Athlete ${data.name} ${data.surname} Has Been Removed From The Race List.`;
        this.message.messages.push(`Athlte ID: ${data.id}`);
        this.message.messages.push(`Make sure to save your new race configuration.`);
        this.message.messages.push(`(tip: it's best to overwrite the old configuration with the new one)`);
      }
      break;

      case MessageType.UPDATE_CATEGORY: {
        let data = <{name:string, id:number, previous:Category, next:Category}>obj;
        this.message.title = `The Category has been updated correctly`;
        this.message.messages.push(`Athlete:${data.name}`);
        this.message.messages.push(`Athlete ID:${data.id}`);
        this.message.messages.push(`Previous category:${data.previous.name}`);
        this.message.messages.push(`Current category:${data.next.name}`);
        this.message.messages.push(`Make sure to save your new race configuration.`);
        this.message.messages.push(`(tip: it's best to overwrite the old configuration with the new one)`);
      }
      break;

      case MessageType.CHANGE_CATEGORY_NAME: {
        let data = <{oldName:string, newName:string}>obj;
        this.message.title = `The Category Name Has Been Changed Successfully`;
        this.message.messages.push(`Old Name: ${data.oldName}`);
        this.message.messages.push(`New Name: ${data.newName}`);
        this.message.messages.push(`Make sure to save your new race configuration.`);
        this.message.messages.push(`(tip: it's best to overwrite the old configuration with the new one)`);
      }
      break;

      case MessageType.RACE_PERFORMED: {
        let data = <{filename:string}>obj;

        this.message.title = `The Race Configuration has been marked as finished`;
        this.message.messages.push(`The configuration of the race ${data.filename} can no longer be managed with regards to:`);
        this.message.messages.push(`1) The modification of the race configuration`);
        this.message.messages.push(`2) The running of the race to which it refers.`);
        this.message.messages.push(`It can only be used for consultation purposes`);
      }
      break;
      
      case MessageType.ACCOUNT: {
        let data:User = <User>obj;
        this.message.title = `Your Data`;
        this.message.messages.push(`First Name: ${data.name}`);
        this.message.messages.push(`Last Name: ${data.surname}`);
        this.message.messages.push(`Email: ${data.email}`);
      }
      break;

      case MessageType.RACE_OFF_LINE: {
        let data = <string>obj;
        this.message.title = data;
        this.message.messages.push("You may be temporarily offline or the server may be temporarily down");      
        this.message.messages.push(`In these conditions the application can no longer manage the progress of the race.`);
        this.message.messages.push(`If the race has already started, you will have to note the passages of the athletes and draw up the rankings manually.`);
        this.message.messages.push(`The passages already recorded by the application before the failure will still remain available.`);
      }
      break;

    }
  }


  public reset() : void {
    this.message  = { title : "", messages : [] };    
  }
  
}
