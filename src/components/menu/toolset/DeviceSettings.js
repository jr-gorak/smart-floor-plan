import ReactDOM from 'react-dom';
import { useState } from 'react';
import '../../css/Tools.css';
import '../../css/Popup.css';
import { deviceImages } from '../../../icons/index'

function DeviceSettings({ settingsMode, activeDevice, deviceList, onTogglePopup, onUpdateDeviceToggle, onCanvasDevice, onDeviceToggle, onDeviceList, onUpdatedDevice, labelList }) {

  const [activeInput, setActiveInput] = useState(null);
  const [device, setDevice] = useState(activeDevice);
  const [inputToggle, setInputToggle] = useState(false);
  const [helpToggle, setHelpToggle] = useState(false);
  const [activeEntity, setActiveEntity] = useState(null);
  const [selectLabel, setSelectLabel] = useState(false);
  const [selectLabelID, setSelectLabelID] = useState(null)
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
      const stacheDevice = { ...device };
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
      return deviceImages['thermometer'].src;
    } else if (type.toLowerCase().includes('occupancy')) {
      return deviceImages['person'].src;
    } else if (type.toLowerCase().includes('battery')) {
      return deviceImages['battery'].src;
    } else if (type.toLowerCase().includes('light') || type.toLowerCase().includes('lux')) {
      return deviceImages['light'].src;
    } else if (type.toLowerCase().includes('co2')) {
      return deviceImages['co2'].src;
    } else if (type.toLowerCase().includes('current')) {
      return deviceImages['electric'].src;
    } else if (type.toLowerCase().includes('humidity')) {
      return deviceImages['humidity'].src;
    } else if (type.toLowerCase().includes('pressure')) {
      return deviceImages['pressure'].src;
    } else if (type.toLowerCase().includes('sound')) {
      return deviceImages['sound'].src;
    } else if (type.toLowerCase().includes('motion')) {
      return deviceImages['motion'].src;
    } else if (type.toLowerCase().includes('door')) {
      return deviceImages['door'].src;
    } else if (type.toLowerCase().includes('window')) {
      return deviceImages['window'].src;
    } else if (type.toLowerCase().includes('toaster')) {
      return deviceImages['toaster'].src;
    } else if (type.toLowerCase().includes('kettle')) {
      return deviceImages['kettle'].src;
    } else if (type.toLowerCase().includes('microwave')) {
      return deviceImages['microwave'].src;
    } else if (type.toLowerCase().includes('blender')) {
      return deviceImages['blender'].src;
    } else if (type.toLowerCase().includes('tv')) {
      return deviceImages['tv'].src;
    } else if (type.toLowerCase().includes('cupboard')) {
      return deviceImages['cupboard'].src;
    } else if (type.toLowerCase().includes('faucet')) {
      return deviceImages['faucet'].src;
    } else if (type.toLowerCase().includes('shower')) {
      return deviceImages['shower'].src;
    } else if (type.toLowerCase().includes('seat')) {
      return deviceImages['seat'].src;
    } else if (type.toLowerCase().includes('bed')) {
      return deviceImages['bed'].src;
    } else {
      return deviceImages['sensor'].src;
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
    if (newLabel && !labelList.includes(newLabel)) {
      labelList.push(newLabel.toLowerCase());
      const index = device.entities.findIndex(e => e.id === activeEntity.id)
      activeDevice.entities[index].label.push(newLabel);
      setDevice(structuredClone(activeDevice));
      setInputToggle(false);
      setActiveEntity(null);
      setNewLabel("");
      setSelectLabel(false);
      setSelectLabelID(null);
    }
  }

  function resetLabel() {
    setInputToggle(false)
    setActiveEntity(null)
  }

  function selectToggle(id, activeID) {
    if (id === activeID) {
      setSelectLabel(false);
      setSelectLabelID(null);
      return;
    }
    setSelectLabel(true);
    setSelectLabelID(id);

  }

  function checkLabel(label, labelList) {
    if (labelList.includes(label)) {
      return true;
    }
  }

  function addLabel(value, id) {
    const entity = activeDevice.entities.find(e => e.id === id)
    entity.label.push(value);
    setDevice(structuredClone(activeDevice));
    setSelectLabel(false);
    setSelectLabelID(null);
  }

  function removeLabel(value, id) {
    const entity = activeDevice.entities.find(e => e.id === id)
    const index = entity.label.indexOf(value);
    entity.label.splice(index, 1);
    setDevice(structuredClone(activeDevice))
  }

  return ReactDOM.createPortal(
    <div className="filter" onClick={() => toggleHandle()}>
      <div className="small-frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={() => toggleHandle()}>X</button>
        </div>

        <h2 style={{ alignItems: 'center' }}>
          {device.platform === "thethingsnetwork" && <img style={{ width: 40 }} src={deviceImages['lorawan'].src} className="menu-icon" alt="logo" />}
          {device.platform === "zha" && <img style={{ width: 40 }} src={deviceImages['zigbee'].src} className="menu-icon" alt="logo" />}
          <input className={activeInput === device.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(device.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={device.name} onChange={(e) => updateDevice('device', device.id, e.target.value)}></input></h2>
        <div className='popup-content'>

          <div className='device-info'><div className='info-tooltip' title='The original name of the sensor. Click on header name above to change the name of the device.'>🛈</div><b>Original Name: </b>{device.original_name}</div>
          <div className='device-info'><div className='info-tooltip' title='The device branding. This application only supports LoRaWAN and Zigbee sensors.'>🛈</div><b>Platform:</b> {device.platform}</div>
          <div className='device-info'><div className='info-tooltip' title='The marked room that the device is located. Use "mark room" in the "Draw" menu to trace and label rooms. Then, drag the device to the desired position'>🛈</div><b>Area ID:</b> {device.area_id}</div>
          <div className='upper-device-buttons'>
            <div>
              {settingsMode === 'tool' &&
                <button onClick={() => addDevice()}>Add Device</button>
              }

              {settingsMode === 'canvas' &&
                <button onClick={() => saveUpdateDevice()}>Update Device</button>
              }
            </div>
            <div>
              <button onClick={() => setHelpToggle(true)}>Help</button>
            </div>
          </div>


          <div className='sensor-list'>
            <p><b>Sensors:</b></p>
            <table>
              <thead>
                <tr>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Click on the name of a sensor to edit it.'>🛈</div><p>Name</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Click on the checkbox for the sensors you wish to use for the device.'>🛈</div><p>Active</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='The type of sensor, for binary based readings you can specify their purpose.'>🛈</div><p>Type</p></div></th>
                  <th><div className='sensor-header'><div className='info-tooltip' title='Select a label type for tracking data. Location: timeline of where an individual has been. Activity: measures an activity an individual is performing. Environment: measures the environment of the room'>🛈</div><p>Labels</p></div></th>
                </tr>
              </thead>
              <tbody>
                {device.entities.map((ent) => (
                  <tr key={ent.id}>
                    <td style={{ width: `${35}%` }}><input style={{ width: `${100}%` }} className={activeInput === ent.id ? 'input-on' : 'input-off'} onFocus={() => setActiveInput(ent.id)} onBlur={() => setActiveInput(null)} type='text' defaultValue={ent.name} onChange={(e) => updateDevice('entity-label', ent.id, e.target.value)}></input></td>
                    <td style={{ width: `${10}%` }}><input className='checkbox' type="checkbox" defaultChecked={ent.visible} onChange={(e) => updateDevice('entity-visible', ent.id, e.target.checked)} /></td>
                    <td style={{ width: `${20}%` }}>
                      <div className='sensor-display'>
                        <img src={filterImage(ent.type)} alt='sensor type icon'></img>
                        {(ent.type.toLowerCase() !== 'digital' && ent.type.toLowerCase() !== 'binary' && ent.type.toLowerCase() !== 'door' && ent.type.toLowerCase() !== 'window' && ent.type.toLowerCase() !== 'current'
                          && ent.type.toLowerCase() !== 'microwave' && ent.type.toLowerCase() !== 'toaster' && ent.type.toLowerCase() !== 'kettle' && ent.type.toLowerCase() !== 'blender' && ent.type.toLowerCase() !== 'tv'
                          && ent.type.toLowerCase() !== 'cupboard' && ent.type.toLowerCase() !== 'shower' && ent.type.toLowerCase() !== 'faucet' && ent.type.toLowerCase() !== 'flood' && ent.type.toLowerCase() !== 'seat' && ent.type.toLowerCase() !== 'bed' && !ent.type.toLowerCase().includes('status')) && (
                            ent.type
                          )}

                        {(ent.type.toLowerCase() === 'digital' || ent.type.toLowerCase() === 'binary' || ent.type.toLowerCase() === 'door' || ent.type.toLowerCase() === 'window' || ent.type.toLowerCase() === 'cupboard') && (
                          <select key={ent.id} onChange={(e) => updateDevice('type', ent.id, e.target.value)}>
                            <option value={ent.type}>{ent.type}</option>
                            {ent.type !== 'door' && (
                              <option value='door'>door</option>
                            )}
                            {ent.type !== 'window' && (
                              <option value='window'>window</option>
                            )}
                            {ent.type !== 'cupboard' && (
                              <option value='cupboard'>cupboard</option>
                            )}
                          </select>
                        )}

                        {(ent.type.toLowerCase() === 'current' || ent.type.toLowerCase() === 'toaster' || ent.type.toLowerCase() === 'kettle' || ent.type.toLowerCase() === 'microwave' || ent.type.toLowerCase() === 'blender'
                          || ent.type.toLowerCase() === 'tv') && (
                            <select key={ent.id} onChange={(e) => updateDevice('type', ent.id, e.target.value)}>
                              <option value={ent.type}>{ent.type}</option>
                              {ent.type !== 'kettle' && (
                                <option value='kettle'>kettle</option>
                              )}
                              {ent.type !== 'microwave' && (
                                <option value='microwave'>microwave</option>
                              )}
                              {ent.type !== 'toaster' && (
                                <option value='toaster'>toaster</option>
                              )}
                              {ent.type !== 'blender' && (
                                <option value='blender'>blender</option>
                              )}
                              {ent.type !== 'tv' && (
                                <option value='tv'>tv</option>
                              )}
                              {ent.type !== 'current' && (
                                <option value='current'>current</option>
                              )}
                            </select>
                          )}

                        {(ent.type.toLowerCase() === 'flood' || ent.type.toLowerCase() === 'shower' || ent.type.toLowerCase() === 'faucet') && (
                          <select key={ent.id} onChange={(e) => updateDevice('type', ent.id, e.target.value)}>
                            <option value={ent.type}>{ent.type}</option>
                            {ent.type !== 'shower' && (
                              <option value='shower'>shower</option>
                            )}
                            {ent.type !== 'faucet' && (
                              <option value='faucet'>faucet</option>
                            )}
                            {ent.type !== 'flood' && (
                              <option value='flood'>flood</option>
                            )}
                          </select>
                        )}

                        {(ent.type.toLowerCase().includes('status') || ent.type.toLowerCase() === 'seat' || ent.type.toLowerCase() === 'bed') && (
                          <select key={ent.id} onChange={(e) => updateDevice('type', ent.id, e.target.value)}>
                            <option value={ent.type}>{ent.type}</option>
                            {ent.type !== 'seat' && (
                              <option value='seat'>seat</option>
                            )}
                            {ent.type !== 'bed' && (
                              <option value='bed'>bed</option>
                            )}
                          </select>
                        )}

                      </div>
                    </td>

                    <td style={{ width: `${25}%` }}>
                      <div className='label-view'>
                        <div className='add-label'>
                          <button title='Add Label' onClick={() => selectToggle(ent.id, selectLabelID)}>+</button>
                        </div>

                        {selectLabel && (selectLabelID === ent.id) && (
                          <div className='select-dropdown'>
                            <div>
                              {labelList.map((label) => (
                                <button onClick={() => addLabel(label, ent.id)} disabled={checkLabel(label, ent.label)}>{label}</button>
                              ))}
                              <button onClick={() => { setInputToggle(true); setActiveEntity(ent) }}>new label...</button>
                            </div>
                          </div>
                        )}

                        {ent.label.map((text) => (
                          <div>
                            {text && (
                              <div className='bubble'>
                                {text}
                                <button onClick={() => removeLabel(text, ent.id)} title='Remove Label'>x</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
            {helpToggle && (
              <div className="filter" onClick={() => setHelpToggle(false)}>
                <div className="new-label-frame" onClick={e => e.stopPropagation()}>
                  <div className='exit'>
                    <button onClick={() => setHelpToggle(false)}>X</button>
                  </div>
                  <div className='popup-content'>
                    <h2>Device Settings Help</h2>
                    <p>Device settings are important for configuring relevant settings for generating smart home dashboards on Home Assistant.</p>
                    <p>For a more in-depth guide, please view the <i>How to Use</i> guide, step 2.</p>
                    <p><b>Header: </b> Device name. Click on the header to rename the device.</p>
                    <p><b>Original Name: </b> Device's original name.</p>
                    <p><b>Platform: </b> Platform where device is hosted.</p>
                    <p><b>Area ID: </b> Location where device is placed on the floor plan.</p>
                    <p><b>Sensor Name: </b>Name for a sensor, or entity, of a device. <u>Double click the name to change</u></p>
                    <p><b>Active: </b> Only sensors marked as active will be used for dashboard generation on export.</p>
                    <p><b>Type: </b> The type of data the sensor collects.</p>
                    <p><b>Label: </b> Labels which can be used for further customization in Home Assistant. <u>Location</u> tracks the location of individuals.
                      <u> Activity</u> monitors activities performed. <u> Ambient</u> monitors the conditions of the rooms.</p>
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