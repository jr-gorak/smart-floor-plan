import ReactDOM from 'react-dom';
import { useState } from 'react';
import '../../css/Tools.css';
import '../../css/Popup.css';
import {Sensor, Lorawan, Zigbee, Thermometer, Battery, Person, LightOff, Co2, Voltage, Humidity, Pressure, Sound, Motion, WindowClosed, Component} from '../../../icons/index'

function DeviceSettings({settingsMode, activeDevice, deviceList, onTogglePopup, onUpdateDeviceToggle, onCanvasDevice, onDeviceToggle, onDeviceList, onUpdatedDevice, labelList}) {

  const [activeInput, setActiveInput] = useState(null);
  const [device, setDevice] = useState(activeDevice);
  const [inputToggle, setInputToggle] = useState(false);
  const [activeEntity, setActiveEntity] = useState(null);
  const [newLabel, setNewLabel] = useState("")
  
  document.body.style.overflow = 'hidden';
  
  function toggleHandle() {
    document.body.style.overflow = 'auto';
    if (settingsMode === 'tool') {
      onTogglePopup(null);
    } else if (settingsMode === 'canvas') {
      onTogglePopup();
    }
  };

  function updateDevice(classifier, id, value) {
    if (classifier === 'device') {
      activeDevice.name = value;
    } else if (classifier === 'entity-label') {
      const entity = activeDevice.entities.find(d => d.id === id)
      entity.name = value;
    } else if (classifier === 'entity-visible') {
      const entity = activeDevice.entities.find(d => d.id === id)
      entity.visible = value;
    } else if (classifier === 'type') {
      const entity = activeDevice.entities.find(e => e.id === id)
      const index = device.entities.findIndex(e => e.id === id)
      const stacheDevice = {...device};
      entity.type = value;
      stacheDevice.entities[index].type = value;
      setDevice(stacheDevice);
    } else if (classifier === 'label' && value === 'input') {
      setInputToggle(true);
      const entity = activeDevice.entities.find(e => e.id === id);
      setActiveEntity(entity);
      return;
    }
    else if (classifier === 'label') {
      const entity = activeDevice.entities.find(e => e.id === id)
      entity.label = value;
    }
  };

  function filterImage(type) {
    if (type == null) {
      return;
    } else if (type.toLowerCase().includes('temp')) {
      return Thermometer;
    } else if (type.toLowerCase().includes('occupancy')) {
      return Person;
    } else if (type.toLowerCase().includes('battery')) {
      return Battery;
    } else if (type.toLowerCase().includes('light')) {
      return LightOff;
    } else if (type.toLowerCase().includes('co2')) {
      return Co2;
    } else if (type.toLowerCase().includes('volt') || type.toLowerCase().includes('vdd')) {
      return Voltage;
    } else if (type.toLowerCase().includes('humidity')) {
      return Humidity;
    } else if (type.toLowerCase().includes('pressure')) {
      return Pressure;
    } else if (type.toLowerCase().includes('sound')) {
      return Sound;
    } else if (type.toLowerCase().includes('motion')) {
      return Motion;
    } else if (type.toLowerCase().includes('door')) {
      return Component;
    } else if (type.toLowerCase().includes('window')) {
      return WindowClosed;
    } else {
      return Sensor;
    }
  };

  function addDevice() {
    activeDevice.isActive = true;
    onDeviceList(deviceList);
    onCanvasDevice(activeDevice);
    onDeviceToggle();
    toggleHandle();
  };

  function saveUpdateDevice() {
    const updatedDeviceList = [...deviceList];
    onDeviceList(updatedDeviceList);
    onUpdatedDevice(activeDevice);
    onUpdateDeviceToggle();
    toggleHandle();
  };

  function addNewLabel() {
    if(newLabel && !labelList.includes(newLabel)) {
      labelList.push(newLabel.toLowerCase());
      const index = device.entities.findIndex(e => e.id === activeEntity.id)
      const stacheDevice = {...device};
      device.entities[index].label = newLabel;
      setDevice(stacheDevice);
      setInputToggle(false);
      setActiveEntity(null);
    } 
  }

  function resetLabel() {
    setInputToggle(false)
    setActiveEntity(null)
  }

  return ReactDOM.createPortal(
    <div className="filter" onClick={() => toggleHandle()}>
      <div className="small-frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={() => toggleHandle()}>X</button>
        </div>

        <h2 style={{alignItems: 'center'}}>
        {activeDevice.platform === "thethingsnetwork" && <img style={{width: 40}} src={Lorawan} className="menu-icon" alt="logo"/>}
        {activeDevice.platform === "zha" && <img style={{width: 40}} src={Zigbee} className="menu-icon" alt="logo"/>}
        <input className={activeInput === activeDevice.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(activeDevice.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={activeDevice.name} onChange={(e) => updateDevice('device', activeDevice.id, e.target.value)}></input></h2>
        <div className='popup-content'>

          <div className='device-info'><div className='info-tooltip' title='The original name of the sensor. Click on header name above to change the name of the device.'>🛈</div><b>Original Name: </b>{activeDevice.original_name}</div>
          <div className='device-info'><div className='info-tooltip' title='The device branding. This application only supports LoRaWAN and Zigbee sensors.'>🛈</div><b>Platform:</b> {activeDevice.platform}</div>
          <div className='device-info'><div className='info-tooltip' title='The marked room that the device is located. Use "mark room" in the "Draw" menu to trace and label rooms. Then, drag the device to the desired position'>🛈</div><b>Area ID:</b> {activeDevice.area_id}</div>

          <div className='sensor-list'>
            <p><b>Sensors:</b></p>
            <table>      
              <thead>        
                <tr>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Click on the name of a sensor to edit it.'>🛈</div><p>Name</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Click on the checkbox for the sensors you wish to use for the device.'>🛈</div><p>Active</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='The type of sensor, for binary based readings you can specify their purpose.'>🛈</div><p>Type</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Select a label type for tracking data. Location: timeline of where an individual has been. Activity: measures an activity an individual is performing. Environment: measures the environment of the room'>🛈</div><p>Label</p></div></th>
                </tr> 
              </thead>
              <tbody>
                {activeDevice.entities.map((ent) => (
                  <tr key={ent.id}>
                    <td style={{width: `${45}%`}}><input style={{width: `${100}%`}} className={activeInput === ent.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(ent.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={ent.name} onChange={(e) => updateDevice('entity-label', ent.id, e.target.value)}></input></td>
                    <td style={{width: `${10}%`}}><input className='checkbox' type="checkbox" defaultChecked={ent.visible} onChange={(e) => updateDevice('entity-visible', ent.id, e.target.checked)}/></td>
                    <td style={{width: `${20}%`}}>
                      <div className='sensor-display'>
                        <img src={filterImage(ent.type)} alt='sensor type icon'></img>
                        {(ent.type.toLowerCase() !== 'digital' && ent.type.toLowerCase() !== 'binary' && ent.type.toLowerCase() !== 'door' && ent.type.toLowerCase() !== 'window') && (
                          ent.type
                        )}

                        {(ent.type.toLowerCase() === 'digital' || ent.type.toLowerCase() === 'binary' || ent.type.toLowerCase() === 'door' || ent.type.toLowerCase() === 'window') && (
                        <select key={ent.id} onChange={(e) => updateDevice('type', ent.id, e.target.value)}>
                          <option value={ent.type}>{ent.type}</option>
                          {ent.type !== 'door' && (
                            <option value='door'>door</option>
                          )}
                          {ent.type !== 'window' && (
                            <option value='window'>window</option>
                          )}
                           
                        </select>
                        )}
                      </div>
                    </td>
                    <td style={{width: `${15}%`}}>
                      <select defaultValue={ent.label} onChange={(e) => updateDevice('label', ent.id, e.target.value)}>
    
                      {labelList.map((label) => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                        <option value='input'>...add label</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inputToggle && (
              <div className="filter" onClick={() => resetLabel()}>
                <div className="new-label-frame" onClick={e => e.stopPropagation()}>
                  <div className='exit'>
                    <button onClick={() => resetLabel()}>X</button>
                  </div>
                  <div className='popup-content'>
                    <h2>Add New Label</h2> 
                    <p>Please enter your new label name below.</p>
                    <input type='text' value={newLabel} onChange={(e) => setNewLabel(e.target.value)}></input>
                    <button onClick={() => addNewLabel()}>Save</button>
                  </div>
                </div>
              </div>
          )}
            
          </div>

          {settingsMode === 'tool' &&
            <button onClick={() => addDevice()}>Add Device</button>
          }

          {settingsMode === 'canvas' &&
            <button onClick={() => saveUpdateDevice()}>Update Device</button>
          }
                
        </div>
      </div>
    </div>,
  document.getElementById('popup-container'))
}

export default DeviceSettings;