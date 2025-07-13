import {useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import {
deleteImg, copyImg, settingsImg, lorawanImg, batteryImg, lightoffImg, co2Img, voltageImg, humidityImg, thermometerImg, pressureImg, soundImg, motionImg,
doorwayImg, windowImg, personImg, sensorImg, stairsImg, bedImg, sofaImg, chairImg, threesofaImg, stoveImg, kitchensinkImg, bathtubImg, roundsinkImg, toiletImg} from '../icons/index';

import { db } from "../firebase";
import { addDoc, collection, doc, updateDoc, query, getDoc } from "firebase/firestore";
import DeviceSettings from "./menu/toolset/DeviceSettings";

fabric.FabricObject.prototype.toObject = (function(toObject) {
  return function(propertyArray = []) {
    return {
      ...toObject.call(this, propertyArray),
      classifier: this.classifier,
      id: this.id,
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
    const [updateDeviceToggle, setUpdateDeviceToggle] = useState(null);
    const [updatedDevice, setUpdatedDevice] = useState(null);
    const [polygonVertices, setPolygonVertices] = useState([]);
    
    const retrieveUpdate = (update) => setUpdatedDevice(update);

    const settingsMode = 'canvas';

    function sessionSave(canvas) {
        const file = canvas.toJSON();
        sessionStorage.setItem('fabricCanvas', JSON.stringify(file));
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

    //Initialize Canvas
    useEffect(() => {

        fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
        });

        setTimeout(() => {
            sessionLoad();
                requestAnimationFrame(() => {
                    fabricCanvas.current.renderAll();
                });
        }, 0);

        const triggerSave = () => {
            sessionSave(fabricCanvas.current)
        };

        window.addEventListener("beforeunload", triggerSave);

        return () =>
        {
            window.removeEventListener("beforeunload", triggerSave);
            fabricCanvas.current?.dispose();
            fabricCanvas.current = null;
        }}, [canvasWidth, canvasHeight]);

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
                    fabricCanvas.current.loadFromJSON(json)
                    requestAnimationFrame(() => {
                        fabricCanvas.current.renderAll();
                    });
                    setActionType(null);
                    sessionSave(fabricCanvas.current)
                }

            } catch(error) {
                console.log(error);
            }
        };

        function refreshCanvas() {
            fabricCanvas.current.clear();
            fabricCanvas.current.backgroundColor = "white";
            sessionSave(fabricCanvas.current)
            requestAnimationFrame(() => {
                fabricCanvas.current.renderAll();
            });
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
            
    }, [ canvasName, saveToggle, onSaveToggle, loadToggle, onLoadToggle, user, canvasID, onCanvasID, refreshToggle, onRefreshToggle, canvasAction, onSaveResult, deviceList, originalDeviceList])

    // Setting Background Image
    useEffect(()=> {
        
        if(canvasImage) {
            fabric.FabricImage.fromURL(canvasImage).then((img) => {
                fabricCanvas.current.backgroundImage = img;
                fabricCanvas.current.backgroundImage.classifier = 'background';
                fabricCanvas.current.backgroundImage.id = null;
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

            if(updateDeviceToggle) {
                
                const oldDevice =  fabricCanvas.current.getObjects().find(obj => obj.id === updatedDevice.id)
                if (oldDevice) {
                l = oldDevice.left;
                t = oldDevice.top;
                sx = oldDevice.scaleX;
                sy = oldDevice.scaleY;
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
            });

            deviceArray.push(deviceImg);
            

            const deviceText = new fabric.FabricText(device.label, {
                fontSize: 12,
                id: null,
                classifier: null,
                path: null,

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
            });

            fabricCanvas.current.add(group);
            fabricCanvas.current.renderAll();
            setActionType(null);

            }

        if(deviceToggle) {
            createDevice(canvasDevice);
            onDeviceToggle();
        }

        if(updateDeviceToggle) {
            createDevice(updatedDevice);
        }

    }, [deviceToggle, onDeviceToggle, updateDeviceToggle, canvasDevice, canvasWidth, canvasHeight, updatedDevice]);

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
            fabricCanvas.current.getObjects().forEach(o => {
                o.selectable = true;
                o.perPixelTargetFind = true;
                setControls(o)
            });

        } else {
            fabricCanvas.current.selection = false;
            fabricCanvas.current.getObjects().forEach(o => {
                o.selectable = false;
            });
        }

        function setControls(object) {
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
                const mark = new fabric.Polygon(polygonVertices, {
                    fill:  'rgba(255, 0, 0, 0.05)',
                    stroke: 'rgba(255, 0, 0, 0.05)',
                    strokeWidth: 1,
                    id: null,
                    classifier: 'mark'
                })

                fabricCanvas.current.add(mark)
                setPolygonVertices([]);
                setShape(null);
                setIsDrawing(false);

                fabricCanvas.current.getObjects().forEach(o => {
                    if (o.classifier === 'temporary') {
                        fabricCanvas.current.remove(o);
                    }
                });

                fabricCanvas.current.renderAll();
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

            if (transform.target.classifier === 'device') {
                const id = transform.target.id;
                const deviceIndex = deviceList.findIndex(d => d.id === id)
                const originalDevice = originalDeviceList.find(d => d.id === id)
                deviceList[deviceIndex] = structuredClone(originalDevice);
                const newDeviceList = [...deviceList];
                onDeviceList(newDeviceList);
            }

            const canvas = transform.target.canvas;
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
    }, [tempObject, setTempObject, deviceList, onDeviceList, isDrawing, shape, actionType, canvasAction, x1, y1, originalDeviceList, activeDevice, drawWidth, polygonVertices]);

    useEffect(() => {
        
        onHandlerToggle(togglePopup);

    }, [onHandlerToggle, togglePopup])

    return (
        <div>
            <div>
                <canvas ref={canvasRef}></canvas>
                {canvasName && (
                <div className="canvas-info" style={{display: "flex", justifyContent: "flex-end"}}>
                    {canvasName} 
                    {" ("}{canvasWidth} x {canvasHeight}{")"}
                </div>
                )}
            </div>
            <div>
                {togglePopup && (
                    <DeviceSettings settingsMode={settingsMode} activeDevice={activeDevice} deviceList={deviceList} onTogglePopup={() => setTogglePopup(false)} onUpdateDeviceToggle={() => setUpdateDeviceToggle(true)} onDeviceList={onDeviceList} onUpdatedDevice={retrieveUpdate}></DeviceSettings>
                )
                }
            </div>
        </div>
    )
};

export default FabricCanvas;