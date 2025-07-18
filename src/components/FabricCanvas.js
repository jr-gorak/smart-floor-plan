import {useCallback, useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import {
deleteImg, copyImg, settingsImg, lorawanImg, batteryImg, lightoffImg, co2Img, voltageImg, humidityImg, thermometerImg, pressureImg, soundImg, motionImg,
doorwayImg, windowImg, personImg, sensorImg, stairsImg, bedImg, sofaImg, chairImg, threesofaImg, stoveImg, kitchensinkImg, bathtubImg, roundsinkImg, toiletImg} from '../icons/index';

import { db } from "../firebase";
import { addDoc, collection, doc, updateDoc, query, getDoc } from "firebase/firestore";
import DeviceSettings from "./menu/toolset/DeviceSettings";
import RoomSettings from "./menu/toolset/RoomSettings";
import { v4 as uuidv4 } from 'uuid';
import './css/FabricCanvas.css';

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



function FabricCanvas({canvasWidth, canvasHeight, canvasAction, canvasImage, canvasName, canvasID, onCanvasID, saveToggle, onSaveToggle, onSaveResult, loadToggle, onLoadToggle, refreshToggle, onRefreshToggle, 
    canvasDevice, deviceToggle, onDeviceToggle, user, deviceList, onDeviceList, originalDeviceList, onHandlerToggle, drawWidth}) {
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
    const [floorArray, setFloorArray] = useState(() => {const stored = sessionStorage.getItem("floorArray"); return stored? JSON.parse(stored) : ["GR"]; });
    const [activeFloor, setActiveFloor] = useState(() => {const stored = sessionStorage.getItem("activeFloor"); return stored? JSON.parse(stored) : floorArray[0]; });
    const [floorData, setFloorData] = useState(() => {const stored = sessionStorage.getItem("floorData"); return stored? JSON.parse(stored) : {}; });
    
    const retrieveUpdate = (update) => setUpdatedDevice(update);

    const settingsMode = 'canvas';

    function AddFloor(direction) {
        if (direction === 'up') {
            let floorCount = 0;
            floorArray.forEach((floor) => {
                if (floor.includes('B')) {
                    floorCount++
                }
            })
            if (floorArray.length < 5) {
                setFloorArray(floors => [((floorArray.length - floorCount) + "F"), ...floors])
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
            setFloorArray(floors => [...floors, ((floorArray.length - floorCount) + "B")])
            }
        }
    }

    function SwitchFloor(floor) {
        const file = fabricCanvas.current.toJSON();

        setFloorData(files => ({
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
        }

        fabricCanvas.current = blankCanvas;

        requestAnimationFrame(() => {
            fabricCanvas.current.renderAll();
        });

        setActiveFloor(floor)
    }

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
                });
            });
        }
    }

    //Save Floor List
    useEffect(() => {
        sessionStorage.setItem("floorArray", JSON.stringify(floorArray));
        sessionStorage.setItem("activeFloor", JSON.stringify(activeFloor));
        sessionStorage.setItem("floorData", JSON.stringify(floorData));
    }, [floorArray, activeFloor, floorData])

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

        return () =>
        {
            window.removeEventListener("beforeunload", triggerSave);
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
                shared: [],
                devices: deviceList,
                originalDevices: originalDeviceList,
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
                devices: deviceList,
                originalDevices: originalDeviceList,
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
                fabricCanvas.current.loadFromJSON(json, () => {
                    requestAnimationFrame(() => {
                        fabricCanvas.current.renderAll();
                        sessionSave(fabricCanvas.current)
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
            setFloorArray(["GR"])
            setActiveDevice("GR")
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
            
    }, [canvasHeight, canvasWidth, canvasName, saveToggle, onSaveToggle, loadToggle, onLoadToggle, user, canvasID, onCanvasID, refreshToggle, onRefreshToggle, canvasAction, onSaveResult, deviceList, originalDeviceList])

    // Setting Background Image
    useEffect(()=> {
        
        if(canvasImage) {
            fabric.FabricImage.fromURL(canvasImage).then((img) => {
                fabricCanvas.current.backgroundImage = img;
                fabricCanvas.current.backgroundImage.classifier = 'background';
                fabricCanvas.current.backgroundImage.id = null;
                fabricCanvas.current.backgroundImage.area_id = null;
                fabricCanvas.current.renderAll();
            })
        }
    }, [canvasImage]);

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

            var deviceImg = new fabric.FabricImage(lorawanImg, {
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
            

            const deviceText = new fabric.FabricText(device.label, {
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
                classifier: 'draw',
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

                if (obj.classifier === 'mark') {
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

            if (object.classifier === 'draw') {
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

            setIsDrawing(false);
            setShape(null);
        };

        const mouseUpShape = () => {
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
            })
        };

        function deviceSettings(_eventData, transform) {
            const id = transform.target.id;
            const findDevice = deviceList.find(d => d.id === id)
            setActiveDevice(findDevice);
            setTogglePopup(true);
        }

        function roomInformation(_eventData, transform) {
            const roomText = fabricCanvas.current.getObjects().find(obj => obj.id === transform.target.id && obj.classifier === 'text')
            setRoomLabel(roomText.text)
            setActiveRoom(transform.target);
        }

        function keyDown(e){

            const activeObject = fabricCanvas.current.getActiveObject()

            if ((activeObject && activeObject.classifier === 'draw') || (tempObject && tempObject.classifier === 'draw')) {
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

        document.removeEventListener('keydown', keyDown);
        document.addEventListener('keydown', keyDown);

        fabricCanvas.current.on('mouse:down', mouseDown);
        fabricCanvas.current.on('mouse:move', mouseMove);
        fabricCanvas.current.on('mouse:up', mouseUp);

        return () => {
            document.removeEventListener('keydown', keyDown);

            if (fabricCanvas.current) {
                fabricCanvas.current.off('mouse:down', mouseDown);
                fabricCanvas.current.off('mouse:move', mouseMove);
                fabricCanvas.current.off('mouse:up', mouseUp);
            }
        }
    }, [tempObject, setTempObject, deviceList, onDeviceList, isDrawing, shape, actionType, canvasAction, x1, y1, originalDeviceList, activeDevice, drawWidth, polygonVertices, updatedRoom, roomLabel, AssignAreaIDs, AssignAreaIDsOnMove]);

    useEffect(() => {
        
    onHandlerToggle(togglePopup);

    }, [onHandlerToggle, togglePopup]);

    useEffect(() => {

    }, [])

    //Hidden View Toggles
    useEffect(() => {
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

    }, [hideRooms, hideLabels, hideDevices]);

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
                        <button className="arrow-button" onClick={() => AddFloor('up')}>⇧</button>
                        {floorArray.map((floor) => (
                            <button className={activeFloor === floor ? "floor-button-active" : "floor-button"} key={floor} onClick={() => SwitchFloor(floor)} disabled={activeFloor === floor}><b>{floor}</b></button>
                        ))}
                        <button className="arrow-button" onClick={() => AddFloor('down')}>⇩</button>
                    </div>
                
            </div>

            

            <div>
                <canvas ref={canvasRef}></canvas>
                {canvasName && (
                <div>
                    <div className="canvas-info">
                        {canvasName} 
                        {" ("}{canvasWidth} x {canvasHeight}{")"}
                    </div>
                </div>
                )}
            </div>

            <div>

                {togglePopup && (
                    <DeviceSettings settingsMode={settingsMode} activeDevice={activeDevice} deviceList={deviceList} onTogglePopup={() => setTogglePopup(false)} onUpdateDeviceToggle={() => setUpdateDeviceToggle(true)} onDeviceList={onDeviceList} onUpdatedDevice={retrieveUpdate}></DeviceSettings>
                )
                }

                {activeRoom && (
                    <div>
                        <RoomSettings activeRoom={activeRoom} roomLabel={roomLabel} onActiveRoom={(value) => setActiveRoom(value)} onUpdatedRoom={(update) => setUpdatedRoom(update)} onUpdatedLabel={(text) => setRoomLabel(text)}></RoomSettings>
                    </div>
                )}
            </div>
        </div>
    )
};

export default FabricCanvas;