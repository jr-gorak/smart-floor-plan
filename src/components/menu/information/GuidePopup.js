import '../../css/Popup.css';
import {useState} from 'react'
import DeviceMenu from '../../../images/guide_configuredevice.png'
import RemoveStorage from '../../../images/guide_removestorage.png'
import TheThingsNetwork from '../../../images/guide_thethingsnetwork.png'

function Guide({ onClose }) {

  const [tabMode, setTabMode] = useState("home")

  function togglePopup() {
    onClose();
    setTabMode("home")
  }

  return (
    <div className="filter" onClick={() => togglePopup()}>
      <div className="guide-frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={() => togglePopup()}>X</button>
        </div>

        <h2>How to Use</h2>

        <div className='guide-container'>
          <div className='tab-menu'>
            <button className={tabMode === 'home' ? 'button-on' : null} onClick={() => setTabMode('home')}>Home</button>
            <button className={tabMode === 'step1' ? 'button-on' : null} onClick={() => setTabMode('step1')}>Step 1: Create a Floorplan</button>
            <button className={tabMode === 'step2' ? 'button-on' : null} onClick={() => setTabMode('step2')}>Step 2: Integrate Sensors</button>
            <button className={tabMode === 'step3' ? 'button-on' : null} onClick={() => setTabMode('step3')}>Step 3: Export Floorplan</button>
            <button></button>
          </div>
          
          <div className='popup-content'>

            {tabMode === 'home' && 
              <div>
                <b>How to Use Guide</b>
                <p>This guide will be a brief overview on how to use this application with the purpose of creating a floorplan, adding sensors, and exporting to Home Assistant. </p>
                <p>For basic usage for drawing a floorplan, please refer to <b>step 1: creating a floorplan.</b></p>
                <p>If your intention is to develop a dashboard on Home Assistant, feel free to follow each step accordingly. This will go over the basic controls to
                  use the application, how to setup your home assistant to upload your devices, and how to export your data back into Home Assistant.
                </p>

                <b>Home Assistant Requirements: </b>
                <ul>
                  <li><a href="https://www.home-assistant.io/" target="_blank" rel="noreferrer">Home Assistant</a></li>
                  <li><a href="https://github.com/home-assistant/addons/tree/master/configurator" target="_blank" rel="noreferrer">File editor</a> add-on</li>
                  <li>LoRaWAN devices on <a href="https://www.thethingsnetwork.org/" target="_blank" rel="noreferrer">TheThingsNetwork</a> or ZigBee through Home Assistant</li>
                </ul>
                <p>For assistance in setting up devices to Home Assistant, please refer to Step 2.</p>
                <p>Please note that this application only has compatability with <a href="https://www.home-assistant.io/integrations/thethingsnetwork/" target="_blank" rel="noreferrer">
                LoRaWAN sensors through TheThingsNetwork</a> and <a href="https://www.home-assistant.io/integrations/zha/" target="_blank" rel="noreferrer">
                Zigbee integrated through Home Assistant</a>.</p>
              </div>
            }

            {tabMode === 'step1' && 
              <div>
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
              </div> 
            }

            {tabMode === 'step2' && 
              <div>
                <b>Step 2: Integrate your sensors</b>

                <p>This step will go over how to setup home assistant to connect to TheThingsNetwork, retrieve core configuration files, uploaded your devices to Smart Floor Planner,
                  and how to setup and configure devices onto your floorplan. <b>If you already have access to the core configuration files, please refer to section C.</b>
                </p>

                <p>You must have the Home Assistant OS installed in order to proceed. More information can be found on the <a href="https://www.home-assistant.io/installation/" target="_blank" rel="noreferrer">
                Home Assistant installation guide</a></p>
                
                <ul><b>Navigation:</b>
                  <li><b>A: Set Up Integrations and Devices</b> - devices to Home Assistant</li>
                  <li><b>B: Access Core Configuration Files</b> - files necessary for Smart Floor Planner</li>
                  <li><b>C: Upload Files to Smart Floor Planner</b> - upload files to generate sensors </li>
                  <li><b>D: File Configuration Menu and Placing Devices</b> - configure and place sensors</li>
                </ul>

                <div className='guide-section'>
                  <b>A: Set Up Integrations and Devices</b>
                  <p>Inside Home Assistant operating system, there is the main menu on the lefthand side of the screen. You can access adding devices and integrations through 
                    <b> Settings → Devices & Services</b>. The integration is what is necessary to link your devices to Home Assistant. Under the integrations tab, you can click "Add Integration".
                    From the popup, search for <i>The Things Network</i> or <i>ZigBee Home Integration</i></p>

                    <u>The Things Network</u>
                    <p>The Things Network is an integration that allows utilization of LoRaWAN devices. You must access and setup your devices <a href="https://www.thethingsnetwork.org/" target="_blank" rel="noreferrer">
                  here </a> before proceeding. Once you create an account, set your credentials, and link your devices, you can proceed by generating an API key. This is a communication key that allows you to
                  link your TheThingsNetwork devices to other software. <a href="https://www.home-assistant.io/integrations/thethingsnetwork/" target="_blank" rel="noreferrer">
                  Home Assistant provides a guide for setting up the API key.</a></p>
                  <p>Once you're fully set up, you will have a <b>host, application ID, and API key.</b> TheThingsNetwork integration popup will require these three requirements, as seen below.</p>

                  <img src={TheThingsNetwork} alt='TheThingsNetwork integration popup in Home Assistant' style={{width: '400px'}}></img>

                  <u>ZigBee</u>
                  <p> ZigBee devices require a coordinator or hub that can directly communicate with the Home Assistant platform. These devices will be placed throughout a home and communicate with one another,
                    linking in what is known as a mesh network. You can setup your ZigBee devices by utilizing the <b>Zigbee Home Integration</b> by searching for it in the add integration menu. You will be prompted
                    to enter your ZigBee radio coordinator information. <a href="https://www.home-assistant.io/integrations/zha/" target="_blank" rel="noreferrer">
                  Please refer to the in depth guide by Home Assistant to help set up your ZigBee devices.</a> 
                  </p>
                </div>

                <div className='guide-section'>
                  <b>B: Access Core Configuration Files</b>
                  <p>Home Assistant stores all of it's configurations within it's storage file. For this Smart Floor Planner, the <b>Device and Entity registries are most important.</b> The main types of files are: </p>
                  <ul>
                    <li><b>Device Registry:</b> devices, such as each multisensor</li>
                    <li><b>Entity Registry:</b> sensors or entities, such as each sensor in a multisensor, or various entities used for dashboard customization</li>
                    <li><b>Floor Registry:</b> each floor inside a home</li>
                    <li><b>Area Registry:</b> each room inside a home, marked by the different floors</li>
                    <li><b>Label Registry:</b> labels assigned to devices or entities to perform specific purposes</li>
                    <li><b>Lovelace:</b> the files that make up the various dashboards in Home Assistant</li>
                  </ul>
                  <p> Smart Floor Planner will take the device and entity registry to synchronize your devices to a floorplan. You can add your target devices, configure them,
                    then export the data. All of the above files will be created for which you can upload back into Home Assistant, as seen in <b> Step 3</b>.
                  </p>

                  <u>Access files</u>
                  <p>In order to access the files from the Home Assistant OS, you must install an add-on. As Home Assistant is open source software, there are dozens of libraries that can be utilized to improve
                  usage and customization. A file editor allows you to access the important files for Home Assistant. </p>
                  <p> You can install the <i>file editor</i> add-on by navigating to <b> Settings → Add-ons → Add-on Store</b>. Once you're in the store, search for "file editor" and install.
                  Be sure to select "start on boot" and "show on sidebar". </p>
                  <p>To access the core configuration files, you must enable access to Home Assistant storage. On the file editor installation screen, you will see "Info, Documentation, Configuration, and Log"
                    at the top of your screen. Please select "Configuration" where you will be met with this screen: </p>
                    
                  <img src={RemoveStorage} alt='File editor configuration screen' style={{width: '600px'}}></img>

                  <p>Above the <i>ignore pattern</i> section, there are a few text bubbles. These bubbles are various folders hidden by default. Click the x on the ".storage" bubble to access this folder in the file
                  editor. You can now proceed to the file editor, which should be on the sidebar menu</p>
                  <p>Once inside the file editor, click the folder icon on the top-left of the screen. This triggers the file view. Navigate to <b>.storage</b>. Once inside this folder,
                  search for <b>core.device_registry</b> and <b>core.entity_registry</b>. Click on the three dots next to these two files and download them. Once downloaded, you can proceed to section C.</p>
                </div>
                
                <div className='guide-section'>
                  <b>C: Upload Files to Smart Floor Planner</b>
                  <p>Now that you have the <b>core.device_registry</b> and <b>core.entity_registry</b>, you can upload them to Smart Floor Planner. In the top menu, please select
                  <i>Add Sensor</i>. Please note that you must have an active canvas in order to access the button.</p>
                  <p>Click on Add Devices, then you will be brought to a popup screen asking for the device and entity registry. Simply upload both of these files, then click Generate Sensors.
                  Once generated, you will have access to your LoRaWAN devices and ZigBee devices. You can select on your desired devices to access their configuration menu and add them to your floor plan.</p>
                </div>

                <div className='guide-section'>
                  <b>D: File Configuration Menu and Placing Devices</b>
                  <p>By clicking on devices on the <i>Add Sensor</i> menu, you can access the device configuration menu. Here, you can select which sensors you wish to view on your dashboard,
                  configure the names, add or remove labels, and select what type of icon you wish to view.</p>
                  <p>Once you've configured, select <i>add device</i> at the bottom of the popup which will add the device to the center of your floorplan. You can proceed to click and drag the device to
                  your desired location. Clicking on the device will give you the controls to delete or access the settings. You can access the device configuration menu by clicking the gear icon to continue
                  to configure and update your devices.</p>
                  <p>The structure of the menu can be seen below</p>

                  <img src={DeviceMenu} alt='configure device menu' style={{width: '500px'}}></img>

                  <p>
                    <ul>
                      <li><b>Header:</b> Your name for the device. This can be changed by double clicking. It will be the display name on the Add Sensor menu as well as on the floorplan.</li>
                      <li><b>Original Name:</b> The original name for your device.</li>
                      <li><b>Platform:</b> The platform for which your device is hosted. This is TheThingsNetwork for LoRaWAN and Zigbee Home Automation, or ZHA, for Zigbee.</li>
                      <li><b>Area ID:</b> The room where your device is located. NOTE: You must mark your rooms for this utilization, which is highly recommended. Do this in the "Draw" menu.</li>
                      <li><b>Sensor Name:</b> The name of the sensor. Similar to device name, it can be renamed by clicking and entering a new name.</li>
                      <li><b>Active Sensor:</b> This checkbox is for setting the sensor as an active sensor. This will be used to visualize data in a generated dashboard in Home Assistant through exporting. This is useful in the case of
                        using a multisensor with several sensors but you only want to view the temperature sensor.</li>
                      <li><b>Sensor Type:</b> The type of data each sensor collects. Certain sensor types, such as binary, can be changed by clicking and selecting what you wish to view. For example,
                      binary sensors registor a 1 or 0, which can be useful in instances of checking whether a door or window is opened or closed.</li>
                      <li><b>Sensor Label:</b> This is the label attributed to each sensor, which can be utilized for specific data tracking. Location can log a person's location over time, activity logs the amount of
                      time used for certain activities such as watching TV, and ambient tracks conditions of the home. You can create a new label by clicking "add label". The ability to add multiple labels to one entity
                      will be added in the future. </li>
                    </ul>
                  </p>
                </div>

              </div> 
            }

            {tabMode === 'step3' && 
              <div>
                <b>Step 3: Exporting your files</b>
                <p>There are various types of exports available. You can keep it simple by creating a PDF or PNG of your floorplan. You can also export the files necessary to generate a dashboard in Home Assistant.</p>
                <b> Exporting a Floor Plan to Home Assistant </b>
                <p> Start by clicking on the "export" button in the menu, and select "Export to Home Assistant". This will download a zip file containing the necessary images and config files for generating a dashboard.
                  Go to your Home Assistant software, and access the file manager. Once here, you can upload the config files which should override the currently existing files. Lastly, a lovelace dashboard file will be utilized To
                  create the dashboard in the application. </p>
              </div> 
            }
          </div> 
        </div>
      </div>
    </div>
  );
}

export default Guide;