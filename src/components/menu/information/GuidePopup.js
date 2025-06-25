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

          <b>Create a Canvas</b>

          <p>You can create a canvas by selected the "create new" button. This will prompt you to create 
          a new base canvas, or upload an image as the base for a canvas. You can enter the dimensions to create a new canvas, then a new one will be created. </p>

          <b> Creating a Floor Plan </b>

          <p> The left side of the menu contains the toolset necessary to create a canvas. Each button will create a popup menu with different functionalities. </p>

          <ol>
          <li>Draw</li>
          <p> With the draw menu, you have the options to create lines or squares. These will be the foundations to your floorplan. This will allow you to create the different walls for the home. </p>

          <li>Sensors</li>
          <p> With the sensor menu, you have a wide variety of sensors to pick from. This will be done
          through a drag and drop functionality. Simply click on the sensor you wish to use, and drag it onto the canvas. From there, you have the ability to resize, rotate, and move the sensor to its proper place. Clicking on a sensor will also prompt you with it's properties and configurations for editing.</p>

          <li>Components</li>
          <p> The components menu contains any miscellaneous elements necessary for building a floor
          plan. This contains doorways, windows, stairways, and furniture. Some of these objects may also contain configurations, such as doorways and their ability to be opened or closed. Placing a stairway will create a new floor layer for the floorplan. You will be able to click on the left floor buttons to move between the different layers. </p>
          </ol>

          <b> Exporting a Floor Plan to Home Assistant </b>
          <p>Once you are satisfied with the floorplan, you can export the files to be imported into Home Assistant. Start by clicking on the "export" button in the menu, and select "Export to Home Assistant". This will download a zip file containing the necessary folders. Go to your Home Assistant software, and the rest of this guide will be created at a later point. </p>
        
        </div> 
      </div>
    </div>
  );
}

export default Guide;