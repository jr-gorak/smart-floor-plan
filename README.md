# Smart Floor Planner

Smart Floor Planner is a canvas-based application for drawing or uploading floor plans with the intention of placing and configuring
Home Assistant integrated sensors and devices to for automated generation of dashboards. 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Structure
Seen below is a general architecture for the application.

<img width="1389" height="860" alt="Application Architecture" src="https://github.com/user-attachments/assets/199b657e-e3dc-4b83-a415-160bb1c19fb8" />

App.js the central file for the whole application. Any other component is accessed from this originating point. 

Alongside the top bar main menu of the application are a series of buttons. These are divided by: Tools, files, and information. The tools section holds the interactive menus for placing or drawing objects on the canvas. The central file manager section holds the logic behind creating and saving canvases as well as exporting data. The information section describes the application, how to use it, and account information where users can access and edit their files.

The canvas section holds all canvas data. It is divided into different functionalities such as drawing, creating devices, canvases, and switching between floors.

### Canvas
The canvas logic uses a series of use effects to re-render on specific changes for different states. This is broken into sections such as initializing, loading, drawing, and various sub-functions such as the viewport toggle.

### Exporting
The export logic involves a series of functions that use the various device lists and canvas data to loop and generate arrays of objects to be added to a JSON file used for dashboards. Typically, this object array feature is used to populate the <i>entities</i>, <i>cards</i> or <i>sections</i> for a Home Assistant file. Essentially, during a loop, objects will be generated through specific maps that will be pushed into the array for the function. The function will return the completed array, which will be added to the corresponding object. 

## Libraries Utilized

### Node.js – ver 22.16.01
Runtime environment through ran Visual Studio Code. Allows for many tools for installing various libraries in React. 
    https://nodejs.org/en

### React.js – ver 19.1.0
Main JavaScript library used for the framework of the project. 
	https://react.dev/
	https://react.dev/reference/react

### Fabric.js – ver 6.7.0
Main JavaScript library used for interactive canvases.
	https://fabricjs.com/ 
	https://fabricjs.com/docs/
	https://fabricjs.com/demos/

### Firebase – ver 11.9.1
Software development tool kit hosted by Google that allows for application hosting, user authentication, and database storage. While there are many other features from this software, only the three aforementioned services were utilized. 
	https://firebase.google.com/
    https://firebase.google.com/docs/hosting
	https://firebase.google.com/docs/auth 
    https://firebase.google.com/docs/firestore

### jszip – ver 3.10.1
JavaScript package that allows the creation of zip folders for downloading.
    https://stuk.github.io/jszip/

###	file-saver – ver 2.0.5
JavaScript package that jszip utilizes for saving files 
    https://github.com/eligrey/FileSaver.js

### js-yaml – ver 4.1.0
JavaScript package that converts JavaScript objects into YAML-based structures.
    https://www.npmjs.com/package/js-yaml

### Jest – ver 6.6.3
JavaScript testing framework for unit testing with compatability for React projects
    https://jestjs.io/
    https://jestjs.io/docs/tutorial-react

## Home Assistant
Home Assistant is necessary for generating the files necessary for creating devices and exporting data into to view dashboards. It is recommended to follow the installation guide linked below to set up a Home Assistant environment.

### OracleBox Virtual Machine
The virtual machine that was installed through the Home Assistant tutorial page for hosting the Home Assistant operating system. 
    https://www.virtualbox.org/
    https://www.home-assistant.io/installation/


### Home Assistant OS
Home Assistant’s operating system for windows.
    https://www.home-assistant.io/installation/windows/

### File Editor / Configurator
An add-on to Home Assistant that gives access to important core configuration files within the operating system for exporting and importing data 
    https://github.com/home-assistant/addons/tree/master/configurator

## Available Scripts

In the project directory, you can run:

### `npm start`

This will run the app in development mode! 
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.



