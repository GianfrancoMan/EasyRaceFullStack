import { Athlete } from "./athlete.model";
import { Category } from "./category.model";

export interface CrossingData {
  raceNumber:number;
  athlete:Athlete;
  category:Category;
  times:number[];
  responseStatus:string;
  gap:number;
  finished:boolean;
  position:number;
  textGap:string;
  textTimes:string[];
  textOverall:string;
  best?:string;
}