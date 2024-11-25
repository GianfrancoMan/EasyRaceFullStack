import { Injectable } from '@angular/core';
import { Result } from '../models/result.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfCreatorService {

  constructor() { }

  title:string = "";
  category:string = "";
  federation:string = "";
  type:string = "";
  specialty:string = ""; 
  city:string = ""; 
  date:string = "";
  headers:string[][] = [['Pos', 'Number', 'Name', 'Category', 'Team', 'Time']];
  rows:string[] = [];
  data:string[][] = [];

  public setupPdfCreator(title:string, items:Result[], overallSelected:boolean) {
    this.rows = [];
    this.data = []
    this.title = title;    
    this.category = overallSelected ? 'OVERALL' : items[0].category;
    this.federation = items[0].federation;
    this.type = items[0].type;
    this.specialty = items[0].specialty;
    this.city = items[0].city;
    this.date = items[0].date;
    let idx = 1;
    items.forEach( item => {
      this.rows.push(idx.toString());
      this.rows.push(item.raceNumber.toString());
      this.rows.push(item.name);
      this.rows.push(item.category);
      this.rows.push(item.team);
      this.rows.push(item.time);
      this.data.push(this.rows);
      this.rows = [];
      idx++;
    });
    this.createDocument();
  }


  private createDocument():void {
    let Y:number= 15;
    let X:number = 105;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(`${this.title}`, X, Y, {align:"center"});

    pdf.setFontSize(14);
    Y += 10;
    pdf.text(`federation:${this.federation}     type:${this.type}     specialty:${this.specialty}`, X, Y, {align:"center"});
    Y += 10;
    pdf.text(`city:${this.city}                    date:${this.date}`, X, Y, {align:"center"});

    pdf.setFontSize(18);
    Y += 10;
    pdf.text(`category:${this.category}`, X, Y, {align:"center"});


    autoTable(pdf, {
      theme: 'grid',
			head: this.headers,
			body: this.data,
			startY: 55, // Adjust the `startY` position as needed.
		});


    pdf.save(`${this.title.replace(" ", "-")}-${this.category}.pdf`);
  }

}
