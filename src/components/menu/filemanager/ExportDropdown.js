import '../../css/Dropdown.css';
import * as fabric from "fabric";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function ExportDropdown({canvasData, canvasState, canvasInfo, activeDropdown}) {

  const { canvasWidth, canvasHeight, canvasName, entityRegistry, deviceRegistry } = canvasInfo
  const { deviceList, labelList, floorData, floorArray } = canvasData
  const { activeCanvas } = canvasState

  var zip = new JSZip();

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
          name: floorArray[i],
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
          name: obj.area_id,
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

    updateRegistries();

    zip.folder('core-registry-files').file('core.floor_registry', JSON.stringify(floorRegistryExport, null, 2))
    zip.folder('core-registry-files').file('core.area_registry', JSON.stringify(areaRegistryExport, null, 2))
    zip.folder('core-registry-files').file('core.label_registry', JSON.stringify(labelRegistryExport, null, 2))
    zip.folder('core-registry-files').file('core.device_registry', JSON.stringify(deviceRegistry, null, 2))
    zip.folder('core-registry-files').file('core.entity_registry', JSON.stringify(entityRegistry, null, 2))
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
            doorSensorIDArray.push({device_id: doorSensor.device_id, id: doorSensor.id, area_id: deviceData.area_id, type: doorSensor.type})
          } if (temperatureSensor) {
            temperatureSensorIDArray.push({device_id: temperatureSensor.device_id, id: temperatureSensor.id, area_id: deviceData.area_id, type: temperatureSensor.type})
          } if (lightSensor) {
            lightSensorIDArray.push({device_id: lightSensor.device_id, id: lightSensor.id, area_id: deviceData.area_id, type: lightSensor.type})
          }
    }

    function generateDoorEntities(data) {
      const doorElementArray = [];
      for (const entity of doorSensorIDArray) {
        const doorElement = data.objects.filter(obj => obj.id === entity.device_id)
          doorElement.forEach(obj => {
          const closedState = {
            type: "conditional",
            elements: [
              {
                type: "state-icon",
                entity: entity.id,
                icon: entity.type === "door" ? "mdi:door-closed" : "mdi:window-closed-variant",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                  transform: "scale(2,2)"
                },
                title: entity.type === "door" ? (entity.area_id ? `${entity.area_id} Door` : "Door") : (entity.area_id ? `${entity.area_id} Window` : "Window"),
              }
             ],
            conditions: [
              {
                condition: "state",
                entity: entity.id,
                state: "Closed"
              }
            ],
            title: entity.type === "door" ?  (entity.area_id ? `${entity.area_id} Door Closed` : "Door Closed") : (entity.area_id ? `${entity.area_id} Window Closed` : "Window Closed")
          };
          const openedState = {
            type: "conditional",
            elements: [
              {
                type: "state-icon",
                entity: entity.id,
                icon: entity.type === "door" ? "mdi:door-open" : "mdi:window-open-variant",
                style: {
                  left: (Math.round((obj.left / canvasWidth) * 100)-1) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                  transform: "scale(2,2)"
                },
              }
             ],
            conditions: [
              {
                condition: "state",
                entity: entity.id,
                state: "Open"
              }
            ],
            title: entity.type === "door" ? (entity.area_id ? `${entity.area_id.replace(/^./, entity.area_id[0].toUpperCase()).replace(/_/g, " ")} Door Open` : "Door Open") : (entity.area_id ? `${entity.area_id.replace(/^./, entity.area_id[0].toUpperCase()).replace(/_/g, " ")} Window Open` : "Window Open")
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
          const temperatureObject = {
            type: "state-badge",
            entity: entity.id,
            title: entity.area_id ? `${entity.area_id.replace(/^./, entity.area_id[0].toUpperCase()).replace(/_/g, " ")}` : "No Room",
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
          const onState = {
            type: "conditional",
            title: entity.area_id ? `${entity.area_id.replace(/^./, entity.area_id[0].toUpperCase()).replace(/_/g, " ")} light on` : "Light on",
            conditions: [
              {
                condition: "numeric_state",
                entity: entity.id,
                above: 200
              }
            ],
            elements: [
              {
                type: "state-icon",
                entity: entity.id,
                icon: "mdi:lightbulb-on",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                  transform: "scale(2,2)"
                },
              }
            ],
          };
          const offState = {
            type: "conditional",
            title: entity.area_id ? `${entity.area_id.replace(/^./, entity.area_id[0].toUpperCase()).replace(/_/g, " ")} light off` : "Light off",
            conditions: [
              {
                condition: "numeric_state",
                entity: entity.id,
                below: 200
              }
            ],
            elements: [
              {
                type: "state-icon",
                entity: entity.id,
                icon: "mdi:lightbulb-outline",
                style: {
                  left: Math.round((obj.left / canvasWidth) * 100) + "%",
                  top: Math.round((obj.top / canvasHeight) * 100) + "%",
                  transform: "scale(2,2)"
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
      for (const key in floorData) {
        const data = floorData[key];
        const floorDashboard = {
          type: "vertical-stack",
          cards:  [
            {
            type: "markdown",
            content: "# Select a floor plan\n"
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
                  icon: "mdi:temperature_celsius",
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
                  image: "imgURLhere"
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
                  image: "imgURLhere"
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
                  image: "imgURLhere"
                }, 
              ]
            }
          ]
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
              cards: generateFloorDashboard()
            },
            {
              //More dashboards here
            }
          ]
        }
      }
    }
    zip.file('lovelace.smart_home', JSON.stringify(lovelaceDashboardExport, null, 2))
  }

  async function exportData() {

    await generateImages("home-assistant");
    await generateJsonFiles();
    await generateDashboard();

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
        <button onClick={() => exportData()} disabled={!activeCanvas || !deviceRegistry || !entityRegistry}>Export to Home Assistant</button>
        <button onClick={() => generateImages("images")} disabled={!activeCanvas}>Export as png</button>
        </div>
    </div>
    }
    </div>
  );
}

export default ExportDropdown;