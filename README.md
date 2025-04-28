# EasyRace
## This project aims to allow sports associations and others to easily configure and manage circuit races.
### This repository contains both frontend and backend implementation.
### Technologies:
- Frontend Angular 19
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
Now open a new window in the terminala and move in the FE folder  
In the terminal type ``` cd ./EasyRaceFullStack/FE ``` and press  ``` Enter ```  
type ```npm install``` and press  ``` Enter ``` to install all required dependencies  
type ```npm start``` and press  ``` Enter ``` to run the frontend, follow the link provided in the terminal to open the application in the browser.

# Usage
As a final project of the master in full stack development, I wanted to create something that moves away from the usual end-of-course application and that can also be used in the real world, therefore framing it in the area of ​​interest Life Style, EasyRace was born, a web application that has the objective of allowing sports associations and others, to configure and manage races on the circuit, in order to encourage the growth of sports practice by people. The application has two phases of use, one concerns the configuration of the race where the user can enter the data of the event (title, data, location etc.), the categories of race allowed and record the registrations of the athletes, the other phase concerns the management of the results during the race or drawing up the rankings. The application can only be used by authenticated users.   

## Login   
Unauthenticated users will be sent to the login page, where they can enter their credentials or open the page to register on the platform, if they have not already done so. Security is implemented with SpringSecurity and JWT on the server side, while on the client side, Angular implements Guards that block requests in the event of an incorrect or expired token.
![login and subscription views](https://i.ibb.co/NF9zd6m/1.png)   
## NavBar
![navbar view](https://i.ibb.co/C7kTHQt/2.png)   

## New Race Configuration
In this view you can save the new race configuration, but only when all mandatory fields have been filled in. The user can also add race categories or remove them in case of error. This component will also be used for some race configuration modification operations, such as when you want to modify the race data or add categories.   
![new race configuration view](https://i.ibb.co/C7zqbcc/3.png)   

## Edit Category Name
The user has the ability to change the name of a race category, this will be updated for all athletes registered with that race category.   
![edit category name  view](https://i.ibb.co/yP12B8H/4.png)   

## Athlete Registration   
The user can register multiple registrations at a time, the “add athlete” button is enabled only after all the fields are filled in. The “Save Registrations” button is enabled when at least one athlete has been added and only by pressing it will the registrations be actually saved. When the user starts typing in the name or surname field, the system shows suggestions for athletes already entered in the database, who have the typed string present in their name, by clicking on a suggestion the fields are automatically filled in with the data of the selected athlete and the user will only have to enter the category and ‘possibly’ the race number.   
Race numbers from 1 to 99 are reserved for athletes who, based on criteria established by the organizer or federation, deserve a privileged position in the starting grid, in this case the user can disable the automatic assignment of the race number and assign a number ranging from 1 to 99.
There are also the "Reset" buttons to clear the items and the "Cancel" button to cancel the operation, in the latter case, no registration will be saved even if one or more athletes had been added, for safety, warning messages will be presented every time the user tries to leave the view without having saved the registrations of the athletes already added
![Athlete registration view](https://i.ibb.co/mRj9b0m/5.png)   

## Edit Athlete Category
This view allows you to change the race category of a registered athlete. The user is presented with the list of registered athletes, once the athlete is selected, a panel appears that presents a list of available categories, a reference to the current category and one to the one selected by the user to replace the current one. The user can save the change or cancel the operation.   
![edit athlete category view](https://i.ibb.co/WtwCwHH/6.png)   

## Race Management   
The race management view is made up of three components, the category start section, the finish line crossing section and the rankings section. If the number of laps is the same for all race categories, the user can also enable the general ranking option. Changing the configuration of a race that is in progress would cause irreparable errors, therefore it will be possible to exit this view only if the race is completed or by cancelling the race in progress, respectively via the “Mark as Completed” and “Cancel and Exit” buttons(It is clear that canceling the race only makes sense if you are simulating the progress of a race).   
From the moment the user presses "Marks as Completed", the configuration can only be used to consult and download the rankings as a completed race.   
![race management view](https://i.ibb.co/zPH6LsF/7.png)   

## Category Section(race management)   
The user has the option to start the categories all together, one at a time, or by groups of categories. Once the user selects one or more categories and presses the start button, the checkboxes of the selected categories are disabled and the categories are indicated as 'started', the "start" button will be visible as long as there is at least one category to start. In the event that the number of laps to be run is the same for all the race categories, the user is given the option to enable the general ranking option.   
![race management view section caategory detail](https://i.ibb.co/FgCN2hW/8.png)   

## Finish Line Section(race management)   
The user records the passage of an athlete on the finish line by typing his race number and pressing the “Mark Passage” button or simply hitting enter. Following this action, this component will display in the foreground, the data of the athlete who has just passed.   
![race management finsh line section detail](https://i.ibb.co/v4DwsML/9.png)   

## Rankings(race management)   
Every time the user marks the passage of an athlete on the finish line, this component will display the ranking of the category to which the athlete belongs. The user can also display the ranking of the category he prefers or the general one (if present), by clicking on the name of the category.   
![race management rankings detail](https://i.ibb.co/cx1qK9b/10.png)   

## Race Results   
You will be asked to select the race configuration for which you want to view the results. If the selected race has not yet been played, a message will be displayed warning the user that you are trying to view the result of a race that has yet to be played. This also happens in the opposite case, i.e. when you try to modify a configuration or manage the progress of a race that has already been played.   
Once the race configuration has been selected, the user will be presented with a list of race categories for that configuration, clicking on one of these will display its ranking, in this case too the link to view the general ranking may be available.   
When a ranking is displayed, two buttons are also available, one allows you to return to the list of race categories, the other to download the pdf file of the displayed ranking.   
![race results view](https://i.ibb.co/6NsBBLp/11.png)   

## Upload and Download Strategy   
The configuration file upload is requested each time you start operations that modify the race configuration. The configuration file download is performed each time the operations end.   
I chose to save the race configuration on the client machine because the configuration belongs to the organizers, only the basic data of the races and the data of the athletes registered for the races managed by this platform are saved on the system database, but the configuration is always saved on the user's machine (organizer)  
![upload and dowload strategy explanation](https://i.ibb.co/pLr02Sh/12.png)   

##   
Although Easy Race is designed to be used with any device, considering the type of data displayed, users are advised to use desktop or laptop devices.   
For easy use of the application, it is recommended to create a dedicated folder to download the race configurations and overwrite the old file with the latest downloaded one.
