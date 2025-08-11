import { useState } from 'react';
import '../../css/Dropdown.css';
import * as fabric from "fabric";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import yaml from 'js-yaml';

function ExportDropdown({canvasData, canvasState, canvasInfo, activeDropdown}) {

  const { canvasWidth, canvasHeight, canvasName, entityRegistry, deviceRegistry } = canvasInfo
  const { deviceList, labelList, floorData, floorArray } = canvasData
  const { activeCanvas } = canvasState

  const [hideRooms, setHideRooms] = useState(false);
  const [hideLabels, setHideLabels] = useState(false);

  var zip = new JSZip();

  const floorMap = {
    "4B" : "Basement Four",
    "3B" : "Basement Three",
    "2B" : "Basement Two",
    "1B" : "Basement One",
    "GR" : "Ground",
    "1F" : "Floor One",
    "2F" : "Floor Two",
    "3F" : "Floor Three",
    "4F" : "Floor Four"
  }

  async function generateImages(purpose) {
    const dataLength = Object.keys(floorData).length;
    let processedFiles = 0;

    return new Promise((resolve) => {
      Object.entries(floorData).forEach(([key, data]) => {
        let finishedDownloading = false;

        if (data.objects.length === 0) {
          processedFiles++
          return;
        }

        const canvas = new fabric.Canvas(null, {
          width: canvasWidth,
          height: canvasHeight,
        });

        canvas.loadFromJSON(data, () => {
          if (finishedDownloading) return;
          setTimeout(() => {
            canvas.backgroundColor = "white";
            canvas.getObjects().filter(obj => obj.classifier === 'device' || obj.classifier === 'sensor').forEach(obj => {
              obj.visible = false;
            })
            if (hideRooms) {
            canvas.getObjects().filter(obj => obj.classifier === 'mark').forEach(obj => {
              obj.visible = false;
            })

            }
            if (hideLabels) {
            canvas.getObjects().filter(obj => obj.classifier === 'text').forEach(obj => {
              obj.visible = false;
            })
          }
          }, 0)

          canvas.renderAll();

          if (dataLength === 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({format: 'png'})
              const fileName =  `${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`;

              if (purpose === 'images') {
                const link = document.createElement('a');
                link.href = floorplanPNG;
                link.download = fileName;
                link.click();
              } else if (purpose === 'home-assistant') {
                zip.folder('media').file(fileName, floorplanPNG.split(',')[1], {base64: true})
                resolve();
              }
            }, 0)
          } else if (dataLength > 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({format: 'png'})
              const fileName =  `${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`;
              zip.folder('media').file(fileName, floorplanPNG.split(',')[1], {base64: true})
              processedFiles++

              if (processedFiles === dataLength && purpose === 'images') {
                zip.generateAsync({type: 'blob'}).then((blob) => {
                  saveAs(blob, `${canvasName.toLowerCase().replace(/ /g, '_')}_images.zip`)
                  zip = new JSZip();
                  resolve();
                });

              } else if (processedFiles === dataLength && purpose === 'home-assistant') {
                resolve();
              }
                
            }, 0)
          }
          finishedDownloading = true;
        })
      })
    })
  }

  async function fetchScriptYaml() {
    const file = await fetch('/files/scripts.yaml')
    const yamlText = file.text();
    zip.folder('yaml-files').file('scripts.yaml', yamlText);
  }

  async function generateJsonFiles() {
    function calculateLevel(floor) {
      if (floor.includes("GR")) {
        return 0
      } else if (floor.includes("F")) {
        return parseInt(floor.slice(0));
      } else if (floor.includes("B")) {
        return -parseInt(floor.slice(0));
      }
    }

    function generateFloorData() {
      const dataArray = [];

      for (const i in floorArray) {
        const floorData = {
          aliases: [],
          floor_id: floorArray[i],
          icon: null,
          level: calculateLevel(floorArray[i]),
          name: floorMap[floorArray[i]],
          created_at: new Date().toISOString().replace("Z","+00:00"),
          modified_at: new Date().toISOString().replace("Z","+00:00"),
        }
        dataArray.push(floorData)
        }
        return dataArray;
      }

    function generateAreaData() {
      const dataArray = [];

      for (const key in floorData) {
        const data = floorData[key];
        const areaData = data.objects.filter(obj => obj.classifier === 'mark').map(obj => ({
          aliases: [],
          floor_id: key,
          humidity_entity_id: null,
          icon: null,
          id: obj.area_id,
          labels: [],
          name: data.objects.find(room => room.classifier === 'text' && room.area_id === obj.id).text,
          picture: null,
          temperature_entity_id: null,
          created_at: new Date().toISOString().replace("Z","+00:00"),
          modified_at: new Date().toISOString().replace("Z","+00:00"),
        }))
        dataArray.push(...areaData);
      }
      return dataArray;
    }

    function generateLabelData() {
      const dataArray = [];

      for (const i in labelList) {
        if (labelList[i] !== "") {
          const labelData = {
            color: null,
            description: null,
            icon: null,
            label_id: labelList[i].toLowerCase().replace(/ /g, '_'),
            name: labelList[i],
            created_at: new Date().toISOString().replace("Z","+00:00"),
            modified_at: new Date().toISOString().replace("Z","+00:00"),
          }
          dataArray.push(labelData)
        } 
      }
      return dataArray;
    }

    function updateRegistries() {
      for (const device in deviceList) {
        const deviceData = deviceList[device]
        const deviceId = deviceData.id;
        const coreDevice = deviceRegistry.data.devices.find(device => device.id === deviceId)
        coreDevice.area_id = deviceData.area_id;
        coreDevice.name_by_user = deviceData.name;
        coreDevice.modified_at = new Date().toISOString().replace("Z","+00:00");

        for (const entity in deviceData.entities) {
          const entityData = deviceData.entities[entity]
          const entityId = entityData.id;
          const coreEntity = entityRegistry.data.entities.find(entity => entity.id === entityId)
          coreEntity.area_id = deviceData.area_id;
          coreEntity.labels.push(entityData.label);
          coreEntity.name = entityData.name;
          coreEntity.modified_at = new Date().toISOString().replace("Z","+00:00");
        }
      }
    }

    function generateConfigYaml() {
      const floorYamlArray = [];
      for (const floor in floorArray) {
        floorYamlArray.push(floorMap[floorArray[floor]])
      }

      const configObject = {
        default_config: '',
        frontend: {
          themes: "!include_dir_merge_named themes"
        },

        input_boolean: {
          show_celsius_table: {
            name: "Temperature",
            initial: true
          },
          show_doors_table: {
            name: "Doors",
            initial: false
          },
          show_lamps_table: {
            name: "Lamps",
            initial: false
          }
        },

        input_select: {
          floor_view_select: {
            name: "Select Floor",
            options: floorYamlArray.reverse(),
            initial: "Ground"
          }
        },

        automation: "!include automations.yaml",
        script: "!include scripts.yaml",
        scene: "!include scenes.yaml",
      }
      return yaml.dump(configObject).replace(/'/g, '')
    }

    const floorRegistryExport = {
      version: 1,
      minor_version: 2,
      key: "core.floor_registry",
      data: {
        floors: generateFloorData()
      }
    }

    const areaRegistryExport = {
      version: 1,
      minor_version: 8,
      key: "core.area_registry",
      data: {
        areas: generateAreaData()
      }
    }

    const labelRegistryExport = {
      version: 1,
      minor_version: 2,
      key: "core.label_registry",
      data: {
        labels: generateLabelData()
      }

    }

    const lovelaceDashboards = {
      version: 1,
      minor_version: 1,
      key: "lovelace_dashboards",
      data: {
        items: [
          {
            id: "smart_home",
            icon: "mdi:home-circle",
            title: "Smart Home",
            url_path: "smart_home",
            mode: "storage",
            show_in_sidebar: true,
            require_admin: false
          }
        ]
      }
    }

    const configFile = generateConfigYaml();
    updateRegistries();

    zip.folder('core-registry-files').file('core.floor_registry', JSON.stringify(floorRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.area_registry', JSON.stringify(areaRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.label_registry', JSON.stringify(labelRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.device_registry', JSON.stringify(deviceRegistry, null, 2));
    zip.folder('core-registry-files').file('core.entity_registry', JSON.stringify(entityRegistry, null, 2));
    zip.folder('core-registry-files').file('lovelace_dashboards', JSON.stringify(lovelaceDashboards, null, 2));
    zip.folder('yaml-files').file('configuration.yaml', configFile);
  }

  async function generateDashboard() {

    const doorSensorIDArray = [];
    const temperatureSensorIDArray = [];
    const lightSensorIDArray = [];
    for (const device in deviceList) {
          const deviceData = deviceList[device]
          const doorSensor = deviceData.entities.find(entity => (entity.type === "door" || entity.type === "window") && entity.visible === true)
          const temperatureSensor = deviceData.entities.find(entity => entity.type === "temperature" && entity.visible === true)
          const lightSensor = deviceData.entities.find(entity => entity.type.includes("light") && entity.visible === true)
          if (doorSensor) {
            doorSensorIDArray.push({device_id: doorSensor.device_id, id: doorSensor.id, area_id: deviceData.area_id, type: doorSensor.type, original_name: doorSensor.original_name})
          } if (temperatureSensor) {
            temperatureSensorIDArray.push({device_id: temperatureSensor.device_id, id: temperatureSensor.id, area_id: deviceData.area_id, type: temperatureSensor.type, original_name: temperatureSensor.original_name})
          } if (lightSensor) {
            lightSensorIDArray.push({device_id: lightSensor.device_id, id: lightSensor.id, area_id: deviceData.area_id, type: lightSensor.type, original_name: lightSensor.original_name})
          }
    }

    function generateDoorEntities(data) {
      const doorElementArray = [];
      for (const entity of doorSensorIDArray) {
        const doorElement = data.objects.filter(obj => obj.id === entity.device_id)
        
          doorElement.forEach(obj => {
            
          const room = data.objects.find(o => o.classifier === 'mark' && o.area_id === obj.area_id)
          let roomText = undefined;
          if (room) {
            roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text
          }

          const closedState = {
            type: "conditional",
            elements: [
              {
                type: "state-icon",
                entity: entity.original_name,
                icon: entity.type === "door" ? "mdi:door-closed" : "mdi:window-closed-variant",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                },
                title: entity.type === "door" ? (roomText ? `${roomText} Door` : "Door") : (roomText ? `${roomText} Window` : "Window"),
              }
             ],
            conditions: [
              {
                condition: "state",
                entity: entity.original_name,
                state: "1"
              }
            ],
            title: entity.type === "door" ?  (roomText ? `${roomText} Door Closed` : "Door Closed") : (roomText ? `${roomText} Window Closed` : "Window Closed")
          };
          const openedState = {
            type: "conditional",
            elements: [
              {
                type: "state-icon",
                entity: entity.original_name,
                icon: entity.type === "door" ? "mdi:door-open" : "mdi:window-open-variant",
                style: {
                  left: (Math.round((obj.left / canvasWidth) * 100)-1) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                },
              }
             ],
            conditions: [
              {
                condition: "state",
                entity: entity.original_name,
                state: "0"
              }
            ],
            title: entity.type === "door" ? (roomText ? `${roomText} Door Open` : "Door Open") : (roomText ? `${roomText} Window Open` : "Window Open")
          }
          doorElementArray.push(closedState, openedState);
        })  
      }
      return doorElementArray;
    }

    function generateTemperatureEntities(data) {
      const temperatureElementArray = [];
      for (const entity of temperatureSensorIDArray) {
        const temperatureElement = data.objects.filter(obj => obj.id === entity.device_id)
          temperatureElement.forEach(obj => {
          const room = data.objects.find(o => o.classifier === 'mark' && o.area_id === obj.area_id)
          const roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text

          const temperatureObject = {
            type: "state-badge",
            entity: entity.original_name,
            title: roomText ? `${roomText}` : "No Room",
            style: {
              left: (Math.round((obj.left / canvasWidth) * 100)-1) + "%",
              top: Math.round((obj.top / canvasHeight) * 100) + "%",
            },
          };
          temperatureElementArray.push(temperatureObject);
        })  
      }
      return temperatureElementArray;
    }

    function generateLightEntities(data) {
      const lightElementArray = [];
      for (const entity of lightSensorIDArray) {
        const lightElement = data.objects.filter(obj => obj.id === entity.device_id)
          lightElement.forEach(obj => {
          const room = data.objects.find(o => o.classifier === 'mark' && o.area_id === obj.area_id)
          const roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text

          const onState = {
            type: "conditional",
            title: roomText ? `${roomText} Light On` : "Light On",
            conditions: [
              {
                condition: "numeric_state",
                entity: entity.original_name,
                above: 200
              }
            ],
            elements: [
              {
                type: "state-icon",
                entity: entity.original_name,
                icon: "mdi:lightbulb-on-outline",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                },
              }
            ],
          };
          const offState = {
            type: "conditional",
            title: roomText ? `${roomText} Light Off` : "Light Off",
            conditions: [
              {
                condition: "numeric_state",
                entity: entity.original_name,
                below: 200
              }
            ],
            elements: [
              {
                type: "state-icon",
                entity: entity.original_name,
                icon: "mdi:lightbulb-outline",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                },
              }
            ],
          }
          lightElementArray.push(onState, offState);
        })  
      }
      return lightElementArray;
    }

    function generateFloorDashboard() {
      const floorDashboardArray = []

      const floorSelect = {
        type: "entities",
        entities: [
          "input_select.floor_view_select"
        ]
      }

      floorDashboardArray.push(floorSelect)


      for (const key in floorData) {
        const data = floorData[key];
        const floorDashboard = {
          type: "conditional",
          conditions: [
            {
              entity: "input_select.floor_view_select",
              state: floorMap[key]
            }
          ],
          card: {
            type: "vertical-stack",
            cards: [
              {
              type: "markdown",
              content: floorMap[key]
              },
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "button",
                    name: "Temperature",
                    show_name: false,
                    show_icon: true,
                    entity: "input_boolean.show_celsius_table",
                    icon: "mdi:temperature-celsius",
                    show_state: false,
                    tap_action: {
                      action: "call-service",
                      service: "script.only_celsius_table"
                    }
                  },
                  {
                    type: "button",
                    name: "Doors",
                    show_name: false,
                    show_icon: true,
                    entity: "input_boolean.show_doors_table",
                    icon: "mdi:door",
                    show_state: false,
                    tap_action: {
                    action: "call-service",
                    service: "script.only_doors_table"
                    }
                  },
                  {
                    type: "button",
                    name: "Lamps",
                    show_name: false,
                    show_icon: true,
                    entity: "input_boolean.show_lamps_table",
                    icon: "mdi:lightbulb",
                    show_state: false,
                    tap_action: {
                      action: "call-service",
                      service: "script.only_lamps_table"
                    }
                  }
                ]
              },
              {
                type: "grid",
                columns: 1,
                cards: [
                  {
                    type: "picture-elements",
                    title: "Doors",
                    visibility: [
                      {
                        condition: null,
                        entity: "input_boolean.show_doors_table",
                        state: "on"
                      }
                    ],
                    elements: generateDoorEntities(data),
                    image: `/local/${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`
                  },
                  {
                    type: "picture-elements",
                    title: "Temperature",
                    visibility: [
                      {
                        condition: null,
                        entity: "input_boolean.show_celsius_table",
                        state: "on"
                      }
                    ],
                    elements: generateTemperatureEntities(data),
                    image: `/local/${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`
                  }, 
                  {
                    type: "picture-elements",
                    title: "Lights",
                    visibility: [
                      {
                        condition: null,
                        entity: "input_boolean.show_lamps_table",
                        state: "on"
                      }
                    ],
                    elements: generateLightEntities(data),
                    image: `/local/${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`
                  }, 
                ]
              }
            ]
          }
        }
        floorDashboardArray.push(floorDashboard)
      }
      return floorDashboardArray
    }

    const lovelaceDashboardExport = {
      version: 1,
      minor_verson: 1,
      key: "lovelace.smart_home",
      data: {
        config: {
          views: [
            {
              title: "Floorplans",
              cards: [ 
                {
                  type: "vertical-stack",
                  cards: generateFloorDashboard()
                }
              ]
            }
          ]
        }
      }
    }
    zip.folder('core-registry-files').file('lovelace.smart_home', JSON.stringify(lovelaceDashboardExport, null, 2))
  }

  async function exportData() {

    await generateImages("home-assistant");
    await generateJsonFiles();
    await generateDashboard();
    await fetchScriptYaml();
    
    await zip.generateAsync({type: 'blob'}).then((blob) => {
        saveAs(blob, `${canvasName.toLowerCase().replace(/ /g, '_')}_export.zip`)
        zip = new JSZip();
    });
  }

  return (
    <div>
    {activeDropdown === 'export' &&
    <div className="dropdown-container">
        <div className='dropdown-content'>
          <div className='export-settings'>
            <div className="export-checkbox">
              <input className='checkbox' type="checkbox" defaultChecked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)}/>
              <p>Hide Rooms on Export</p>
            </div>
            <div className="export-checkbox">
              <input className='checkbox' type="checkbox" defaultChecked={hideLabels} onChange={(e) => setHideLabels(e.target.checked)}/>
              <p>Hide Labels on Export</p>
            </div>
          </div>
          <button onClick={() => exportData()} disabled={!activeCanvas || !deviceRegistry || !entityRegistry}>Export to Home Assistant</button>
          <button onClick={() => generateImages("images")} disabled={!activeCanvas}>Export as png</button>
        </div>
    </div>
    }
    </div>
  );
}

export default ExportDropdown;