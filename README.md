# EasyRace
## This project aims to allow sports associations and others to easily configure and manage circuit races.
### This repository contains both frontend and backend implementation.
### Technologies:
- Frontend Angular 17
- Backend Springboot 3.3.0
- Database MySql

## Instructions

To run EasyRace locally you need to have both [Node.js](https://nodejs.org/en/download/package-manager) and [MySql](https://www.mysql.com/downloads/) installed on your computer. 

1. ****Create a MySql database**** 
  
2. ****Clone this repository****
In your terminal type the following:
```git clone https://github.com/GianfrancoMan/EasyRaceFullStack.git``` and press ```Enter```

3. ****Update the application.propertis file****  
at this point you need to edit the application.properties file with the information about the database you created, open the file located in the
___EasyRaceFullStack/main/BE/src/main/resources___ folder in your editor and make the appropriate changes(there are suggestions in the form of comments in the file), save the changes and close the file.  

4. ****Run the Springboot application a first time to permit Hibernate JPA to create the database tables****  
in your terminal type: ```cd ./EasyRaceFullStack/BE``` and press ``` Enter ``` to move in the BE folder  
Build the project via the maven wrapper provided by Springboot, type: ```./mvnw clean install``` and press ``` Enter ```  
Run the backend via the maven wrapper, type: ```./mvnw spring-boot:run``` and press  ``` Enter ```.  
if you see in the terminal something like: ``` Started RacingCircuitBehindApplication in 9.575 seconds (process running for 10.397) ``` it means that everything went well and the server is listening.  
Ppress ```ctrl+c``` and then type ``` s ```  and press  ``` Enter ``` to stop the server.
at this point hibernate should have created the tables correctly.  

6. ****Permanent modification of the application.properties file****  
To avoid JPA hibernate deleting and recreating the tables every time the backend is launched, you need to edit the ___application.properties___ file once again.  
Open the file again in your editor and find the ``` spring.jpa.hibernate.ddl-auto ``` property, change its value from ``` create ``` to ``` none ```, save the changes and close the file.

7. ****Run EasyRace****  
Move back to the terminal, you should still be inside the BE folder, if you are not, move into that folder.  
Type the command ``` ./mvnw spring-boot:run ``` and press  ``` Enter ```.  
Now open a new window in the terminala and move in the FE folder, in the terminal type ``` cd ./EasyRaceFullStack/FE ``` and press  ``` Enter ```  
type ```npm install``` and press  ``` Enter ``` to install all required dependencies  
type ```npm start``` and press  ``` Enter ``` to run the frontend, follow the link provided in the terminal to open the application in the browser.  
