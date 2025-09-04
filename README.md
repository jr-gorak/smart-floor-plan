# Smart Floor Planner

Smart Floor Planner is a canvas-based application for drawing or uploading floor plans with the intention of placing and configuring
Home Assistant integrated sensors and devices to for automated generation of dashboards. 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## Set-up

### Node and React
In order to use the repository, it is necessary to have node and react installed. The original IDE for development was Visual Studio Code.
The exact libraries used can be found below.

### Steps:
1. Clone the repository
2. Run <i>npm install</i> which should install dependencies found inside package.json. If this does not work, please refer to the libraries below and install them through npm.
3. Firebase- The existing api key is in place. If you wish to connect your own, see the Firebase section below.
4. Once dependencies and firebase are set-up, run <i>npm start</i> for local development and <i>npm test</i> for the testing environment.

## Structure
Seen below is a general architecture for the application.

<img width="1389" height="860" alt="Application Architecture" src="https://github.com/user-attachments/assets/199b657e-e3dc-4b83-a415-160bb1c19fb8" />

App.js the central file for the whole application. Any other component is accessed from this originating point. This means it also holds all global states that get passed to child components throughout the application. 

Alongside the top bar main menu of the application are a series of buttons. These are divided by: Tools, files, and information. The tools section holds the interactive menus for placing or drawing objects on the canvas. The central file manager section holds the logic behind creating and saving canvases as well as exporting data. The information section describes the application, how to use it, and account information where users can access and edit their files.

The canvas section holds all canvas data. It is divided into different functionalities such as drawing, creating devices, canvases, and switching between floors.

### Canvas
The canvas logic uses a series of use effects to re-render on specific changes for different states. This is broken into sections such as initializing, loading, drawing, and various sub-functions such as the viewport toggle. Each floor on the canvas has it's own data stored within the floorData object. Switching between floors will dynamical load this stored canvas data.

### Exporting
The export logic involves a series of functions that use the various device lists and canvas data to loop and generate arrays of objects to be added to a JSON file used for dashboards. Typically, this object array feature is used to populate the <i>entities</i>, <i>cards</i> or <i>sections</i> for a Home Assistant file. Essentially, during a loop, objects will be generated through specific maps that will be pushed into the array for the function. The function will return the completed array, which will be added to the corresponding object. 

All relevant files for a Home Assistant project are exported. The expected use-case is a brand new project slate with integrations made through thethingsnetwork. Smart Floor Planner will generate new configuration files, update existing ones, the main dashboard, and various yaml configuration files for functionalities such as scripts and adding units of measurement to entities.

The yaml files found within the public folder are static folders that get called during export. Any other yaml or json file utilized through exportation is generated directly from the application. Comments found inside the code briefly describe the functionality and methodology for each function found inside the export component.

### Menu & Button Toggles
The buttons in the menu trigger react states to change to perform specific functions. A popup state is used for triggering the information popups or draw tool menus. These state toggles are also utilized for performing different canvas actions. For example, clicking the draw square button will change the default canvas state from 'selection' to 'square' which will allow the user to draw rectangles instead of selecting objects. 

## Libraries Utilized

### Node.js – ver 22.16.01
Runtime environment through ran Visual Studio Code. Allows for many tools for installing various libraries in React. <br>
    https://nodejs.org/en

### React.js – ver 19.1.0
Main JavaScript library used for the framework of the project. <br>
	https://react.dev/ <br>
	https://react.dev/reference/react

### Fabric.js – ver 6.7.0
Main JavaScript library used for interactive canvases.<br>
	https://fabricjs.com/ <br>
	https://fabricjs.com/docs/ <br>
	https://fabricjs.com/demos/

### Firebase – ver 11.9.1
Software development tool kit hosted by Google that allows for application hosting, user authentication, and database storage. While there are many other features from this software, only the three aforementioned services were utilized. <br>
	https://firebase.google.com/ <br>
    https://firebase.google.com/docs/hosting <br>
	https://firebase.google.com/docs/auth <br>
    https://firebase.google.com/docs/firestore

### jszip – ver 3.10.1
JavaScript package that allows the creation of zip folders for downloading. <br>
    https://stuk.github.io/jszip/

###	file-saver – ver 2.0.5
JavaScript package that jszip utilizes for saving files <br>
    https://github.com/eligrey/FileSaver.js

### js-yaml – ver 4.1.0
JavaScript package that converts JavaScript objects into YAML-based structures. <br>
    https://www.npmjs.com/package/js-yaml

### Jest – ver 6.6.3
JavaScript testing framework for unit testing with compatability for React projects <br>
    https://jestjs.io/ <br>
    https://jestjs.io/docs/tutorial-react

## Firebase

If you wish to set up your own version of firebase to connect to the application, follow the steps below.
1. Create a new firebase project
2. Ensure the project is web-app
4. Enable authentication and firestore
5. Ensure firebase exists in the repository during npm install from package.json
6. In the firebase console, go to project settings => general => your apps, and find the configuration file.
7. Replace the firebaseConfig object inside firebase.js with your own personal configuration.

## Home Assistant
Home Assistant is necessary for generating the files necessary for creating devices and exporting data into to view dashboards. It is recommended to follow the installation guide linked below to set up a Home Assistant environment.

### OracleBox Virtual Machine
The virtual machine that was installed through the Home Assistant tutorial page for hosting the Home Assistant operating system. <br>
    https://www.virtualbox.org/ <br>
    https://www.home-assistant.io/installation/

### Home Assistant OS
Home Assistant’s operating system for windows. <br>
    https://www.home-assistant.io/installation/windows/

### File Editor / Configurator
An add-on to Home Assistant that gives access to important core configuration files within the operating system for exporting and importing data  <br>
    https://github.com/home-assistant/addons/tree/master/configurator

 Further assistance for gaining the core configuration files, uploading to generate sensors, or exporting data back into Home Assistant can be found inside the detailed <i>How to Use</i> guide found at the project website, https://smart-floor-planner.web.app/
