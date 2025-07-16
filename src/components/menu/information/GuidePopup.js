import '../../css/Popup.css';

function Guide({ onClose }) {
  return (
    <div className="filter" onClick={onClose}>
      <div className="frame" onClick={e => e.stopPropagation()}>

        <div className='exit'>
          <button onClick={onClose}>X</button>
        </div>

        <h2>How to Use</h2>
        
        <div className='popup-content'>
          <p>This guide will be a brief overview on how to use this application with the purpose of creating a floorplan, adding sensors, and exporting to Home Assistant. </p>

          <p>Please note, a more detailed guide with visual aids will be supplied at a later date.</p>
          <b>Step 1: Create the Floorplan</b>
          <p>You will have the option to either upload an image or design a floorplan by scratch.
          </p>

          <b>Create a Canvas</b>

          <p>You can create a canvas by selecting the "create new" button. This will prompt you to create 
          a new base canvas, or upload an image as the base for a canvas. You enter your desired dimensions, name the floorplan, and then you can begin creating!</p>

          <b> Creating a Floor Plan </b>

          <p> The left side of the menu contains the toolset necessary to create a floor plan. Each button will create a popup menu with different functionalities. </p>

          <b>Drawing</b>
          <p> With the draw menu, you have the options to create lines, rectangles, circles, and marking rooms. These will be the foundations to your floorplan. This will allow you to create the different walls for the home.
            Through marking rooms, you simply click the "mark rooms" button and begin tracing the rooms you wish to label. On successful tracing, the room will be colored red and given a room label.
            You can configure the color of the room and it's designated label. </p>

          <b>Components</b>
          <p> The components menu contains any miscellaneous elements necessary for building a floor
          plan. This contains doorways, windows, stairways, and furniture </p>

          <b>Step 2: Integrate your sensors</b>

          <p> To generate a sensor menu, you must have integrated your desired sensors into your Home Assistant software. This software can generate the configuration files necessary for developing your list of sensors.
            A more detailed guide will come later in regards towards developing these lists and files. Once acquired, upload the files into this application and a list will be generated. </p>

          <p> To place sensors, you click on the device you wish to place. This will open the device settings screen. Here, you can change the device display name, and edit which sensors you wish to focus on and view in the
            Home Assistant dashboard upon exporting. For example, you may have a multisensor with several types of sensors. Although, your usability only requires one of the sensors. Simply select to make that sensor active. 
            When creating the device, it will appear on the floorplan. You can drag it or resize it to its proper location. This will be utilized for the dashboards.
          </p>
  
          <b>Step 3: Exporting your files</b>
          <p>There are various types of exports available. You can keep it simple by creating a PDF or PNG of your floorplan. You can also export the files necessary to generate a dashboard in Home Assistant.</p>
          <b> Exporting a Floor Plan to Home Assistant </b>
          <p> Start by clicking on the "export" button in the menu, and select "Export to Home Assistant". This will download a zip file containing the necessary images and config files for generating a dashboard.
            Go to your Home Assistant software, and access the file manager. Once here, you can upload the config files which should override the currently existing files. Lastly, a lovelace dashboard file will be utilized To
            create the dashboard in the application. </p>
        
        </div> 
      </div>
    </div>
  );
}

export default Guide;