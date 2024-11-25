/**
 * data model to send the backend when we register an athlete to a race.
 */
import { Athlete } from "./athlete.model";
import { Category } from "./category.model";

export interface DataForRegistration {
  athletes:Athlete[];
  categories:Category[];
  raceNumbers:number[];
  persistenceOperations:string[];
  fileName:string
  raceNumbersAutoAssign:boolean[]
}