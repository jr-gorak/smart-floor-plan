import {useCallback, useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import {
deleteImg, copyImg, settingsImg, lockImg, unlockImg, lorawanImg, batteryImg, lightoffImg, co2Img, voltageImg, humidityImg, thermometerImg, pressureImg, soundImg, motionImg,
doorwayImg, windowImg, personImg, sensorImg, stairsImg, bedImg, sofaImg, chairImg, threesofaImg, stoveImg, kitchensinkImg, bathtubImg, roundsinkImg, toiletImg,

windowClosedImg,
doorImg,
zigbeeImg} from '../icons/index';

import { db } from "../firebase";
import { addDoc, collection, doc, updateDoc, query, getDoc } from "firebase/firestore";
import DeviceSettings from "./menu/toolset/DeviceSettings";
import RoomSettings from "./menu/toolset/RoomSettings";
import { v4 as uuidv4 } from 'uuid';
import './css/FabricCanvas.css';
import DeleteWarning from "./DeleteWarning";

fabric.FabricObject.prototype.toObject = (function(toObject) {
  return function(propertyArray = []) {
    return {
      ...toObject.call(this, propertyArray),
      classifier: this.classifier,
      id: this.id,
      area_id: this.area_id
    };
  };
})(fabric.FabricObject.prototype.toObject);

function FabricCanvas({canvasInfo, canvasData, canvasState, onCanvasID, onSaveToggle, onSaveResult, onLoadToggle, onRefreshToggle, 
    onDeviceToggle, user, onDeviceList, onHandlerToggle, onFloorData, onFloorArray}) {
    
    const { canvasWidth, canvasHeight, canvasName, canvasID, drawWidth, entityRegistry, deviceRegistry } = canvasInfo
    const { deviceList, originalDeviceList, labelList, floorData, canvasImageData, canvasDevice, floorArray } = canvasData
    const { canvasAction, saveToggle, loadToggle, refreshToggle, deviceToggle } = canvasState
    
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [shape, setShape] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [x1, setX1] = useState(0);
    const [y1, setY1] = useState(0);
    const [tempObject, setTempObject] = useState(null);
    const [togglePopup, setTogglePopup] = useState(false);
    const [activeDevice, setActiveDevice] = useState(null);
    const [activeRoom, setActiveRoom] = useState(null);
    const [updatedRoom, setUpdatedRoom] = useState(null);
    const [updateDeviceToggle, setUpdateDeviceToggle] = useState(null);
    const [updatedDevice, setUpdatedDevice] = useState(null);
    const [polygonVertices, setPolygonVertices] = useState([]);
    const [roomLabel, setRoomLabel] = useState("");
    const [hideRooms, setHideRooms] = useState(false);
    const [hideLabels, setHideLabels] = useState(false);
    const [hideDevices, setHideDevices] = useState(false);
    const [deleteWarning, setDeleteWarning] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [stachedFloor, setStachedFloor] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [activeFloor, setActiveFloor] = useState(() => {const stored = sessionStorage.getItem("activeFloor"); return stored? JSON.parse(stored) : floorArray[0]; });
    const retrieveUpdate = (update) => setUpdatedDevice(update);

    const settingsMode = 'canvas';

    const viewpointToggle = useCallback(() => {
        if (hideRooms) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'mark') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'mark') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        }

        if (hideLabels) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'text') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'text') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        } 

        if (hideDevices) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'device') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if(obj.classifier === 'device') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        }
    }, [hideDevices, hideLabels, hideRooms])

    function AddFloor(direction) {
        if (direction === 'up') {
            let floorCount = 0;
            floorArray.forEach((floor) => {
                if (floor.includes('B')) {
                    floorCount++
                }
            })
            if (floorArray.length < 5) {
                onFloorArray(floors => [((floorArray.length - floorCount) + "F"), ...floors])
            }
        }
        if (direction === 'down') {
            let floorCount = 0;
            floorArray.forEach((floor) => {
                if (floor.includes('F')) {
                    floorCount++
                }
            })
            if (floorArray.length < 5) {
            onFloorArray(floors => [...floors, ((floorArray.length - floorCount) + "B")])
            }
        }
    }

    const SwitchFloor = useCallback(async (floor) => {
        removeTemporaryObjects();
        const file = fabricCanvas.current.toJSON();
        const objArray = [];

        async function cloneObjects() {
            const objects = fabricCanvas.current.getObjects().filter(obj => obj.classifier === 'stairs' || obj.classifier === 'locked')
            for (const obj of objects) {
                const clone = await obj.clone()
                objArray.push(clone);
            }
        }

        await cloneObjects();

        onFloorData(files => ({
            ...files, 
            [activeFloor]: file
        }))

        fabricCanvas.current.dispose()

        const blankCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
        });

        if (floorData[floor]) {   
            blankCanvas.loadFromJSON(floorData[floor]);
            
            setActionType(null);       
        } else if (objArray.length) {
            objArray.forEach(obj => {
                blankCanvas.add(obj)
            })
        }

        fabricCanvas.current = blankCanvas;
         setTimeout(() => {
                requestAnimationFrame(() => {
            viewpointToggle();
            fabricCanvas.current.renderAll();
        });
         }, 0)

        setActiveFloor(floor)
        setActionType(null);  
    }, [activeFloor, canvasHeight, canvasWidth, floorData, onFloorData, viewpointToggle])

    const RemoveFloor = useCallback((floor) => {
        if (floorData[floor] && floorData[floor].objects.length > 0 && stachedFloor === null) {
            setDeleteWarning(true);
            setStachedFloor(floor);
            return;
        } else if (floorData[floor]){
            const existingData = {...floorData}
            delete existingData[floor];
            onFloorData(existingData)
        } else if (fabricCanvas.current._objects.length > 0 && stachedFloor === null) {
            setDeleteWarning(true);
            setStachedFloor(floor);
            return;
        }
  
        if (activeFloor === floor) {
            fabricCanvas.current.clear();
            fabricCanvas.current.backgroundColor = 'white';
            let nextFloor = floorArray[floorArray.indexOf(floor)+1]
            if(activeFloor.includes("B")) {
                nextFloor = floorArray[floorArray.indexOf(floor)-1]
            }
            SwitchFloor(nextFloor)
        }

        onFloorArray(original => original.filter(floorID => floorID !== floor))
        setStachedFloor(null);
        setDeleteConfirmation(null);

    }, [SwitchFloor, activeFloor, floorArray, floorData, stachedFloor, onFloorData, onFloorArray])

    const AssignAreaIDs = useCallback((room) => {
        const x1 = room.left;
        const x2 = room.left + room.width;
        const y1 = room.top;
        const y2 = room.top + room.height;

        fabricCanvas.current.getObjects().forEach(obj => {
            if(obj.classifier === 'device' && obj.left > x1 && obj.left < x2 && obj.top > y1 && obj.top < y2) {
                obj.set({area_id: room.area_id})
                const findDevice = deviceList.find(d => d.id === obj.id)
                if (findDevice) {
                    findDevice.area_id = room.area_id;
                    const newDeviceList = [...deviceList];
                    onDeviceList(newDeviceList);
                }
            }
        });
    }, [deviceList, onDeviceList]);

    const AssignAreaIDsOnMove = useCallback((device) => {
        let matchedID = false;
        fabricCanvas.current.getObjects().forEach(room => {
            if(room.classifier === 'mark' && device.left > room.left && device.left < room.left + room.width && device.top > room.top && device.top < room.top + room.height) {
                device.set({area_id: room.area_id})
                const findDevice = deviceList.find(d => d.id === device.id)
                if (findDevice) {
                    findDevice.area_id = room.area_id;
                    const newDeviceList = [...deviceList];
                    onDeviceList(newDeviceList);
                }
                matchedID = true;
                return;
            } 
        });

        if (!matchedID) {
            device.set({area_id: null})
            const findDevice = deviceList.find(d => d.id === device.id)
            if (findDevice) {
                findDevice.area_id = null;
                const newDeviceList = [...deviceList];
                onDeviceList(newDeviceList);
            }
        }
    }, [deviceList, onDeviceList]);

    function sessionSave(canvas) {
        fabricCanvas.current.getObjects().forEach(obj => {
            obj.visible = true;
        });
        
        setTimeout(() => {
            const file = canvas.toJSON();
            sessionStorage.setItem('fabricCanvas', JSON.stringify(file));
            }, 0)
        }

    function sessionLoad() {
        const retrieve = sessionStorage.getItem('fabricCanvas');
        if (retrieve) {
            fabricCanvas.current.loadFromJSON(retrieve, () => {
                requestAnimationFrame(() => {
                    fabricCanvas.current.renderAll();
                    setActionType(null);
                });
            });
        }
    }

    function removeTemporaryObjects() {
        const tempObjects = fabricCanvas.current.getObjects().filter(obj => obj.classifier === "temporary")
        tempObjects.forEach(obj => fabricCanvas.current.remove(obj))
    }

    //Save Floor List
    useEffect(() => {
        sessionStorage.setItem("floorArray", JSON.stringify(floorArray));
        sessionStorage.setItem("activeFloor", JSON.stringify(activeFloor));
        sessionStorage.setItem("floorData", JSON.stringify(floorData));
    }, [floorArray, activeFloor, floorData])

    useEffect(() => {
        if (deleteConfirmation) {
            RemoveFloor(stachedFloor)
        }
    }, [deleteConfirmation, stachedFloor, RemoveFloor])

    //Initialize Canvas
    useEffect(() => {

        fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
        });

        if (!refreshToggle) {
        setTimeout(() => {
            sessionLoad();
                requestAnimationFrame(() => {
                    fabricCanvas.current.renderAll();
                });
        }, 100);
        }

        const triggerSave = () => {
            sessionSave(fabricCanvas.current)
        };

        window.addEventListener("beforeunload", triggerSave);

        let selectFlag = false;

        function checkObjects() {
            if (selectFlag) return;
            selectFlag = true;

            const activeGroup = fabricCanvas.current.getActiveObject()

            if (activeGroup.classifier === 'device') return;

            if (activeGroup && activeGroup._objects) {
                const unlockedObjects = activeGroup.getObjects().filter(obj => obj.classifier !== 'locked')
                
                fabricCanvas.current.discardActiveObject()
                
                if (unlockedObjects.length > 0) {
                    const selection = new fabric.ActiveSelection(unlockedObjects, {
                        canvas: fabricCanvas.current          
                    })
                    fabricCanvas.current.setActiveObject(selection);
                    fabricCanvas.current.renderAll();
                } else {
                    fabricCanvas.current.discardActiveObject()
                }
            }
            selectFlag = false;
        }

        fabricCanvas.current.on('selection:created', checkObjects)
        fabricCanvas.current.on('selection:updated', checkObjects)
        window.addEventListener("beforeunload", removeTemporaryObjects)

        return () =>
        {
            window.removeEventListener("beforeunload", removeTemporaryObjects);
            fabricCanvas.current?.dispose();
            fabricCanvas.current = null;
        }}, [canvasWidth, canvasHeight, refreshToggle, loadToggle]);

    //Canvas File Handling
    useEffect(() => {

        async function saveCanvas(canvas) {
            
            if (!user) return;

            const file = canvas.toJSON();
            file.height = canvas.getHeight();
            file.width = canvas.getWidth();

            try{
            const docRef = await addDoc(collection(db, "canvases"), {
                owner: user.uid,
                canvasName: canvasName,
                canvasData: file,
                floorplanData: floorData,
                floorArray: floorArray,
                shared: [],
                devices: deviceList,
                originalDevices: originalDeviceList,
                labelList: labelList,
                deviceRegistry: JSON.stringify(deviceRegistry),
                entityRegistry: JSON.stringify(entityRegistry),
                created: new Date(),
                updated: new Date(),
                });

                onCanvasID(docRef.id);
                onSaveResult('success')
            } catch (error) {
                onSaveResult('failure')
                console.log(error);
            }
        }

        async function updateCanvas(canvas) {
            const file = canvas.toJSON();
            file.height = canvas.getHeight();
            file.width = canvas.getWidth();

            try{
            await updateDoc(doc(db, "canvases", canvasID), {
                canvasData: file,
                floorplanData: floorData,
                floorArray: floorArray,
                devices: deviceList,
                originalDevices: originalDeviceList,
                labelList: labelList,
                deviceRegistry: JSON.stringify(deviceRegistry),
                entityRegistry: JSON.stringify(entityRegistry),
                updated: new Date()
                });
                onSaveResult('success')
            } catch (error) {
                onSaveResult('failure')
                console.log(error);
            }
        }

        async function loadCanvas() {

            const q = query(
            doc(db, "canvases", canvasID)
            );

            try{ 
            
                const querySnapshot = await getDoc(q);
                const retrieve = querySnapshot.data();
                const json = retrieve.canvasData;

                if (retrieve) {

                refreshCanvas();
                
                onFloorArray(retrieve.floorArray);
                onFloorData(retrieve.floorplanData);
                setActiveFloor("GR");
                fabricCanvas.current.loadFromJSON(json, () => {
                    
                    sessionSave(fabricCanvas.current)
                    requestAnimationFrame(() => {
                        fabricCanvas.current.renderAll();
                    });
                });
                    setActionType(null);                   
                }

            } catch(error) {
                console.log(error);
            }
        };

        function refreshCanvas() {
            fabricCanvas.current.clear();
            fabricCanvas.current.backgroundColor = "white"
            sessionSave(fabricCanvas.current);
            requestAnimationFrame(() => {
                fabricCanvas.current.renderAll();
            });
            onFloorArray(["GR"])
            setActiveFloor("GR")
            onFloorData({})
        };


        if (saveToggle && (canvasID === null || canvasID ==='null' || canvasID === 'load')) {
            saveCanvas(fabricCanvas.current);
            onSaveToggle();
        } if (saveToggle && canvasID) {
            updateCanvas(fabricCanvas.current);
            onSaveToggle();
        } if (loadToggle && canvasID) {
            loadCanvas();
            onLoadToggle();
        } if (refreshToggle) {
            refreshCanvas();
            onRefreshToggle()
        }
            
    }, [canvasHeight, canvasWidth, canvasName, saveToggle, onSaveToggle, loadToggle, onLoadToggle, user, canvasID, onCanvasID, refreshToggle, onRefreshToggle, canvasAction, onSaveResult, deviceList, originalDeviceList, floorArray, floorData, labelList, entityRegistry, deviceRegistry, onFloorData, onFloorArray])

    // Setting Background Images
    useEffect(()=> {

        function sortKeys(data) {
            const defaultKey = data.find(key => key === "GR");
            const fKeys = data.filter(key => key.includes("F"));
            const bKeys = data.filter(key => key.includes("B"));
            onFloorArray([...fKeys.reverse(), defaultKey, ...bKeys])
        }

        async function addImageData(data) {

            const mapImageToCanvas = {}

            for (const key of Object.keys(data)) { 
                fabric.FabricImage.fromURL(data[key]).then((img) => {
                    fabricCanvas.current.backgroundImage = img;
                    fabricCanvas.current.backgroundImage.classifier = 'background';
                    fabricCanvas.current.backgroundImage.id = null;
                    fabricCanvas.current.backgroundImage.area_id = null;
                    fabricCanvas.current.renderAll();
                    if(key === 'GR') {
                        sessionStorage.setItem('fabricCanvas', JSON.stringify(fabricCanvas.current.toJSON()));
                    }
                    mapImageToCanvas[key] = fabricCanvas.current.toJSON();
                    
                    fabricCanvas.current.dispose();
                    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                        width: canvasWidth,
                        height: canvasHeight,
                        backgroundColor: 'white',
                    });
                }) ;  
            };
            return mapImageToCanvas
        };
        
        if(canvasImageData && imageLoading) {

            sortKeys(Object.keys(canvasImageData));

            (async () => {
                const initializedCanvases = await addImageData(canvasImageData)
                onFloorData(initializedCanvases)
                setImageLoading(false);
            })();
        }
    }, [canvasImageData, canvasHeight, canvasWidth, imageLoading, floorData, onFloorData, onFloorArray]);

    // Create Devices
    useEffect(() => {
        function createDevice(device) {

            let l = canvasWidth/2;
            let t = canvasHeight/2;
            let sx = 1;
            let sy = 1;
            let area_id = null;

            if(updateDeviceToggle) {
                
                const oldDevice =  fabricCanvas.current.getObjects().find(obj => obj.id === updatedDevice.id)
                if (oldDevice) {
                    l = oldDevice.left;
                    t = oldDevice.top;
                    sx = oldDevice.scaleX;
                    sy = oldDevice.scaleY;
                    area_id = oldDevice.area_id;
                    fabricCanvas.current.remove(oldDevice);
                    setUpdateDeviceToggle(false);
                }
            }

            const deviceArray = []
            let sensorCounter = 0;
            let angleScaler = 0;

            let deviceHolder = lorawanImg;

            if (device.platform === 'zha') {
                deviceHolder = zigbeeImg
            }

            var deviceImg = new fabric.FabricImage(deviceHolder, {
                left: 0,
                top: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                originX: 'center',
                originY: 'center',
                selectable: true,
                strokeUniform: true,
                id: device.id,
                classifier: 'device',
                area_id: area_id,
            });

            deviceArray.push(deviceImg);
            

            const deviceText = new fabric.FabricText(device.name, {
                fontSize: 12,
                id: null,
                classifier: 'text',
                path: null,
                area_id: area_id,
            })

            deviceText.set({
                left: deviceImg.left - deviceText.width / 2,
                top: deviceImg.top + 35,
            })

            deviceArray.push(deviceText);

            device.entities.forEach(sensor => {
                if (sensor.visible === true) {
                    sensorCounter++;
                }
            });

            device.entities.forEach(sensor => {
                if (sensor.visible === true) {
                    const angle = (2 * Math.PI / sensorCounter) * angleScaler;

                    const x = deviceImg.left + 30 * Math.cos(angle);
                    const y = deviceImg.top + 30 * Math.sin(angle);

                    let imgHolder = sensorImg;

                    if (sensor.type.toLowerCase().includes('temp')) {
                        imgHolder = thermometerImg;
                    } else if (sensor.type.toLowerCase().includes('occupancy')) {
                        imgHolder = personImg;
                    } else if (sensor.type.toLowerCase().includes('battery')) {
                        imgHolder = batteryImg;
                    } else if (sensor.type.toLowerCase().includes('light')) {
                        imgHolder = lightoffImg;
                    } else if (sensor.type.toLowerCase().includes('co2')) {
                        imgHolder = co2Img;
                    } else if (sensor.type.toLowerCase().includes('volt') || sensor.type.toLowerCase().includes('vdd')) {
                        imgHolder = voltageImg;
                    } else if (sensor.type.toLowerCase().includes('humidity')) {
                        imgHolder = humidityImg;
                    } else if (sensor.type.toLowerCase().includes('pressure')) {
                        imgHolder = pressureImg;
                    } else if (sensor.type.toLowerCase().includes('sound')) {
                        imgHolder = soundImg;
                    } else if (sensor.type.toLowerCase().includes('motion')) {
                        imgHolder = motionImg;
                    } else if (sensor.type.toLowerCase().includes('door')) {
                        imgHolder = doorImg;
                    } else if (sensor.type.toLowerCase().includes('window')) {
                        imgHolder = windowClosedImg;
                    } 

                    var sensorObject = new fabric.FabricImage(imgHolder, {
                        left: x,
                        top: y,
                        scaleX: 1,
                        scaleY: 1,
                        originX: 'center',
                        originY: 'center',
                        id: sensor.id,
                        classifier: 'sensor',
                        area_id: area_id,
                });

                    angleScaler++;
                    deviceArray.push(sensorObject); 
                }
            });

                const group = new fabric.Group(deviceArray, {
                left: l,
                top: t,
                scaleX: sx,
                scaleY: sy,
                strokeUniform: true,
                originX: 'center',
                originY: 'center',
                classifier: 'device',
                id: device.id,
                area_id: area_id,
            });

            fabricCanvas.current.add(group);
            fabricCanvas.current.renderAll();
            setActionType(null);

            group.on('moving', () => {
                AssignAreaIDsOnMove(group)
            })

            }

        if(deviceToggle) {
            createDevice(canvasDevice);
            onDeviceToggle();
        }

        if(updateDeviceToggle) {
            createDevice(updatedDevice);
        }

    }, [deviceToggle, onDeviceToggle, updateDeviceToggle, canvasDevice, canvasWidth, canvasHeight, updatedDevice, AssignAreaIDs, AssignAreaIDsOnMove]);

    //Create Components
    useEffect(() => {

        function createComponent(type) {
            var component = new fabric.FabricImage(type, {
                left: canvasWidth/2,
                top: canvasHeight/2,
                originX: 'center',
                originY: 'center',
                scaleX: 0.1,
                scaleY: 0.1,
                selectable: true,
                strokeUniform: true,
                id: null,
                classifier: canvasAction === 'stairs' ? 'stairs' : 'draw',
                area_id: null,
            });

            fabricCanvas.current.add(component);
            fabricCanvas.current.renderAll();
        };

        if (canvasAction === 'doorway') {
            createComponent(doorwayImg);
        } else if (canvasAction === 'window') {
            createComponent(windowImg);
        }  else if (canvasAction === 'stairs') {
            createComponent(stairsImg);
        } else if (canvasAction === 'bed') {
            createComponent(bedImg);
        } else if (canvasAction === 'chair') {
            createComponent(chairImg);
        } else if (canvasAction === 'sofa') {
            createComponent(sofaImg);
        } else if (canvasAction === 'three-sofa') {
            createComponent(threesofaImg);
        } else if (canvasAction === 'stove') {
            createComponent(stoveImg);
        } else if (canvasAction === 'kitchen-sink') {
            createComponent(kitchensinkImg);
        }  else if (canvasAction === 'bathtub') {
            createComponent(bathtubImg);
        } else if (canvasAction === 'round-sink') {
            createComponent(roundsinkImg);
        } else if (canvasAction === 'toilet') {
            createComponent(toiletImg);
        }

    }, [canvasAction, canvasHeight, canvasWidth]);

    // Drawing Shapes
    useEffect(() => {

        setActionType(canvasAction)

        if (actionType === 'select') {
            fabricCanvas.current.selection = true;
            fabricCanvas.current.getObjects().forEach(obj => {
                obj.selectable = true;
                obj.perPixelTargetFind = true;
                setControls(obj)

                if (obj.classifier === 'device') {
                    obj.on('moving', () => {
                        AssignAreaIDsOnMove(obj)
                    })
                }

                if (obj.classifier === 'mark' || obj.classifier === 'locked') {
                    obj.lockMovementX = true;
                    obj.lockMovementY = true;
                    obj.lockRotation = true;
                    obj.lockScalingX = true;
                    obj.lockScalingFlip = true;
                    obj.lockScalingY = true;
                    obj.cursorStyle = 'default';
                    obj.cornerColor = 'rgba(0, 0, 0, 0)';
                    obj.hasBorders = false;
                }
            });

        } else {
            fabricCanvas.current.selection = false;
            fabricCanvas.current.getObjects().forEach(o => {
                o.selectable = false;
            });
        }

        function setControls(object) {

            if (object.classifier === 'text') {
                return;
            }

            if (object.classifier === 'draw' || object.classifier === 'stairs' || object.classifier === 'locked') {
                object.controls.copyControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -16,
                    offsetX: 16,
                    cursorStyle: 'pointer',
                    mouseUpHandler: copyObject,
                    render: renderIcon(copyImg),
                    cornersize: 24,
                });

                object.controls.lockControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -16,
                    offsetX: -16,
                    cursorStyle: 'pointer',
                    mouseUpHandler: lockObject,
                    render: renderIcon(object.classifier === 'locked' ?  lockImg : unlockImg),
                    cornersize: 24, 
                })
            }

            if (object.classifier === 'device') {
                object.controls.settingsControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -16,
                    offsetX: 16, 
                    cursorStyle: 'pointer',
                    mouseUpHandler: deviceSettings,
                    render: renderIcon(settingsImg),
                    cornersize: 24,
                })
            }

            if (object.classifier === 'mark') {
                object.controls.settingsControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -16,
                    offsetX: 16, 
                    cursorStyle: 'pointer',
                    mouseUpHandler: roomInformation,
                    render: renderIcon(settingsImg),
                    cornersize: 24,
                })
            }

            object.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: 16,
                offsetX: 16,
                cursorStyle: 'pointer',
                mouseUpHandler: deleteObject,
                render: renderIcon(deleteImg),
                cornersize: 24,
            });
        };
        
        if (shape) {
            setControls(shape);
        };

        const mouseDownLine = (event) => {
            const pointer = fabricCanvas.current.getPointer(event.e)
            setX1(pointer.x);
            setY1(pointer.y);
            const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                stroke: 'black',
                strokeWidth: drawWidth,
                strokeUniform: true,
                objectCaching: false,
                classifier: 'draw',
                id: null,
                area_id: null,
                })
            fabricCanvas.current.add(newLine);
            setShape(newLine);
            setIsDrawing(true);
        };

        const mouseDownRect = (event) => {
            const pointer = fabricCanvas.current.getPointer(event.e)
            setX1(pointer.x);
            setY1(pointer.y);
            const newRect = new fabric.Rect({
                left: pointer.x,
                top: pointer.y,
                originX: 'center',
                originY: 'center',
                width: 0,
                height: 0,
                fill: null,
                stroke: 'black',
                strokeWidth: drawWidth,
                strokeUniform: true,
                objectCaching: false,
                classifier: 'draw',
                id: null,
                area_id: null,
            });
            fabricCanvas.current.add(newRect);
            setShape(newRect);
            setIsDrawing(true);
        }

        const mouseDownCircle = (event) => {
            const pointer = fabricCanvas.current.getPointer(event.e)
            setX1(pointer.x);
            setY1(pointer.y);
            const newCircle = new fabric.Circle({
                left: pointer.x,
                top: pointer.y,
                originX: 'left',
                originY: 'top',
                fill: null,
                radius: 0,
                stroke: 'black',
                strokeWidth: drawWidth,
                strokeUniform: true,
                objectCaching: false,
                classifier: 'draw',
                id: null,
                area_id: null,
            });
            fabricCanvas.current.add(newCircle);
            setShape(newCircle);
            setIsDrawing(true);
        }    

        const mouseDownMark = (event) => {
            const pointer = fabricCanvas.current.getPointer(event.e);
            const point = {x: pointer.x, y: pointer.y};
            setPolygonVertices([...polygonVertices, point])

            const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                stroke: 'red',
                strokeWidth: 5,
                strokeUniform: true,
                objectCaching: false,
                classifier: 'temporary',
                id: null,
                area_id: null,
                })

            fabricCanvas.current.add(newLine);
            setShape(newLine);
            setIsDrawing(true);
        }

        const drawLine = (event) => {
            if (isDrawing && shape) {
                const pointer = fabricCanvas.current.getPointer(event.e);
                shape.set({x2: pointer.x, y2: pointer.y});
                const dx = (pointer.x - x1);
                const dy = (pointer.y - y1);
                const rad = Math.atan2(dy, dx);
                const deg = rad * (180/Math.PI);

                if ((deg < 2 && deg > -2) || (deg > 178 || deg < -178))  {
                    shape.set({x2: pointer.x, y2: y1});
                };

                if ((deg < -88 && deg > -92) || (deg > 88 && deg < 92)) {
                    shape.set({x2: x1, y2: pointer.y});
                };

                if ((polygonVertices.length > 2 && pointer.x < polygonVertices[0].x + 5 && pointer.x > polygonVertices[0].x - 5) && (pointer.y < polygonVertices[0].y + 5 && pointer.y > polygonVertices[0].y - 5)) {
                    shape.set({x2: polygonVertices[0].x, y2: polygonVertices[0].y})
                }

                fabricCanvas.current.renderAll();
            };
        };

        const drawRect = (event) => {
            if (isDrawing && shape) {
                const pointer = fabricCanvas.current.getPointer(event.e);

                const width = Math.abs(x1 - pointer.x);
                const height = Math.abs(y1 - pointer.y);
                const left = Math.min(pointer.x, x1)
                const top = Math.min(pointer.y, y1)

                shape.set({
                    left: left + width / 2,
                    top: top + height / 2,
                    width, 
                    height
                });

                fabricCanvas.current.renderAll();
            }
        }
        
        const drawCircle = (event) => {
            if (isDrawing && shape) {
                const pointer = fabricCanvas.current.getPointer(event.e);
                const radius = Math.hypot(pointer.x - x1, pointer.y - y1) / 2;
                shape.set({radius});
                fabricCanvas.current.renderAll();
            }
        }

        const mouseUpLine = (event) => {
            const pointer = fabricCanvas.current.getPointer(event.e)
            const dx = (pointer.x - x1)
            const dy = (pointer.y - y1)
            const dist = Math.sqrt(dx*dx + dy*dy)

            if (dist < 5) {
                fabricCanvas.current.remove(shape);
            } else {
                shape.setCoords();
                sessionSave(fabricCanvas.current);
            }

            updateFloor();
            setIsDrawing(false);
            setShape(null);
        };

        const mouseUpShape = () => {
            updateFloor();
            shape.setCoords()
            setIsDrawing(false);
            setShape(null);
        }

        const mouseUpMark = () => {

            if (polygonVertices.length > 2 && (shape.x1 < polygonVertices[0].x + 5 && shape.x1 > polygonVertices[0].x - 5) && (shape.y1 < polygonVertices[0].y + 5 && shape.y1> polygonVertices[0].y - 5)) {
                const id = uuidv4();
                const mark = new fabric.Polygon(polygonVertices, {
                    fill:  '#ff00000d',
                    stroke: '#ff00000d',
                    strokeWidth: 1,
                    id: id,
                    classifier: 'mark',
                    area_id: id,
                })

                const text = new fabric.FabricText('Room Label', {
                    fontSize: 24,
                    id: mark.id,
                    classifier: 'text',
                    path: null,
                    area_id: mark.area_id,
                })

                text.set({
                    left: mark.left + (mark.height/2),
                    top: mark.top + (mark.height/2),
                })
                fabricCanvas.current.add(mark)
                fabricCanvas.current.add(text)
                setPolygonVertices([]);
                setShape(null);
                setIsDrawing(false);

                fabricCanvas.current.getObjects().forEach(o => {
                    if (o.classifier === 'temporary') {
                        fabricCanvas.current.remove(o);
                    }
                });
                fabricCanvas.current.renderAll();

                AssignAreaIDs(mark)
                updateFloor();
            }
        };

        const mouseDown = (event) => {
            switch (actionType) {
                case 'line':
                    mouseDownLine(event);
                    break;
                case 'square':
                    mouseDownRect(event);
                    break;
                case 'circle':
                    mouseDownCircle(event);
                    break;
                case 'mark':
                    mouseDownMark(event);
                    break;
                default:
                    break;
            }
        };

        const mouseMove = (event) => {
            switch (actionType) {
                case 'line':
                    drawLine(event);
                    break;
                case 'square':
                    drawRect(event);
                    break;
                case 'circle':
                    drawCircle(event);
                    break;
                case 'mark':
                    drawLine(event);
                    break;
                default:
                    break;
            }
        };

        const mouseUp = (event) => {
            switch (actionType) {
                case 'line':
                    mouseUpLine(event);
                    break;
                case 'square':
                    mouseUpShape();
                    break;
                case 'circle':
                    mouseUpShape();
                    break;
                case 'mark':
                    mouseUpMark();
                    break;
                default:
                    break;
            }
        };

        if (polygonVertices.length > 0 && canvasAction !== 'mark') {
            setPolygonVertices([]);
            setShape(null);
            setIsDrawing(false);

            fabricCanvas.current.getObjects().forEach(o => {
                if (o.classifier === 'temporary') {
                    fabricCanvas.current.remove(o);
                }
            });
            fabricCanvas.current.renderAll();
         };

         if (updatedRoom) {
            const oldRoom = fabricCanvas.current.getObjects().find(obj => obj.id === updatedRoom.id && obj.classifier === 'mark')
            const oldText = fabricCanvas.current.getObjects().find(obj => obj.id === updatedRoom.id && obj.classifier === 'text')
            if (oldRoom && oldText) {
                oldRoom.set({area_id: updatedRoom.area_id, fill: updatedRoom.fill, stroke: updatedRoom.fill})
                oldText.set({text: roomLabel})
                fabricCanvas.current.renderAll();
                AssignAreaIDs(updatedRoom)
            }
            setUpdatedRoom(null);
         }
    
    function renderIcon(icon) {
            return function (ctx, left, top, _styleOverride, fabricObject) {
                const size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(icon, -size / 2, -size / 2, size, size);
                ctx.restore();
            }};

        function deleteObject(_eventData, transform) {
            const canvas = transform.target.canvas;

            if (transform.target.classifier === 'text') {
                return;
            }

            if (transform.target.classifier === 'device') {
                const id = transform.target.id;
                const deviceIndex = deviceList.findIndex(d => d.id === id)
                const originalDevice = originalDeviceList.find(d => d.id === id)
                deviceList[deviceIndex] = structuredClone(originalDevice);
                const newDeviceList = [...deviceList];
                onDeviceList(newDeviceList);
            }

            if (transform.target.classifier === 'mark') {
                const oldText = fabricCanvas.current.getObjects().find(obj => obj.id === transform.target.id && obj.classifier === 'text')
                if (oldText) {
                    canvas.remove(oldText);
                }
            }

            canvas.remove(transform.target);
            canvas.requestRenderAll();
        };

        function copyObject(_eventData, transform) {
            const canvas = transform.target.canvas;
            transform.target.clone().then((cloned) => {
                cloned.left += 10;
                cloned.top += 10;
                cloned.controls.deleteControl = transform.target.controls.deleteControl;
                cloned.controls.copyControl = transform.target.controls.copyControl;
                cloned.classifier = 'draw';
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
            })
        };

        function deviceSettings(_eventData, transform) {
            const id = transform.target.id;
            const findDevice = deviceList.find(d => d.id === id)
            setActiveDevice(findDevice);
            setTogglePopup(true);
        }

        function lockObject(_eventData, transform) {
            const obj = transform.target;
            if (obj.classifier !== 'locked') {
                obj.classifier = 'locked';
                    obj.lockMovementX = true;
                    obj.lockMovementY = true;
                    obj.lockRotation = true;
                    obj.lockScalingX = true;
                    obj.lockScalingFlip = true;
                    obj.lockScalingY = true;
                    obj.cursorStyle = 'default';
                    obj.cornerColor = 'rgba(0, 0, 0, 0)';
                    obj.hasBorders = false;
                    obj.isSelectableForGroup = () => false;
                    setControls(obj);
                    fabricCanvas.current.renderAll();
            } else {
                obj.classifier = 'draw';
                    obj.lockMovementX = false;
                    obj.lockMovementY = false;
                    obj.lockRotation = false;
                    obj.lockScalingX = false;
                    obj.lockScalingFlip = false;
                    obj.lockScalingY = false;
                    obj.cursorStyle = 'default';
                    obj.cornerColor = 'rgb(178,204,255)';
                    obj.hasBorders = true;
                    setControls(obj);
                    fabricCanvas.current.renderAll();
            }
        }

        function roomInformation(_eventData, transform) {
            const roomText = fabricCanvas.current.getObjects().find(obj => obj.id === transform.target.id && obj.classifier === 'text')
            setRoomLabel(roomText.text)
            setActiveRoom(transform.target);
        }
        
        function keyDown(e){
            const activeObject = fabricCanvas.current.getActiveObject()

            if (((activeObject && (activeObject.classifier === 'draw' || activeObject.classifier === 'stairs' || activeObject.classifier === 'locked'))) || ((tempObject && (tempObject.classifier === 'draw' || tempObject.classifier === 'stairs' || tempObject.classifier === 'locked')))) {
                if ((e.ctrlKey) && e.key === 'c') {
                    if(activeObject) {
                        setTempObject(activeObject);
                    }
                } else if ((e.ctrlKey) && e.key === 'x') {
                    if(activeObject) {
                        setTempObject(activeObject)
                        deleteObject(null, { target: activeObject})
                    }
                } else if ((e.ctrlKey) && e.key === 'v') {
                    if(tempObject) {
                        tempObject.clone().then((cloned) => {
                            cloned.left += 10;
                            cloned.top += 10;
                            cloned.controls.deleteControl = tempObject.controls.deleteControl;
                            cloned.controls.copyControl = tempObject.controls.copyControl;
                            fabricCanvas.current.add(cloned);
                            fabricCanvas.current.setActiveObject(cloned);
                            fabricCanvas.current.renderAll();
                        });
                    }
                } 
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if(activeObject && !activeDevice) {
                    deleteObject(null, { target: activeObject})
                    
                }
            }
        };

         function updateFloor() {
            const floorSnapshot = fabricCanvas.current.toJSON();
            onFloorData(files => ({
                ...files, 
                [activeFloor]: floorSnapshot
            }))
        }

        document.removeEventListener('keydown', keyDown);
        document.addEventListener('keydown', keyDown);

        fabricCanvas.current.on('mouse:down', mouseDown);
        fabricCanvas.current.on('mouse:move', mouseMove);
        fabricCanvas.current.on('mouse:up', mouseUp);

        fabricCanvas.current.on('object:added', updateFloor)
        fabricCanvas.current.on('object:modified', updateFloor)
        fabricCanvas.current.on('object:removed', updateFloor)
        

        return () => {
            document.removeEventListener('keydown', keyDown);

            if (fabricCanvas.current) {
                fabricCanvas.current.off('mouse:down', mouseDown);
                fabricCanvas.current.off('mouse:move', mouseMove);
                fabricCanvas.current.off('mouse:up', mouseUp);
            }
        }
    }, [tempObject, setTempObject, deviceList, onDeviceList, isDrawing, shape, actionType, canvasAction, x1, y1, originalDeviceList, activeDevice, drawWidth, polygonVertices, updatedRoom, roomLabel, AssignAreaIDs, AssignAreaIDsOnMove, activeFloor, onFloorData]);

    useEffect(() => {
        
    onHandlerToggle(togglePopup);

    }, [onHandlerToggle, togglePopup]);

    useEffect(() => {

    }, [])

    //Hidden View Toggles
    useEffect(() => {
        viewpointToggle();
    }, [viewpointToggle]);

    return (
        <div className="canvas-container">
            <div className="canvas-side-menu">
                <div className="canvas-controls">
                    <b>Viewpoint</b>
                    <div className="view-checkbox">
                        <p>Hide Rooms</p>
                        <input className='checkbox' type="checkbox" defaultChecked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)}/>
                    </div>
                    <div className="view-checkbox">
                        <p>Hide Labels</p>
                        <input className='checkbox' type="checkbox" defaultChecked={hideLabels} onChange={(e) => setHideLabels(e.target.checked)}/>
                    </div>
                    <div className="view-checkbox">
                        <p>Hide Devices</p>
                        <input className='checkbox' type="checkbox" defaultChecked={hideDevices} onChange={(e) => setHideDevices(e.target.checked)}/>
                    </div>
                </div>

                    <div className="floor-mapping">
                        <button className="arrow-button" onClick={() => AddFloor('up')}>+⇧</button>
                        {floorArray.map((floor) => (
                            <div key={floor} className="floor-button-container">
                                <button className={activeFloor === floor ? "floor-button-active" : "floor-button"} key={floor} onClick={() => SwitchFloor(floor)} disabled={activeFloor === floor}><b>{floor}</b></button>
                                {(floor !== 'GR') && (floor === floorArray[0] || floor === floorArray[floorArray.length - 1]) && 
                                <button className="remove-button" onClick={() => RemoveFloor(floor)}>X</button>
                                }
                            </div>
                        ))}
                        <button className="arrow-button" onClick={() => AddFloor('down')}>+⇩</button>
                    </div> 
            </div>

            <div>
                <canvas ref={canvasRef}></canvas>
                {canvasName && (
                <div className="canvas-info">
                    <div className="canvas-floor">
                        {activeFloor}
                    </div>

                    <div className="canvas-dimensions">
                        {canvasName} 
                        {" ("}{canvasWidth} x {canvasHeight}{")"}
                    </div>
                </div>
                )}
            </div>

            <div>

                {togglePopup && (
                    <DeviceSettings settingsMode={settingsMode} activeDevice={activeDevice} deviceList={deviceList} onTogglePopup={() => setTogglePopup(false)} onUpdateDeviceToggle={() => setUpdateDeviceToggle(true)} onDeviceList={onDeviceList} onUpdatedDevice={retrieveUpdate} labelList={labelList}></DeviceSettings>
                )
                }

                {activeRoom && (
                    <RoomSettings activeRoom={activeRoom} roomLabel={roomLabel} onActiveRoom={(value) => setActiveRoom(value)} onUpdatedRoom={(update) => setUpdatedRoom(update)} onUpdatedLabel={(text) => setRoomLabel(text)}></RoomSettings>
                )}

                {deleteWarning && (
                    <DeleteWarning onDeleteWarning={() => setDeleteWarning(false)} onDeleteConfirmation={() => setDeleteConfirmation(true)} onStachedFloor={() => setStachedFloor(null)}/>
                )}
            </div>
        </div>
    )
};

export default FabricCanvas;