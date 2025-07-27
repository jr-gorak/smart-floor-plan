import '../../css/Dropdown.css';
import { useState } from 'react';
import * as fabric from "fabric";

function ExportDropdown({activeDropdown}) {
  const [floorData, setFloorData] = useState(() => {const stored = sessionStorage.getItem("floorData"); return stored? JSON.parse(stored) : {}; });
  const [floorArray, setFloorArray] = useState(() => {const stored = sessionStorage.getItem("floorArray"); return stored? JSON.parse(stored) : ["GR"]; });
  const labelList = JSON.parse(sessionStorage.getItem('labels'));
  const deviceRegistry = JSON.parse(sessionStorage.getItem('deviceRegistry'));
  const entityRegistry = JSON.parse(sessionStorage.getItem('entityRegistry'));
  const canvasWidth = sessionStorage.getItem('canvasWidth');
  const canvasHeight = sessionStorage.getItem('canvasHeight');
  const canvasName = sessionStorage.getItem('canvasName');
  //What data would I need?
  // floordata
  //Can get: floor registry: floor name, id, etc.
  //Can get: canvas objects, meaning classified='mark', to generate area registry.

  //device list
  //This list of objects is what is necessary to update entity and device files.

  //original config files
  //These will be modified. 

  //LabelList
  //Used to generate label registry

  function generateImages() {
    for (const key in floorData) {
      const data = floorData[key];

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

        setTimeout(() => {
          const floorplanPNG = canvas.toDataURL({format: 'png'})
          const link = document.createElement('a');
          link.href = floorplanPNG;
          link.download = canvasName + '_' + key + '.png';
          link.click();
        }, 0)

      finishedDownloading = true;
    })
    }
    
  }

  function exportData() {

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

    console.log("floor registry:", floorRegistryExport)
    console.log("area registry:", areaRegistryExport)
    console.log("label registry:", labelRegistryExport)
    console.log(deviceRegistry);
    console.log(entityRegistry);
  }

  return (
    <div>
    {activeDropdown === 'export' &&
    <div className="dropdown-container">
        <div className='dropdown-content'>
        <button onClick={() => exportData()}>Export to Home Assistant</button>
        <button onClick={() => generateImages()}>Export as png</button>
        </div>
    </div>
    }
    </div>
  );
}

export default ExportDropdown;