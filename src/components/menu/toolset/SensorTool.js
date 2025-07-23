import { useState, useEffect } from 'react';
import DeviceSettings from './DeviceSettings';
import '../../css/Tools.css';
import '../../css/Popup.css';
import {Sensor, Lorawan, Zigbee} from '../../../icons/index'

function SensorTool({onCanvasDevice, onDeviceToggle, onDeviceList, onOriginalDeviceList, deviceList, onLabelList, labelList, onDeviceRegistry, onEntityRegistry}) {

  const [devices, setDevices] = useState(null);
  const [entities, setEntities] = useState(null);
  const [activeValue, setActiveValue] = useState(null);
  const [activeDevice, setActiveDevice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [buttonToggle, setButtonToggle] = useState(false);
  const [coreDeviceFile, setCoreDeviceFile] = useState(false);
  const [coreEntityFile, setCoreEntityFile] = useState(false);

  const settingsMode = 'tool'

  function togglePopup(value, device) {
    if (value === null) {
      setErrorMessage(null);
    }
    setActiveValue(value);

    if (device !== null) {
      setActiveDevice(device)
    }
  };

  function generateType(entityString) {
    if (entityString.toLowerCase().includes('binary')) {
      return 'Binary'
    } else if (entityString.toLowerCase().includes('switch')){
      return 'Switch'
    } else if (entityString.toLowerCase().includes('button')){
      return 'Button'
    } else if (entityString.toLowerCase().includes('siren')){
      return 'Siren'
    } else {
      return 'Unknown'
    }
  };

  const locationWords = ["motion","digital","binary","pressure","light","occupancy","rad"]
  const activityWords = ["vdd","current","energy","power","voltage","button"]
  const environmentWords = ["temp", "humid"]
  
  function generateLabel(entityString) {

    if (locationWords.some(str => entityString.toLowerCase().includes(str))) {
      return 'location'
    } else if (activityWords.some(str => entityString.toLowerCase().includes(str))){
      return 'activity'
    } else if (environmentWords.some(str => entityString.toLowerCase().includes(str))){
      return 'environment'
    } else {
      return ''
    }
  }

  function generateSensors() {
      
    const deviceReader = new FileReader();

    deviceReader.onload = (e) => {
      const text = JSON.parse(e.target.result);
      onDeviceRegistry(text)
      const deviceData = text.data.devices;

      const deviceMap = deviceData.filter(d => d.identifiers[0] && (d.identifiers[0][0] === 'thethingsnetwork' || d.identifiers[0][0] === 'zha'))
      .map((d) => ({
        id: d.id,
        original_name:  d.name,
        name: d.name,
        platform: d.identifiers[0][0],
        isActive: false,
        area_id: null,
      }));
      setDevices(deviceMap);
    }
    deviceReader.readAsText(coreDeviceFile)
      
    const entityReader = new FileReader();

    entityReader.onload = (e) => {
      const text = JSON.parse(e.target.result);
      onEntityRegistry(text)
      const entityData = text.data.entities;

      const entityMap = entityData.filter(en => en.platform === 'zha' || en.platform === 'thethingsnetwork')
      .map((en) => ({
        id: en.id,
        device_id: en.device_id,
        original_name: en.entity_id,
        name: en.entity_id,
        platform: en.platform,
        type: en.original_name? en.original_name : generateType(en.entity_id),
        label: generateLabel(en.original_name? en.original_name : generateType(en.entity_id)),
        visible: false,
        tag: null,
      }));
      setEntities(entityMap);
    };
    entityReader.readAsText(coreEntityFile)  
  };

  function checkDevice(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.name === 'core.device_registry') {
        setCoreDeviceFile(file);
        setErrorMessage(null);
      }  else {
        setErrorMessage("This file is not DEVICE_REGISTRY")
        setCoreDeviceFile(null);
      }
    }
  };

  function checkEntity(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.name === 'core.entity_registry') {
        setCoreEntityFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage("This file is not  ENTITY_REGISTRY")
        setCoreEntityFile(null);
      }
    }
  };

  useEffect(() => {

    if (coreDeviceFile && coreEntityFile) {
      setButtonToggle(true);
    } else {
      setButtonToggle(false);
    }

  }, [coreDeviceFile, coreEntityFile]);

  useEffect(() => {
    if (devices && entities) {
      const joinDevices = devices.map(d => {
        const joinEntities = entities.filter(en => en.device_id === d.id);
        return {
          ...d,
          entities: joinEntities
        };
      });

      onDeviceList(joinDevices);
      onOriginalDeviceList(structuredClone(joinDevices));
      onLabelList(["", "location", "activity", "environment"])

      setActiveValue(null);
      setDevices(null);
      setEntities(null);
    }
  }, [devices, entities, onDeviceList, onOriginalDeviceList, onLabelList, coreDeviceFile, coreEntityFile, onDeviceRegistry, onEntityRegistry]);

  return (
    <div className="box">
      <div className='head-container'>
        <img src={Sensor} className="menu-icon" alt="logo"/><p><b>Sensors</b></p>
      </div>

      {!deviceList && 
        <div>
          <button onClick={() => togglePopup('upload')}>Upload Devices</button>
        </div>
      }

      {deviceList &&
        <div>
          <div className='content-grid'>
              <p><b>LoRaWAN Sensors</b></p>
              {deviceList.filter(device => device.platform === "thethingsnetwork").map((device) => (
                <button key={device.id} className={device.isActive ? "input-off" : "input-on "} onClick={() => togglePopup('device-config', device)} disabled={device.isActive}>
                  <img src={Lorawan} className="menu-icon" alt="logo"/>{device.name} {device.isActive && <p style={{color: 'green'}}>active</p>}
                </button>
              ))}
          </div>
          <div className='content-grid'>
            <p><b>ZigBee Sensors</b></p>
            {deviceList.filter(device => device.platform === "zha").map((device) => (
              <button key={device.id} className={device.isActive ? "input-off" : "input-on "} onClick={() => togglePopup('device-config', device)} disabled={device.isActive}>
                <img src={Zigbee} className="menu-icon" alt="logo"/>{device.name} {device.isActive && <p style={{color: 'green'}}>active</p>}
              </button>
            ))}
          </div>
        </div>
      }

      {activeValue === 'upload' &&
        <div className="filter" onClick={() => togglePopup(null)}>
          <div className="small-frame" onClick={e => e.stopPropagation()}>
            <div className='exit'>
              <button onClick={() => togglePopup(null)}>X</button>
            </div>
            <h2>Upload Core Registry Data</h2>
            <div className='popup-content'><p>In order to create sensors relevant towards your project, please download and upload the core DEVICE_REGISTRY and
              ENTITY_REGISTRY files from your home assistant project.</p>
              <div className='vertical-display'>
                <p>Upload files:</p>
                <label><b>core.device_registry:</b> <input type='file' onChange={checkDevice} /></label>
                <label><b>core.entity_registry:</b><input type='file' onChange={checkEntity} /></label>
              </div>
              {errorMessage && (
                <p style={{color: 'red'}}>{errorMessage}</p>
              )}
              <div className='create-button'>
                <button onClick={() => generateSensors()} disabled={!buttonToggle}>Generate Sensors</button>
              </div>
            </div> 
          </div>
        </div>
      }

      {activeValue === 'device-config' &&
        <DeviceSettings settingsMode={settingsMode} activeDevice={activeDevice} deviceList={deviceList} onTogglePopup={togglePopup} onCanvasDevice={onCanvasDevice} onDeviceToggle={onDeviceToggle} onDeviceList={onDeviceList} onLabelList={onLabelList} labelList={labelList}/>
      }
    </div>
  );
}

export default SensorTool;