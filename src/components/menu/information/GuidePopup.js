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

                <p>You can create a floorplan through the in-app functionality or by uploading your own images of your floor plan. This guide will
                  detail the process of developing your floor plan in regards towards Home Assistant. 
                </p>

                <ul><b>Navigation:</b>
                  <li><b>A: Create Canvas</b> - Creating a new blank or image-based canvas</li>
                  <li><b>B: Draw Floorplan</b> - Draw tools for developing floorplan: lines, squares, and circles.</li>
                  <li><b>C: Add Components and Furniture</b> - doorways, windows, and furniture</li>
                  <li><b>D: Marking Rooms</b> - labeling Rooms <b>NOTE:</b> Important for Home Assistant!</li>
                </ul>

                <div className='guide-section'>
                  <b>A: Create Canvas</b>
                  <p>You can create a canvas by selecting the <i>Create New</i> button in the top menu. You will be prompting to create a blank
                  canvas or create canvas from images. </p>
                  <u>Blank Canvas</u>
                  <p>By selecting blank canvas, you will be prompted to enter the dimensions and name for your floor plan. Once entered, you can select
                  Create Canvas and your blank canvas will be generated!</p>
                  <u>Canvas from Image</u>
                  <p>To upload a floorplan, you must have an image of each individual floor. Preferably, these images should be around the same size. In the popup screen,
                    you can add floors above and below the ground floor. The ground floor is considered the main floor for the home. If you have multiple floors, add the proper number
                    of floors and select the corresponding image for each floor. Once each image is selected, name the floorplan and create. If you do not need to draw your floor plan,
                    please refer to <b>Section D</b> which details marking rooms. This is an important process for Home Assistant.
                  </p>
                  <u>Floors</u>
                  <p>The left side of the canvas are the canvas controls. You can toggle the viewpoint of the existing floors and devices. You can also add or delete floors.
                    floors. As stated above, the "GR" is the ground or main floor. You can add up to four floors maximum above or below the main floor, for a total of five floors.
                    You can switch the view by clicking on each floor.
                  </p>
                </div>

                <div className='guide-section'>
                  <b>B: Draw Floorplan</b>
                  <p>There are three main draw tools available: lines, squares, and circles. When opening the draw menu, clicking on each button will toggle your draw mode.
                    When you select one, it will affect how you interact with the canvas. You can use this to draw lines and squares on the canvas. This will allow you to draw different rooms or walls.
                    You can also adjust the thickness of the line at the bottom of the draw menu. 
                  </p>
                  <p>
                    Once you draw a component, click the selected draw mode button to deactive it. You can now select on the object you drew in order to move, resize, rotate, and transform it.
                  </p>
                  <p>
                    <b>Tip:</b> Once you draw a circle, you can transform it to shape to to become an ellipse. You can also drag the resize option and flip the axis to mirror an image.
                  </p>
                </div>

                <div className='guide-section'>
                  <b>C: Add Components and Furniture</b>
                  <p>The components dropdown menu consists of various images that can be placed on the floor plan. The components help build the floor plan into
                    a home by utilizing doorways, windows, and furniture. By clicking on the desired object, it will be placed in the middle of the canvas. This can also be moved, rotated,
                    transformed, and resized. 
                  </p>
                </div>

                <div className='guide-section'>
                  <b>D: Marking Rooms</b>
                  <p>Marking rooms is an important feature found inside the <i>draw</i> menu. To begin, click on the mark room to active the canvas mode. Now, simply trace each room on the 
                  floor plan. A red line will appear over the path that is traced. When you connect back to the start point, the room selection will be created.</p>
                  <p>Once you create a room, you can access it's settings by clicking on the room and selecting the gear icon. From here, you can change the color of the space
                    and set it's name. It is important to label all rooms, especially where there are devices, as these will help assign the area id to each device.
                  </p>
                </div>
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
                <p>There are two main options for exporting your files. Through the export dropdown, you can choose to export for Home Assistant or export the PNGs. </p>
                <p>This guide will go over exporting your files for the purpose of Home Assistant. It will go over the structure of the export folder, and how to handle importing 
                  back into Home Assistant. </p>

                <ul><b>Navigation:</b>
                  <li><b>A: Export Structure</b> - the structure of the exported zip file</li>
                  <li><b>B: Import Config and Dashboard Files</b> - configuration files necessary for Home Assistant</li>
                  <li><b>C: Import Image Files</b> - adding floor plan images to Home Assistant</li>
                </ul>
                
                <div className='guide-section'>
                  <b>A: Export Structure</b>
                  <p>
                  The exported file is a zip folder. Inside the folder are three folders titled <b>media, core-registry-files, and yaml-files</b>. The media contains the exported
                  images of the floor plan. Each floor has its own image generated, and each floor will generate its own dashboard. The core-registry files are as described in
                  Step 2, the various configuration files necessary for controlling Home Assistant data. These will be utilized to assign labels and area-ids to specific devices based 
                  on your configurations made within Smart Floor Planner. </p>
                </div>

                <div className='guide-section'>
                  <b>B: Import Config and Dashboard Files</b>
                  <p>Once you have exported and downloaded the export zip file, right click the file and select <i>extract all</i>. This will exctract the contents of the zip folder
                  and create an export folder. Have this ready to individually upload files into Home Assistant. </p>
                  <p>To import the core configuration files, access Home Assistant and go to the <i>File Editor</i> add-on. Ensure that you can view the <b>.storage</b> folder by clicking on the folder
                  icon in the top-left of the Home Assistant OS screen. If you do not have the add-on, or you cannot find the .storage folder, please
                  reference <b>Step 2, Section B</b>. Click on the .storage file, and then click <i>Add File</i> button, which is the arrow up icon at the top of the screen.
                  Once you enter the add file popup, go to the Smart Floor Home export folder, <b>core-registry-files</b>, and select each file to upload. You may have
                  to upload one file at a time, so be sure you add all six files into Home Assistant.</p>
                  <p>For the Home Assistant yaml files, <b>press the back arrow to access the main folder.</b> Go to add files, and select the each file inside the
                  <b>yaml-files</b> folder. These are titled <b>scripts.yaml</b> and <b>configuration.yaml</b>. Once these files have been added, move to section C to add the images.</p>
                </div>

                <div className='guide-section'>
                  <b>C: Import Image Files</b>
                  <p>To import the floorplan images for the dashboard, you must select <i>add folder</i> at the top of the main directory inside the <i>file editor</i>.
                  Name the folder <b>www</b> and add the folder. Once added, navigate to the www folder and select it. Go to add files, and select on the <i>media</i> folder inside the exported
                  Smart Floor Planner folder. Select each individual image and upload it into home assistant.</p>
                </div>
                <p><b>NOTE:</b> Once you have completed sections B and C by adding the core configuration, lovelace, yaml files, and media images, click on the settings icon in the upper-right corner of the
                file editor. Navigate to Restart Home Assistant, and click restart. This will restart the software and utilize the new files you have uploaded. There should be a dashboard titled 
                <b>Smart Home</b> with a home icon in the sidebar. This is the dashboard generated for your smart home!</p>
              </div> 
            }
          </div> 
        </div>
      </div>
    </div>
  );
}

export default Guide;