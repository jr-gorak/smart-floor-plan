import '../../css/Dropdown.css';
import { useState } from 'react';
import * as fabric from "fabric";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function ExportDropdown({activeDropdown, floorData}) {
  const [floorArray, setFloorArray] = useState(() => {const stored = sessionStorage.getItem("floorArray"); return stored? JSON.parse(stored) : ["GR"]; });
  const labelList = JSON.parse(sessionStorage.getItem('labels'));
  const deviceRegistry = JSON.parse(sessionStorage.getItem('deviceRegistry'));
  const entityRegistry = JSON.parse(sessionStorage.getItem('entityRegistry'));
  const canvasWidth = sessionStorage.getItem('canvasWidth');
  const canvasHeight = sessionStorage.getItem('canvasHeight');
  const canvasName = sessionStorage.getItem('canvasName');
  const deviceList = JSON.parse(sessionStorage.getItem('sensors'));
  var zip = new JSZip();

  async function generateImages(purpose) {
    const dataLength = Object.keys(floorData).length;
    let processedFiles = 0;

    return new Promise((resolve) => {
      Object.entries(floorData).forEach(([key, data]) => {
        let finishedDownloading = false;

        const canvas = new fabric.Canvas(null, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "white",
        });

        canvas.loadFromJSON(data, () => {
          if (finishedDownloading) return;
          setTimeout(() => {
            canvas.getObjects().filter(obj => obj.classifier === 'device' || obj.classifier === 'sensor').forEach(obj => {
              obj.visible = false;
              console.log(obj);
            })
          }, 0)

          canvas.renderAll();

          if (dataLength === 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({format: 'png'})
              const link = document.createElement('a');
              link.href = floorplanPNG;
              link.download = canvasName + '_' + key + '.png';
              link.click();
            }, 0)
          } else if (dataLength > 1) {
            setTimeout(() => {
              const floorplanPNG = canvas.toDataURL({format: 'png'})
              const fileName =  canvasName + '_' + key + '.png';
              zip.folder('media').file(fileName, floorplanPNG.split(',')[1], {base64: true})
              processedFiles++
              console.log(processedFiles);

              if (processedFiles === dataLength && purpose === 'images') {
                zip.generateAsync({type: 'blob'}).then((blob) => {
                  saveAs(blob, 'image_export.zip')
                  zip = new JSZip();
                  resolve();
                });

              } else if (processedFiles === dataLength && purpose === 'home-assistant') {
                console.log("test")
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
          created_at: Date(),
          modified_at: Date(),
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
          created_at: Date(),
          modified_at: Date(),
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
            created_at: Date(),
            modified_at: Date(),
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

        for (const entity in deviceData.entities) {
          const entityData = deviceData.entities[entity]
          const entityId = entityData.id;
          const coreEntity = entityRegistry.data.entities.find(entity => entity.id === entityId)
          coreEntity.area_id = deviceData.area_id;
          coreEntity.labels.push(entityData.label);
          coreEntity.name = entityData.name;
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

  async function exportData() {

    await generateImages("home-assistant");
    await generateJsonFiles();

    await zip.generateAsync({type: 'blob'}).then((blob) => {
        saveAs(blob, 'file_export.zip')
        zip = new JSZip();
    });


  }

  return (
    <div>
    {activeDropdown === 'export' &&
    <div className="dropdown-container">
        <div className='dropdown-content'>
        <button onClick={() => exportData()}>Export to Home Assistant</button>
        <button onClick={() => generateImages("images")}>Export as png</button>
        </div>
    </div>
    }
    </div>
  );
}

export default ExportDropdown;