import { useState } from 'react';
import '../../css/Dropdown.css';
import '../../css/Popup.css'
import * as fabric from "fabric";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import yaml from 'js-yaml';

function ExportDropdown({ canvasData, canvasState, canvasInfo, activeDropdown }) {

  const { canvasWidth, canvasHeight, canvasName, entityRegistry, deviceRegistry } = canvasInfo
  const { deviceList, labelList, floorData, floorArray } = canvasData
  const { activeCanvas } = canvasState

  const [hideRooms, setHideRooms] = useState(false);
  const [hideLabels, setHideLabels] = useState(false);
  const [homeAssistantToggle, setHomeAssistantToggle] = useState(false);

  var zip = new JSZip();

  const floorMap = {
    "4B": "Basement Four",
    "3B": "Basement Three",
    "2B": "Basement Two",
    "1B": "Basement One",
    "GR": "Ground",
    "1F": "Floor One",
    "2F": "Floor Two",
    "3F": "Floor Three",
    "4F": "Floor Four"
  }

  let roomList = [];

  if (floorData) {
    for (const key in floorData) {
      const data = floorData[key];
      if (data) {
        const areaData = data.objects.filter(obj => obj.classifier === 'mark')
        if (areaData) {
          areaData.forEach(obj => {
            const room = data.objects.find(o => o.classifier === 'mark' && o.area_id === obj.area_id)
            let roomText = undefined;
            if (room) {
              roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text
            }
            roomList.push({ id: obj.area_id, room: roomText, active: false })
          })
        }
      }
    }
  }

  function setRoomActive(value, id) {
    const findRoom = roomList.find(room => room.id === id);
    findRoom.active = value;
  }

  async function generateRoomImages(canvas) {

    let rooms = [];

    roomList.filter(room => room.active === true).forEach(room => {
      const findObj = canvas.getObjects().find(obj => obj.classifier === 'mark' && obj.area_id === room.id)
      rooms.push(findObj);
    })

    rooms.forEach(room => {
      const floorplanPNG = canvas.toDataURL({
        left: room.left - 15,
        top: room.top - 15,
        width: room.width + 30,
        height: room.height + 30,
        format: 'png'
      })
      const fileName = `${canvasName.toLowerCase().replace(/ /g, '_')}_${room.area_id}.png`;
      zip.folder('media/rooms').file(fileName, floorplanPNG.split(',')[1], { base64: true })
    })
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

            if (purpose === 'home-assistant') {
              generateRoomImages(canvas)
            }

          }, 0)

          if (dataLength === 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({ format: 'png' })
              const fileName = `${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`;

              if (purpose === 'images') {
                const link = document.createElement('a');
                link.href = floorplanPNG;
                link.download = fileName;
                link.click();
              } else if (purpose === 'home-assistant') {
                zip.folder('media').file(fileName, floorplanPNG.split(',')[1], { base64: true })
                resolve();
              }
            }, 0)
          } else if (dataLength > 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({ format: 'png' })
              const fileName = `${canvasName.toLowerCase().replace(/ /g, '_')}_${key}.png`;
              zip.folder('media').file(fileName, floorplanPNG.split(',')[1], { base64: true })
              processedFiles++

              if (processedFiles === dataLength && purpose === 'images') {
                zip.generateAsync({ type: 'blob' }).then((blob) => {
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
          created_at: new Date().toISOString().replace("Z", "+00:00"),
          modified_at: new Date().toISOString().replace("Z", "+00:00"),
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
          created_at: new Date().toISOString().replace("Z", "+00:00"),
          modified_at: new Date().toISOString().replace("Z", "+00:00"),
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
            created_at: new Date().toISOString().replace("Z", "+00:00"),
            modified_at: new Date().toISOString().replace("Z", "+00:00"),
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
        coreDevice.modified_at = new Date().toISOString().replace("Z", "+00:00");

        for (const entity in deviceData.entities) {
          const entityData = deviceData.entities[entity]
          const entityId = entityData.id;
          const coreEntity = entityRegistry.data.entities.find(entity => entity.id === entityId)
          coreEntity.area_id = deviceData.area_id;
          if (!entityData.label.includes('')) {
            coreEntity.labels = (entityData.label);
          }
          if (entityData.type.includes('temp')) {
            coreEntity.unit_of_measurement = "°C";
          }
          coreEntity.name = entityData.name;
          coreEntity.modified_at = new Date().toISOString().replace("Z", "+00:00");
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

        homeassistant: {
          customize: "!include customize.yaml"
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

    function generateCustomizeYaml() {

      let temperatureSensors = [];
      let humiditySensors = [];
      let co2Sensors = [];
      for (const device in deviceList) {
        const deviceData = deviceList[device]
        const temperatureSensor = deviceData.entities.find(entity => entity.type.includes("temperature"))
        const humiditySensor = deviceData.entities.find(entity => entity.type.includes("humid"))
        const co2Sensor = deviceData.entities.find(entity => entity.type.includes("co2"))
        if (temperatureSensor) {
          temperatureSensors.push({ device_id: temperatureSensor.device_id, id: temperatureSensor.id, area_id: deviceData.area_id, type: temperatureSensor.type, original_name: temperatureSensor.original_name })
        } if (humiditySensor) {
          humiditySensors.push({ device_id: humiditySensor.device_id, id: humiditySensor.id, area_id: deviceData.area_id, type: humiditySensor.type, original_name: humiditySensor.original_name })
        } if (co2Sensor) {
          co2Sensors.push({ device_id: co2Sensor.device_id, id: co2Sensor.id, area_id: deviceData.area_id, type: co2Sensor.type, original_name: co2Sensor.original_name })
        }
      }

      const customizeObject = {}

      if (temperatureSensors) {
        temperatureSensors.forEach(sensor => {
          customizeObject[sensor.original_name] = {
            state_class: "measurement",
            device_class: "temperature",
            unit_of_measurement: '"°C"'
          }
        })
      }

      if (humiditySensors) {
        humiditySensors.forEach(sensor => {
          customizeObject[sensor.original_name] = {
            state_class: "measurement",
            device_class: "humidity",
            unit_of_measurement: '"%"'
          }
        })
      }

      if (co2Sensors) {
        co2Sensors.forEach(sensor => {
          customizeObject[sensor.original_name] = {
            state_class: "measurement",
            device_class: "carbon_dioxide",
            unit_of_measurement: '"ppm"'
          }
        })
      }

      return yaml.dump(customizeObject).replace(/'/g, '');
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
    const customizeFile = generateCustomizeYaml();
    updateRegistries();

    zip.folder('core-registry-files').file('core.floor_registry', JSON.stringify(floorRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.area_registry', JSON.stringify(areaRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.label_registry', JSON.stringify(labelRegistryExport, null, 2));
    zip.folder('core-registry-files').file('core.device_registry', JSON.stringify(deviceRegistry, null, 2));
    zip.folder('core-registry-files').file('core.entity_registry', JSON.stringify(entityRegistry, null, 2));
    zip.folder('core-registry-files').file('lovelace_dashboards', JSON.stringify(lovelaceDashboards, null, 2));
    zip.folder('yaml-files').file('configuration.yaml', configFile);
    zip.folder('yaml-files').file('customize.yaml', customizeFile);
  }

  async function generateDashboard() {

    const doorSensorIDArray = [];
    const temperatureSensorIDArray = [];
    const lightSensorIDArray = [];
    const motionSensorIDArray = [];
    const seatSensorIDArray = [];
    const smokeSensorIDArray = [];
    const humidityIDArray = [];
    const co2IDArray = [];
    const binarySensorIDArray = []
    for (const device in deviceList) {
      const deviceData = deviceList[device]
      const doorSensor = deviceData.entities.find(entity => (entity.type.includes("door") || entity.type === "window") && entity.visible === true)
      const temperatureSensor = deviceData.entities.find(entity => entity.type.includes("temperature") && entity.visible === true)
      const lightSensor = deviceData.entities.find(entity => (entity.type.includes("light") || entity.type.includes('lux')) && entity.visible === true)
      const motionSensor = deviceData.entities.find(entity => entity.type === "motion" && entity.visible === true);
      const seatSensor = deviceData.entities.find(entity => (entity.type === "seat" || entity.type === "bed") && entity.visible === true)
      const humiditySensor = deviceData.entities.find(entity => entity.type.includes("humid") && entity.visible === true)
      const co2Sensor = deviceData.entities.find(entity => entity.type.includes("co2") && entity.visible === true)
      const binarySensor = deviceData.entities.find(entity => (entity.type.includes("door") || entity.type === "window" || entity.type === 'cupboard') && entity.visible === true)

      if (doorSensor) {
        doorSensorIDArray.push({ device_id: doorSensor.device_id, id: doorSensor.id, area_id: deviceData.area_id, type: doorSensor.type, original_name: doorSensor.original_name })
      } if (temperatureSensor) {
        temperatureSensorIDArray.push({ device_id: temperatureSensor.device_id, id: temperatureSensor.id, area_id: deviceData.area_id, type: temperatureSensor.type, original_name: temperatureSensor.original_name })
      } if (lightSensor) {
        lightSensorIDArray.push({ device_id: lightSensor.device_id, id: lightSensor.id, area_id: deviceData.area_id, type: lightSensor.type, original_name: lightSensor.original_name })
      } if (motionSensor) {
        motionSensorIDArray.push({ device_id: motionSensor.device_id, id: motionSensor.id, area_id: deviceData.area_id, type: motionSensor.type, original_name: motionSensor.original_name })
      } if (seatSensor) {
        seatSensorIDArray.push({ device_id: seatSensor.device_id, id: seatSensor.id, area_id: deviceData.area_id, type: seatSensor.type, original_name: seatSensor.original_name })
      } if (deviceData.original_name.includes("smoke") && deviceData.isActive === true) {
        smokeSensorIDArray.push({ id: deviceData.id, area_id: deviceData.area_id, original_name: deviceData.original_name })
      } if (humiditySensor) {
        humidityIDArray.push({ device_id: humiditySensor.device_id, id: humiditySensor.id, area_id: deviceData.area_id, type: humiditySensor.type, original_name: humiditySensor.original_name })
      } if (co2Sensor) {
        co2IDArray.push({ device_id: co2Sensor.device_id, id: co2Sensor.id, area_id: deviceData.area_id, type: co2Sensor.type, original_name: co2Sensor.original_name })
      } if (binarySensor) {
        binarySensorIDArray.push({ device_id: binarySensor.device_id, id: binarySensor.id, area_id: deviceData.area_id, type: binarySensor.type, original_name: binarySensor.original_name })
      }
    }

    //Object Maps

    const posTitleMap = {
      door: 'door opened',
      window: 'window opened',
      cupboard: 'cupboard opened',
      light: 'light on',
      kettle: 'kettle on',
      toaster: 'toaster on',
      microwave: 'microwave on',
      blender: 'blender on',
      tv: 'television on',
      seat: 'seat occupied',
      bed: 'bed occupied',
      motion: 'space occupied',
      co2: 'co2'
    }

    const negTitleMap = {
      door: 'door closed',
      window: 'window closed',
      cupboard: 'cupboard closed',
      light: 'light off',
      kettle: 'kettle off',
      toaster: 'toaster off',
      microwave: 'microwave off',
      blender: 'blender off',
      tv: 'television off',
      seat: 'seat empty',
      bed: 'bed empty',
    }

    const posIconMap = {
      door: 'mdi:door-open',
      window: 'mdi:window-open-variant',
      cupboard: 'mdi:cupboard-outline',
      light: 'mdi:lightbulb-on-outline',
      kettle: 'mdi:kettle-steam',
      toaster: 'mdi:toaster',
      microwave: 'mdi:microwave',
      blender: 'mdi:blender-outline',
      tv: 'mdi:television',
      seat: 'mdi:account',
      bed: 'mdi:account',
      motion: 'mdi:account',
      co2: 'mdi:molecule-co2'
    }

    const negIconMap = {
      door: 'mdi:door-closed',
      window: 'mdi:window-closed-variant',
      cupboard: 'mdi:cupboard',
      light: 'mdi:lightbulb-outline',
      kettle: 'mdi:kettle-outline',
      toaster: 'mdi:toaster-off',
      microwave: 'mdi:microwave-off',
      blender: 'mdi:blender',
      tv: 'mdi:television-off',
      seat: 'mdi:seat',
      bed: 'mdi:bed-double-outline',
    }

    const posStateMap = {
      door: '0',
      window: '0',
      cupboard: '0',
      light: 200,
      kettle: 6000,
      toaster: 1000,
      microwave: 8000,
      blender: 2000,
      tv: 1000,
      seat: 'ON',
      bed: 'ON',
      motion: '1',
      co2: 1000
    }

    const negStateMap = {
      door: '1',
      window: '1',
      cupboard: '1',
      light: 200,
      kettle: 1000,
      toaster: 1000,
      microwave: 1000,
      blender: 1000,
      tv: 1000,
      seat: 'OFF',
      bed: 'OFF',
    }

    const conditionMap = {
      door: 'state',
      window: 'state',
      cupboard: 'state',
      light: 'numeric_state',
      kettle: 'numeric_state',
      toaster: 'numeric_state',
      microwave: 'numeric_state',
      blender: 'numeric_state',
      tv: 'numeric_state',
      seat: 'state',
      bed: 'state',
      motion: 'state',
      co2: 'numeric_state'
    }

    const posConditionMap = {
      door: 'state',
      window: 'state',
      cupboard: 'state',
      light: 'above',
      kettle: 'above',
      toaster: 'above',
      microwave: 'above',
      blender: 'above',
      tv: 'above',
      seat: 'state',
      bed: 'state',
      motion: 'state',
      co2: 'above'
    }

    const negConditionMap = {
      door: 'state',
      window: 'state',
      cupboard: 'state',
      light: 'below',
      kettle: 'below',
      toaster: 'below',
      microwave: 'below',
      blender: 'below',
      tv: 'below',
      seat: 'state',
      bed: 'state',
    }

    const badgeTitleMap = {
      temp: 'temperature',
      humid: 'humidity'
    }

    const leftTranslationMap = {
      0: 15,
      1: 0,
      2: -15,
      3: 0,
      4: 15,
      5: -15,
      6: -15,
      7: 15
    }

    const topTranslationMap = {
      0: 0,
      1: 15,
      2: 0,
      3: -15,
      4: 15,
      5: 15,
      6: -15,
      7: -15
    }

    //Floorplan Dashboard 

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
                  left: Math.round(((obj.left + obj.objects[0].left) / canvasWidth) * 100) - 5 + "%",
                  top: Math.round(((obj.top + obj.objects[0].top) / canvasHeight) * 100) - 4 + "%",
                  transform: "scale(2,2)"
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
            title: entity.type === "door" ? (roomText ? `${roomText} Door Closed` : "Door Closed") : (roomText ? `${roomText} Window Closed` : "Window Closed")
          };
          const openedState = {
            type: "conditional",
            elements: [
              {
                type: "state-icon",
                entity: entity.original_name,
                icon: entity.type === "door" ? "mdi:door-open" : "mdi:window-open-variant",
                style: {
                  left: (Math.round(((obj.left + obj.objects[0].left) / canvasWidth) * 100)) - 5 + "%",
                  top: Math.round(((obj.top + obj.objects[0].top) / canvasHeight) * 100) - 4 + "%",
                  transform: "scale(2,2)"
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
          let roomText = undefined;
          if (room) {
            roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text
          }


          const temperatureObject = {
            type: "state-badge",
            entity: entity.original_name,
            title: roomText ? `${roomText}` : "No Room",
            style: {
              left: (Math.round(((obj.left + obj.objects[0].left) / canvasWidth) * 100) - 1) + "%",
              top: Math.round(((obj.top + obj.objects[0].top) / canvasHeight) * 100) + "%",
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
          let roomText = undefined;
          if (room) {
            roomText = data.objects.find(o => o.classifier === 'text' && o.area_id === room.id).text
          }


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
                  left: Math.round(((obj.left + obj.objects[0].left) / canvasWidth) * 100) - 5 + "%",
                  top: Math.round(((obj.top + obj.objects[0].top) / canvasHeight) * 100) - 4 + "%",
                  transform: "scale(2,2)"
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
                  left: Math.round(((obj.left + obj.objects[0].left) / canvasWidth) * 100) - 5 + "%",
                  top: Math.round(((obj.top + obj.objects[0].top) / canvasHeight) * 100) - 4 + "%",
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

    //Room Dashboard 

    function generateConditionalElement(type, state, entity, left, top) {
      const conditionalElement = {
        type: "conditional",
        title: state === 'neg' ? negTitleMap[type] : posTitleMap[type],
        conditions: [
          {
            condition: conditionMap[type],
            entity: entity.original_name,
            [state === 'neg' ? negConditionMap[type] : posConditionMap[type]]: state === 'neg' ? negStateMap[type] : posStateMap[type]
          }
        ],
        elements: [
          {
            type: "state-icon",
            style: {
              left: left - 5 + "%",
              top: top - 4 + "%",
              transform: "scale(2,2)"
            },
            entity: entity.original_name,
            icon: state === 'neg' ? negIconMap[type] : posIconMap[type]
          }
        ]
      }
      return conditionalElement;
    }

    function generateStateBadgeElement(type, entity, left, top) {
      const stateBadgeElement = {
        type: "state-badge",
        title: badgeTitleMap[type],
        entity: entity.original_name,
        style: {
          left: left + "%",
          top: top + "%"
        }
      }
      return stateBadgeElement;
    }

    function checkNewPosition(positionArray, element, left, top) {

      function checkPosition(positionArray, elementLeft, elementTop) {

        let flag = false;

        positionArray.forEach(pos => {
          if (((pos.left >= elementLeft - 14 && pos.left <= elementLeft + 14) && (pos.top >= elementTop - 14 && pos.top <= elementTop + 14)) || (elementLeft < 7) || (elementLeft > 93) || (elementTop < 9) || (elementTop > 91)) {
            flag = true;
          }
        })
        if (flag === true) {
          return false
        } else if (flag === false) {
          return true;
        }
      }

      let success = false;
      let i = 0;
      let attempt = 0;
      let max = 20;
      let multiplier = 1;

      while (!success && attempt < max) {
        if (i > 7) {
          i = 0;
          multiplier++;
        }

        let result = checkPosition(positionArray, left + (leftTranslationMap[i] * multiplier), top + (topTranslationMap[i] * multiplier))
        if (result === true) {
          if (element.type === 'conditional') {
            const findPosition = positionArray.find(el => el.id === element.elements[0].entity)
            findPosition.left = left + (leftTranslationMap[i] * multiplier);
            findPosition.top = top + (topTranslationMap[i] * multiplier);
            element.elements[0].style.left = ((left - 5) + (leftTranslationMap[i] * multiplier)) + '%'
            element.elements[0].style.top = ((top - 4) + (topTranslationMap[i] * multiplier)) + '%'
          } else if (element.type === 'state-badge') {
            const findPosition = positionArray.find(el => el.id === element.entity)
            findPosition.left = left + (leftTranslationMap[i] * multiplier);
            findPosition.top = top + (topTranslationMap[i] * multiplier);
            element.style.left = (left + (leftTranslationMap[i] * multiplier)) + '%'
            element.style.top = (top + (topTranslationMap[i] * multiplier)) + '%'
          }
          success = true;
          return element;
        } else {
          i++;
          attempt++;
        }
      }
    }

    function checkElementPositions(elementArray, positionArray) {
      positionArray.forEach(entity => {
        elementArray.forEach(element => {
          if (element.type === 'conditional') {
            let elementLeft = parseInt(element.elements[0].style.left) + 5
            let elementTop = parseInt(element.elements[0].style.top) + 4
            if (entity.id !== element.elements[0].entity && entity.left === elementLeft && entity.top === elementTop) {

              checkNewPosition(positionArray, element, elementLeft, elementTop)
            }
          } else if (element.type === 'state-badge') {
            let elementLeft = parseInt(element.style.left)
            let elementTop = parseInt(element.style.top)
            if (entity.id !== element.entity && entity.left === elementLeft && entity.top === elementTop) {
              checkNewPosition(positionArray, element, elementLeft, elementTop)
            }
          }
        })
      })
    }

    function generateRoomElements(canvas, room) {
      const elementArray = [];
      const positionArray = [];
      const devices = deviceList.filter(obj => obj.area_id === room.area_id)

      const roomLeft = room.left - 15;
      const roomTop = room.top - 15;
      const roomWidth = room.width + 30;
      const roomHeight = room.height + 30;

      if (devices.length === 0) return;

      devices.forEach(device => {

        const deviceLeft = canvas.objects.find(obj => obj.id === device.id).left;
        const deviceTop = canvas.objects.find(obj => obj.id === device.id).top;
        const calculatedLeft = Math.round((Math.abs(roomLeft - deviceLeft) / roomWidth) * 100)
        const calculatedTop = Math.round((Math.abs(roomTop - deviceTop) / roomHeight) * 100)

        device.entities.filter(entity => entity.visible === true).forEach(entity => {

          positionArray.push({
            id: entity.original_name,
            left: calculatedLeft,
            top: calculatedTop
          })

          if (entity.type.includes('door')) {
            elementArray.push(generateConditionalElement('door', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('door', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'window') {
            elementArray.push(generateConditionalElement('window', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('window', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'cupboard') {
            elementArray.push(generateConditionalElement('cupboard', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('cupboard', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type.includes('light') || entity.type.includes('lux')) {
            elementArray.push(generateConditionalElement('light', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('light', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'kettle') {
            elementArray.push(generateConditionalElement('kettle', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('kettle', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'toaster') {
            elementArray.push(generateConditionalElement('toaster', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('toaster', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'microwave') {
            elementArray.push(generateConditionalElement('microwave', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('microwave', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'blender') {
            elementArray.push(generateConditionalElement('blender', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('blender', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'tv') {
            elementArray.push(generateConditionalElement('blender', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('blender', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'seat') {
            elementArray.push(generateConditionalElement('seat', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('seat', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type === 'bed') {
            elementArray.push(generateConditionalElement('bed', 'neg', entity, calculatedLeft, calculatedTop), generateConditionalElement('bed', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type.includes('motion')) {
            elementArray.push(generateConditionalElement('motion', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type.includes('co2')) {
            elementArray.push(generateConditionalElement('co2', 'pos', entity, calculatedLeft, calculatedTop))
          } else if (entity.type.includes('temp')) {
            elementArray.push(generateStateBadgeElement('temp', entity, calculatedLeft, calculatedTop))
          } else if (entity.type.includes('humid')) {
            elementArray.push(generateStateBadgeElement('humid', entity, calculatedLeft, calculatedTop))
          }
        })
      })

      checkElementPositions(elementArray, positionArray);

      return elementArray;
    }

    function generateGaugeGraph(style, entity) {
      if (style === 'temp') {
        const temperatureGraph = {
          type: "gauge",
          entity: entity.original_name,
          name: entity.original_name.includes('fridge') ? "Refrigerator Temperature" : "Temperature",
          needle: true,
          max: 50,
          unit: "°C",
          segments: [
            {
              from: 0,
              color: " \t#01b8f5"
            },
            {
              from: 5,
              color: "#06f5b9"
            },
            {
              from: 10,
              color: "#26f176"
            },
            {
              from: 15,
              color: "#119300"
            },
            {
              from: 20,
              color: "#6f9c3d"
            },
            {
              from: 25,
              color: "#a5c90f"
            },
            {
              from: 30,
              color: "#ff9a00"
            },
            {
              from: 35,
              color: "#ff7400"
            },
            {
              from: 40,
              color: "#fe6b40"
            },
            {
              from: 45,
              color: "#ff4d00"
            },
            {
              "from": 50,
              "color": "#ff0000"
            }
          ]
        }
        return temperatureGraph;

      } else if (style === 'humid') {
        const humidityGraph = {
          type: "gauge",
          entity: entity.original_name,
          name: "Humidity",
          unit: "%",
          severity: {
            green: 0,
            yellow: 70,
            red: 85
          },
          needle: true
        }
        return humidityGraph;

      } else if (style === 'co2') {
        const co2Graph = {
          type: "gauge",
          entity: entity.original_name,
          unit: "ppm",
          severity: {
            green: 0,
            yellow: 1000,
            red: 2500
          },
          needle: true,
          max: 5000,
          name: "Carbon dioxide"
        }
        return co2Graph;

      } else if (style === 'light') {
        const lightGraph = {
          type: "gauge",
          entity: entity.original_name,
          name: "Light level",
          needle: true,
          max: 100,
          unit: "",
          segments: [
            {
              from: 0,
              color: "#515151"
            },
            {
              from: 5,
              color: "#595959"
            },
            {
              from: 10,
              color: "#616161"
            },
            {
              from: 15,
              color: "#696969"
            },
            {
              from: 20,
              color: "#717171"
            },
            {
              from: 25,
              color: "#797979"
            },
            {
              from: 30,
              color: "#818181"
            },
            {
              from: 35,
              color: "#898989"
            },
            {
              from: 40,
              color: "#919191"
            },
            {
              from: 45,
              color: "#999999"
            },
            {
              from: 50,
              color: "#a1a1a1"
            },
            {
              from: 55,
              color: "#a9a9a9"
            },
            {
              from: 60,
              color: "#b1b1b1"
            },
            {
              from: 65,
              color: "#b9b9b9"
            },
            {
              from: 70,
              color: "#c1c1c1"
            },
            {
              from: 75,
              color: "#c9c9c9"
            },
            {
              from: 80,
              color: "#d1d1d1"
            },
            {
              from: 85,
              color: "#d9d9d9"
            },
            {
              from: 90,
              color: "#e1e1e1"
            },
            {
              from: 95,
              color: "#e9e9e9"
            }
          ]
        }
        return lightGraph;
      }
    }

    function generateRoomHistoryGraph(type, room) {
      const entityArray = [];

      if (type === 'binary') {
        binarySensorIDArray.filter(entity => entity.area_id === room.area_id).forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      } else if (type === 'motion') {
        motionSensorIDArray.filter(entity => entity.area_id === room.area_id).forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      } else if (type === 'seat') {
        seatSensorIDArray.filter(entity => entity.area_id === room.area_id).forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      }

      return entityArray;
    }

    function generateActivityCards(room) {
      const cardArray = [];

      const header = {
        type: "heading",
        heading: "Activity",
        heading_style: "title"
      }
      cardArray.push(header);

      if (doorSensorIDArray.filter(entity => entity.area_id === room.area_id).length > 0) {
        const doorHistory = {
          type: "history-graph",
          title: "Door activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateRoomHistoryGraph('binary', room),
        }
        cardArray.push(doorHistory);
      }

      if (motionSensorIDArray.filter(entity => entity.area_id === room.area_id).length > 0) {
        const doorHistory = {
          type: "history-graph",
          title: "Motion activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateRoomHistoryGraph('motion', room),
        }
        cardArray.push(doorHistory);
      }

      if (seatSensorIDArray.filter(entity => entity.area_id === room.area_id).length > 0) {
        const doorHistory = {
          type: "history-graph",
          title: "Seat/Bed activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateRoomHistoryGraph('seat', room),
        }
        cardArray.push(doorHistory);
      }

      return cardArray;
    }

    function generateEnvironmentCards(room) {

      const temperatureEntities = temperatureSensorIDArray.filter(entity => entity.area_id === room.area_id)
      const humidityEntities = humidityIDArray.filter(entity => entity.area_id === room.area_id)
      const co2Entities = co2IDArray.filter(entity => entity.area_id === room.area_id)
      const lightEntities = lightSensorIDArray.filter(entity => entity.area_id === room.area_id)

      const cardArray = [];

      const header = {
        type: "heading",
        heading: "Environment",
        heading_style: "title"
      }

      cardArray.push(header);

      if (temperatureEntities) {
        temperatureEntities.forEach(entity => {
          cardArray.push(generateGaugeGraph('temp', entity))
        })
      }

      if (humidityEntities) {
        humidityEntities.forEach(entity => {
          cardArray.push(generateGaugeGraph('humid', entity))
        })
      }

      if (co2Entities) {
        co2Entities.forEach(entity => {
          cardArray.push(generateGaugeGraph('co2', entity))
        })
      }

      if (lightEntities) {
        lightEntities.forEach(entity => {
          cardArray.push(generateGaugeGraph('light', entity))
        })
      }

      return cardArray
    }

    //Overview

    function generateOverviewSummary() {
      const cardArray = [];

      const header = {
        type: "heading",
        heading: "Summary",
        heading_style: "title"
      }
      cardArray.push(header);

      const lastSeen = {
        type: "markdown",
        content: `{% set newest_entity = namespace(entity_id=None, last_changed=None) %} {% for entity in states.sensor %} {% if entity.entity_id in label_entities("location") %} {# The {{ entity.entity_id }} was last changed at {{ entity.last_changed }} #} {% if newest_entity.last_changed == None or entity.last_changed > newest_entity.last_changed %} {% set newest_entity.entity_id = entity.entity_id %} {% set newest_entity.last_changed = entity.last_changed %} {% endif %} {% endif %} {% endfor %} {% if newest_entity.entity_id %} <ha-alert alert-type="info"><ha-icon icon="mdi: account"></ha-icon>The most recent activity was in the **{{area_name(newest_entity.entity_id)}}** on **{{ newest_entity.last_changed.strftime('%A') }}** at **{{ newest_entity.last_changed.strftime('%I:%M %p') }}**.</ha-alert> {% else %} <ha-alert alert-type="error">No recent activity detected.</ha-alert> {% endif %}`,
        title: "Last seen"
      }
      cardArray.push(lastSeen);

      if (doorSensorIDArray) {
        const doorHistory = {
          type: "history-graph",
          title: "Door activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateHistoryGraph('door'),
        }
        cardArray.push(doorHistory);
      }

      if (motionSensorIDArray) {
        const motionHistory = {
          type: "history-graph",
          title: "Motion activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateHistoryGraph('motion'),
        }
        cardArray.push(motionHistory);
      }

      if (seatSensorIDArray) {
        const seatHistory = {
          type: "history-graph",
          title: "Seat/Bed activity",
          hours_to_show: 24,
          logarithmic_scale: false,
          entities: generateHistoryGraph('seat'),
        }
        cardArray.push(seatHistory);
      }

      const weatherForecast = {
        type: "weather-forecast",
        entity: "weather.forecast_home",
        show_current: true,
        show_forecast: true,
        forecast_type: "hourly"
      }
      cardArray.push(weatherForecast);

      return cardArray;
    }

    function generateSmokeSensors() {
      const entityArray = [];

      smokeSensorIDArray.forEach(device => {
        const smokeSensors = {
          entity: device.original_name + "_smokesensorstatus",
          name: device.area_id
        }
        entityArray.push(smokeSensors);
      })

      return entityArray;
    }

    function generateWarnings() {
      const cardArray = [];

      const header = {
        type: "heading",
        heading: "Warnings",
        heading_style: "title"
      }

      cardArray.push(header);

      if (smokeSensorIDArray) {
        const NumberOfSensors = smokeSensorIDArray.length;
        const smokeWarning = {
          type: "entities",
          title: NumberOfSensors > 1 ? "Smoke Detectors" : "Smoke Detector",
          entities: generateSmokeSensors()
        }
        cardArray.push(smokeWarning);
      }

      const BathroomMotion = motionSensorIDArray.find(entity => entity.area_id.includes("bath") || entity.area_id.includes("rest") || entity.area_id.includes("toil"))

      if (BathroomMotion) {
        const bathroomWarning = {
          type: "markdown",
          content: `{% if is_state('${BathroomMotion.original_name}', '1')  %}\n{% set dur = now() - states.${BathroomMotion.original_name}.last_changed %} {% set seconds = (dur.total_seconds() % 60) | int %} {% set minutes = ((dur.total_seconds() % 3600) / 60) | int %} {% set hours = ((dur.total_seconds() % 86400) / 3600) | int %}\n<ha-alert alert-type="warning">They have been in the bathroom for {{ '{:02}:{:02}:{:02}'.format(hours, minutes, seconds) }}</ha-alert>\n{% else %}\nNo warning at the moment.\n{% endif %}\n`,
          title: "Warnings"
        }
        cardArray.push(bathroomWarning);
      }

      return cardArray;
    }

    function generateHistoryGraph(type) {
      const entityArray = [];

      if (type === 'door') {
        doorSensorIDArray.filter(entity => entity.type.includes('door')).forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      } else if (type === 'motion') {
        motionSensorIDArray.forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      } else if (type === 'seat') {
        seatSensorIDArray.forEach(entity => {
          const targetEntity = {
            entity: entity.original_name,
            name: entity.area_id
          }
          entityArray.push(targetEntity);
        })
      }

      return entityArray;
    }

    //Views (Each tab in the Home Assistant dashboard)

    function generateViews() {
      const viewArray = [];

      const overviewView = {
        title: "Overview",
        cards: [],
        type: "sections",
        header: {
          card: {
            type: "markdown",
            text_only: true,
            content: "# Welcome {{ user }}\n{{now().strftime('%A, %B %d, %Y')}}"
          }
        },
        sections: [
          {
            type: "grid",
            cards: generateOverviewSummary()
          },
          {
            type: "grid",
            cards: generateWarnings()
          }
        ]
      }

      viewArray.push(overviewView)

      const floorplanView = {
        title: "Floorplan",
        cards: [
          {
            type: "vertical-stack",
            cards: generateFloorDashboard()
          }
        ]
      }

      viewArray.push(floorplanView);

      for (const key in floorData) {
        const data = floorData[key];
        let rooms = [];

        roomList.filter(room => room.active === true).forEach(room => {
          const findObj = data.objects.find(obj => obj.classifier === 'mark' && obj.area_id === room.id)
          rooms.push(findObj);
        })

        rooms.forEach(obj => {
          if (data.objects.filter(item => item.area_id === obj.area_id && item.classifier === 'device').length !== 0) {
            const roomView = {
              title: data.objects.find(room => room.classifier === 'text' && room.area_id === obj.id).text,
              cards: [],
              type: "sections",
              max_columns: 3,
              sections: generateRoomSection(data, obj)
            }
            viewArray.push(roomView);
          }
        })
      }

      const batteryView = {
        type: "sections",
        max_columns: 4,
        title: "Batteries",
        path: "batteries",
        theme: "red_alert",
        sections: generateBatteryDashboard()
      }

      viewArray.push(batteryView);

      return viewArray;

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

    function generateBatteryDashboard() {
      const batteryDashboardArray = []

      function generateBatteries(areaID) {
        const batteryArray = []
        const devices = deviceList.filter(device => device.area_id === areaID);

        for (const device in devices) {
          const deviceData = devices[device];
          for (const entity in deviceData.entities) {
            const entityData = deviceData.entities[entity]
            if (entityData.type.includes("battery")) {
              batteryArray.push(
                {
                  entity: entityData.original_name
                }
              )
            }
          }
        }
        return batteryArray;
      }

      for (const key in floorData) {
        const data = floorData[key];
        const batteryCard = data.objects.filter(obj => obj.classifier === 'mark').map(obj => (
          {
            type: "grid",
            cards: [
              {
                type: "heading",
                heading: data.objects.find(room => room.classifier === 'text' && room.area_id === obj.id).text,
                heading_style: "title",
              },
              {
                type: "entities",
                entities: generateBatteries(obj.area_id)
              }
            ]
          }
        ));
        batteryDashboardArray.push(...batteryCard);
      }
      return batteryDashboardArray;
    }

    function generateRoomSection(canvas, room) {

      const sectionArray = []

      const summarySection = {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Summary",
            heading_style: "title"
          },
          {
            type: "picture-elements",
            elements: generateRoomElements(canvas, room),
            image: `/local/${canvasName.toLowerCase().replace(/ /g, '_')}_${room.area_id}.png`
          }
        ]
      }

      sectionArray.push(summarySection)

      const activitySection = {
        type: "grid",
        cards: generateActivityCards(room)
      }

      sectionArray.push(activitySection)

      const environmentSection = {
        type: "grid",
        cards: generateEnvironmentCards(room)
      }

      sectionArray.push(environmentSection);

      return sectionArray;
    }

    const lovelaceDashboardExport = {
      version: 1,
      minor_verson: 1,
      key: "lovelace.smart_home",
      data: {
        config: {
          views: generateViews()
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

    await zip.generateAsync({ type: 'blob' }).then((blob) => {
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
                <input className='checkbox' type="checkbox" defaultChecked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)} />
                <p>Hide Rooms on Export</p>
              </div>
              <div className="export-checkbox">
                <input className='checkbox' type="checkbox" defaultChecked={hideLabels} onChange={(e) => setHideLabels(e.target.checked)} />
                <p>Hide Labels on Export</p>
              </div>
            </div>
            <button onClick={() => setHomeAssistantToggle(true)} disabled={!activeCanvas || !deviceRegistry || !entityRegistry}>Export to Home Assistant</button>
            <button onClick={() => generateImages("images")} disabled={!activeCanvas}>Export as png</button>
          </div>
        </div>
      }

      {homeAssistantToggle && (
        <div className="filter" onClick={() => setHomeAssistantToggle(false)}>
          <div className="new-label-frame" onClick={e => e.stopPropagation()}>
            <div className='exit'>
              <button onClick={() => setHomeAssistantToggle(false)}>X</button>
            </div>
            <div className='popup-content'>


              <h2>Export to Home Assistant</h2>
              <p><b>Image View</b></p>
              <p>These will hide the room colors or room labels in the exported images.</p>
              <div className="export-checkbox">
                <input className='checkbox' type="checkbox" defaultChecked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)} />
                <p>Hide Rooms on Export</p>
              </div>
              <div className="export-checkbox">
                <input className='checkbox' type="checkbox" defaultChecked={hideLabels} onChange={(e) => setHideLabels(e.target.checked)} />
                <p>Hide Labels on Export</p>
              </div>
              <p><b>Room Dashboard Select</b></p>
              For each room you labeled, it is possible to generate dashboards curated towards the sensors you have placed inside them. Please select
              which rooms you wish to generate a dashboard for.
              <div className="room-list-view">
                {roomList && (
                  roomList.map((room) => (
                    <div className="export-checkbox">
                      <input key={room.id} className='checkbox' type="checkbox" defaultChecked={room.active} onChange={(e) => setRoomActive(e.target.checked, room.id)} />
                      <p>{room.room}</p>
                    </div>
                  ))
                )}
                {!roomList && (
                  <p>No labeled rooms</p>
                )}

              </div>

              <p><b>Export Data</b></p>
              Once you are ready, click the button below to generate a zip folder that can be imported into Home Assistant. For help importing the files,
              please visit section 3 of the How to Use Guide.

              <button onClick={() => exportData()}>Export to Home Assistant</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportDropdown;