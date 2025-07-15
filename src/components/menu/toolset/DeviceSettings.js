import ReactDOM from 'react-dom';
import { useState } from 'react';
import '../../css/Tools.css';
import '../../css/Popup.css';
import {Sensor, Lorawan, Zigbee, Thermometer, Battery, Person, LightOff, Co2, Voltage, Humidity, Pressure, Sound, Motion} from '../../../icons/index'

function DeviceSettings({settingsMode, activeDevice, deviceList, onTogglePopup, onUpdateDeviceToggle, onCanvasDevice, onDeviceToggle, onDeviceList, onUpdatedDevice}) {

  const [activeInput, setActiveInput] = useState(null);
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
      activeDevice.label = value;
    } else if (classifier === 'entity-label') {
      const findEntities = activeDevice.entities.find(d => d.id === id)
      findEntities.label = value;
    } else if (classifier === 'entity-visible') {
      const findEntities = activeDevice.entities.find(d => d.id === id)
      findEntities.visible = value;
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

  return ReactDOM.createPortal(
    <div className="filter" onClick={() => toggleHandle()}>
      <div className="small-frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={() => toggleHandle()}>X</button>
        </div>

        <h2 style={{alignItems: 'center'}}>
        {activeDevice.platform === "thethingsnetwork" && <img style={{width: 40}} src={Lorawan} className="menu-icon" alt="logo"/>}
        {activeDevice.platform === "zha" && <img style={{width: 40}} src={Zigbee} className="menu-icon" alt="logo"/>}
        <input className={activeInput === activeDevice.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(activeDevice.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={activeDevice.label} onChange={(e) => updateDevice('device', activeDevice.id, e.target.value)}></input></h2>
        <div className='popup-content'>

          <p><b>Original Name: </b>{activeDevice.name}</p>
          <p><b>Platform:</b> {activeDevice.platform}</p>
          <p><b>Area ID:</b> {activeDevice.area_id}</p>

          <div className='sensor-list'>
            <p><b>Sensors:</b></p>
            <table>      
              <thead>        
                <tr>
                  <th>Name</th>
                  <th>Visible</th>
                  <th>Type</th>
                </tr> 
              </thead>
              <tbody>
                {activeDevice.entities.map((ent) => (
                  <tr key={ent.id}>
                    <td style={{width: `${50}%`}}><input style={{width: `${100}%`}} className={activeInput === ent.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(ent.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={ent.label} onChange={(e) => updateDevice('entity-label', ent.id, e.target.value)}></input></td>
                    <td style={{width: `${10}%`}}><input className='checkbox' type="checkbox" defaultChecked={ent.visible} onChange={(e) => updateDevice('entity-visible', ent.id, e.target.checked)}/></td>
                    <td style={{width: `${30}%`}}><div className='sensor-display'><img src={filterImage(ent.type)} alt='sensor type icon'></img>{ent.type}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
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