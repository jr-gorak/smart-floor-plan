import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { deleteImg, copyImg, settingsImg, lockImg, unlockImg, componentImages, deviceImages, moveImg, cursorImg } from './../../icons/index';

import { db } from "./../../firebase";
import { addDoc, collection, doc, updateDoc, query, getDoc } from "firebase/firestore";
import DeviceSettings from "./../menu/toolset/DeviceSettings";
import RoomSettings from "./../menu/toolset/RoomSettings";
import './../css/FabricCanvas.css';
import DeleteWarning from "./../DeleteWarning";

import { mouseDownLine, drawLine, mouseUpLine, mouseDownRect, drawRect, mouseDownCircle, drawCircle, mouseDownMark, mouseUpMark } from "./DrawShapes";
import { filterComponent } from "./CreateComponents";
import { createDevice } from "./CreateDevice";
import { AddFloor, SwitchFloor, RemoveFloor } from "./Floors";

fabric.FabricObject.prototype.toObject = (function (toObject) {
    return function (propertyArray = []) {
        return {
            ...toObject.call(this, propertyArray),
            classifier: this.classifier,
            id: this.id,
            area_id: this.area_id
        };
    };
})(fabric.FabricObject.prototype.toObject);

function FabricCanvas({ canvasInfo, canvasData, canvasState, onCanvasID, onSaveToggle, onSaveResult, onLoadToggle, onRefreshToggle,
    onDeviceToggle, user, onDeviceList, onHandlerToggle, onFloorData, onFloorArray, onCanvasImageData }) {

    const { canvasWidth, canvasHeight, canvasName, canvasID, drawWidth, entityRegistry, deviceRegistry } = canvasInfo
    const { deviceList, originalDeviceList, labelList, floorData, canvasImageData, canvasDevice, floorArray } = canvasData
    const { canvasAction, saveToggle, loadToggle, refreshToggle, deviceToggle, dragMode } = canvasState

    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const selectFlag = useRef(false);
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
    const [activeFloor, setActiveFloor] = useState(() => { const stored = sessionStorage.getItem("activeFloor"); return stored ? JSON.parse(stored) : floorArray[0]; });
    const retrieveUpdate = (update) => setUpdatedDevice(update);

    const settingsMode = 'canvas';

    const viewpointToggle = useCallback(() => {
        if (hideRooms) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'mark') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'mark') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        }

        if (hideLabels) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'text') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'text') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        }

        if (hideDevices) {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'device') {
                    obj.visible = false
                }
            })
            fabricCanvas.current.renderAll();
        } else {
            fabricCanvas.current.getObjects().forEach(obj => {
                if (obj.classifier === 'device') {
                    obj.visible = true
                }
            })
            fabricCanvas.current.renderAll();
        }
    }, [hideDevices, hideLabels, hideRooms])

    const checkObjects = useCallback(() => {
        if (selectFlag.current) return;
        selectFlag.current = true;

        const activeGroup = fabricCanvas.current.getActiveObject()

        if (activeGroup.classifier === 'device') return;

        if (activeGroup && activeGroup._objects) {
            const unlockedObjects = activeGroup.getObjects().filter(obj => obj.classifier !== 'locked' && obj.classifier !== 'mark')

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
        selectFlag.current = false;
    }, [])


    const SwitchFloorCallback = useCallback(async (floor) => {
        removeTemporaryObjects();
        const newCanvas = await SwitchFloor(floor, fabricCanvas.current, onFloorData, activeFloor, canvasRef.current, canvasWidth, canvasHeight, floorData, setActionType, checkObjects, viewpointToggle)
        fabricCanvas.current = newCanvas;
        setTimeout(() => {
            requestAnimationFrame(() => {
                viewpointToggle();
                fabricCanvas.current.renderAll();
            });
        }, 0)
        setActiveFloor(floor)
        setActionType(null);
    }, [activeFloor, canvasHeight, canvasWidth, floorData, onFloorData, viewpointToggle, checkObjects])

    const RemoveFloorCallback = useCallback((floor) => {
        RemoveFloor(floor, activeFloor, floorArray, floorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, fabricCanvas.current)
    }, [SwitchFloorCallback, activeFloor, floorArray, floorData, stachedFloor, onFloorData, onFloorArray])

    const AssignAreaIDs = useCallback((room) => {
        const x1 = room.left;
        const x2 = room.left + room.width;
        const y1 = room.top;
        const y2 = room.top + room.height;

        fabricCanvas.current.getObjects().forEach(obj => {
            if (obj.classifier === 'device' && obj.left > x1 && obj.left < x2 && obj.top > y1 && obj.top < y2) {
                obj.set({ area_id: room.area_id })
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
            if (room.classifier === 'mark' && device.left > room.left && device.left < room.left + room.width && device.top > room.top && device.top < room.top + room.height) {
                device.set({ area_id: room.area_id })
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
            device.set({ area_id: null })
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
            RemoveFloorCallback(stachedFloor)
        }
    }, [deleteConfirmation, stachedFloor, RemoveFloorCallback])

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
        window.addEventListener("beforeunload", removeTemporaryObjects)
        fabricCanvas.current.on('selection:created', checkObjects)
        fabricCanvas.current.on('selection:updated', checkObjects)

        return () => {
            fabricCanvas.current?.dispose();
            fabricCanvas.current = null;
        }
    }, [canvasWidth, canvasHeight, refreshToggle, loadToggle, checkObjects]);


    //Canvas File Handling
    useEffect(() => {

        async function saveCanvas(canvas) {

            if (!user) return;

            const file = canvas.toJSON();
            file.height = canvas.getHeight();
            file.width = canvas.getWidth();

            try {
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

            try {
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

            try {

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

            } catch (error) {
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


        if (saveToggle && (canvasID === null || canvasID === 'null' || canvasID === 'load')) {
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
    useEffect(() => {

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
                    if (key === 'GR') {
                        sessionStorage.setItem('fabricCanvas', JSON.stringify(fabricCanvas.current.toJSON()));
                    }
                    mapImageToCanvas[key] = fabricCanvas.current.toJSON();

                    fabricCanvas.current.dispose();
                    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
                        width: canvasWidth,
                        height: canvasHeight,
                        backgroundColor: 'white',
                    });
                });
            };
            return mapImageToCanvas
        };

        if (canvasImageData) {

            sortKeys(Object.keys(canvasImageData));

            (async () => {
                const initializedCanvases = await addImageData(canvasImageData)
                onFloorData(initializedCanvases)
                onCanvasImageData(null);
            })();
        }
    }, [canvasImageData, canvasHeight, canvasWidth, floorData, onFloorData, onFloorArray, onCanvasImageData]);

    // Create Devices
    useEffect(() => {

        if (deviceToggle) {
            const group = createDevice(canvasDevice, canvasWidth, canvasHeight, false, fabricCanvas.current, deviceImages);
            fabricCanvas.current.add(group)
            onDeviceToggle();
            fabricCanvas.current.renderAll();
            setActionType(null);
            group.on('moving', () => {
                AssignAreaIDsOnMove(group)
            })
        }

        if (updateDeviceToggle) {
            const group = createDevice(updatedDevice, canvasWidth, canvasHeight, true, fabricCanvas.current, deviceImages);
            fabricCanvas.current.add(group)
            setUpdateDeviceToggle(false);
            fabricCanvas.current.renderAll();
            setActionType(null);
            group.on('moving', () => {
                AssignAreaIDsOnMove(group)
            })
        }

    }, [deviceToggle, onDeviceToggle, updateDeviceToggle, canvasDevice, canvasWidth, canvasHeight, updatedDevice, AssignAreaIDs, AssignAreaIDsOnMove]);

    //Create Components
    useEffect(() => {
        filterComponent(fabricCanvas.current, componentImages, canvasAction, canvasWidth, canvasHeight)
        fabricCanvas.current.add();
        fabricCanvas.current.renderAll();
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

                if (obj.classifier === 'mark') {
                    fabricCanvas.current.bringObjectToFront(obj);
                    fabricCanvas.current.renderAll();
                }

                if (obj.classifier === 'text') {
                    fabricCanvas.current.bringObjectToFront(obj);
                    fabricCanvas.current.renderAll();
                    obj.perPixelTargetFind = false;
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
                    y: 0.5,
                    offsetY: 22,
                    offsetX: -22,
                    cursorStyle: 'pointer',
                    mouseUpHandler: copyObject,
                    render: renderIcon(copyImg),
                    cornersize: 26,
                });

                object.controls.lockControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -22,
                    offsetX: -22,
                    cursorStyle: 'pointer',
                    mouseUpHandler: lockObject,
                    render: renderIcon(object.classifier === 'locked' ? lockImg : unlockImg),
                    cornersize: 26,
                })
            }

            if (object.classifier === 'device') {
                object.controls.settingsControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -22,
                    offsetX: -22,
                    cursorStyle: 'pointer',
                    mouseUpHandler: deviceSettings,
                    render: renderIcon(settingsImg),
                    cornersize: 26,
                })
            }

            if (object.classifier === 'mark') {
                object.controls.settingsControl = new fabric.Control({
                    x: -0.5,
                    y: -0.5,
                    offsetY: -22,
                    offsetX: -22,
                    cursorStyle: 'pointer',
                    mouseUpHandler: roomInformation,
                    render: renderIcon(settingsImg),
                    cornersize: 26,
                })
            }

            object.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: 0.5,
                offsetY: 22,
                offsetX: 22,
                cursorStyle: 'pointer',
                mouseUpHandler: deleteObject,
                render: renderIcon(deleteImg),
                cornersize: 26,
            });

            object.controls.moveControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -22,
                offsetX: 22,
                cursorStyle: 'pointer',
                actionHandler: fabric.controlsUtils.dragHandler,
                render: renderIcon(moveImg),
                mouseDownHandler: function () {
                    this.render = renderIcon(cursorImg);
                },
                cornersize: 26,
            });
        };

        if (shape) {
            setControls(shape);
        };

        const mouseDown = (event) => {
            switch (actionType) {
                case 'line':
                    const { line, lineX1, lineY1 } = mouseDownLine(event, fabricCanvas.current, drawWidth);
                    fabricCanvas.current.add(line);
                    setShape(line);
                    setIsDrawing(true);
                    setX1(lineX1);
                    setY1(lineY1);
                    break;
                case 'square':
                    const { rect, rectX1, rectY1 } = mouseDownRect(event, fabricCanvas.current, drawWidth);
                    fabricCanvas.current.add(rect);
                    setShape(rect);
                    setIsDrawing(true);
                    setX1(rectX1);
                    setY1(rectY1);
                    break;
                case 'circle':
                    const { circle, circleX1, circleY1 } = mouseDownCircle(event, fabricCanvas.current, drawWidth);
                    fabricCanvas.current.add(circle);
                    setShape(circle);
                    setIsDrawing(true);
                    setX1(circleX1);
                    setY1(circleY1);
                    break;
                case 'mark':
                    const { markLine, vertex } = mouseDownMark(event, fabricCanvas.current);
                    fabricCanvas.current.add(markLine);
                    setPolygonVertices([...polygonVertices, vertex]);
                    setShape(markLine);
                    setIsDrawing(true);
                    break;
                default:
                    break;
            }
        };

        const mouseMove = (event) => {
            switch (actionType) {
                case 'line':
                    setShape(drawLine(event, fabricCanvas.current, shape, isDrawing, x1, y1, polygonVertices));
                    fabricCanvas.current.renderAll();
                    break;
                case 'square':
                    setShape(drawRect(event, fabricCanvas.current, shape, isDrawing, x1, y1));
                    fabricCanvas.current.renderAll();
                    break;
                case 'circle':
                    setShape(drawCircle(event, fabricCanvas.current, shape, isDrawing, x1, y1));
                    fabricCanvas.current.renderAll();
                    break;
                case 'mark':
                    setShape(drawLine(event, fabricCanvas.current, shape, isDrawing, x1, y1, polygonVertices));
                    fabricCanvas.current.renderAll();
                    break;
                default:
                    break;
            }
        };

        const mouseUp = (event) => {
            switch (actionType) {
                case 'line':
                    mouseUpLine(event, fabricCanvas.current, shape, x1, y1);
                    setIsDrawing(false);
                    sessionSave(fabricCanvas.current);
                    break;
                case 'square':
                    updateFloor();
                    shape.setCoords()
                    setIsDrawing(false);
                    setShape(null);
                    break;
                case 'circle':
                    updateFloor();
                    shape.setCoords()
                    setIsDrawing(false);
                    setShape(null);
                    break;
                case 'mark':
                    const { mark, text } = mouseUpMark(polygonVertices, shape);
                    if (polygonVertices.length > 2 && (shape.x1 < polygonVertices[0].x + 5 && shape.x1 > polygonVertices[0].x - 5) && (shape.y1 < polygonVertices[0].y + 5 && shape.y1 > polygonVertices[0].y - 5)) {
                        fabricCanvas.current.add(mark);
                        fabricCanvas.current.add(text);

                        fabricCanvas.current.getObjects().forEach(o => {
                            if (o.classifier === 'temporary') {
                                fabricCanvas.current.remove(o);
                            }
                        });

                        fabricCanvas.current.renderAll();
                        setPolygonVertices([]);
                        setShape(null);
                        setIsDrawing(false);
                        AssignAreaIDs(mark)
                        updateFloor();
                        setRoomLabel(text.text)
                        setActiveRoom(mark);
                    }
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
                oldRoom.set({ area_id: updatedRoom.area_id, fill: updatedRoom.fill, stroke: updatedRoom.fill })
                oldText.set({ text: roomLabel })
                fabricCanvas.current.renderAll();
                AssignAreaIDs(updatedRoom)
            }
            setUpdatedRoom(null);
        }

        function renderIcon(icon) {
            return function (ctx, left, top, _styleOverride, fabricObject) {
                const size = 26;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(icon, -size / 2, -size / 2, size, size);
                ctx.restore();
            }
        };

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
                setControls(obj);
                fabricCanvas.current.renderAll();
            } else if (transform.target._element?.currentSrc?.includes("stair")) {
                obj.classifier = 'stairs';
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


        setTimeout(() => {
            if (dragMode) {
                fabricCanvas.current.upperCanvasEl.style.touchAction = "auto";
                fabricCanvas.current.allowTouchScrolling = true;
            }
            else if (!dragMode) {
                fabricCanvas.current.upperCanvasEl.style.touchAction = "none";
                fabricCanvas.current.allowTouchScrolling = false;
            }
        }, 100)



        function keyDown(e) {

            const activeObject = fabricCanvas.current.getActiveObject()

            if (((activeObject && (activeObject.classifier === 'draw' || activeObject.classifier === 'stairs' || activeObject.classifier === 'locked'))) || ((tempObject && (tempObject.classifier === 'draw' || tempObject.classifier === 'stairs' || tempObject.classifier === 'locked')))) {
                if ((e.ctrlKey) && e.key === 'c') {
                    if (activeObject) {
                        setTempObject(activeObject);
                    }
                } else if ((e.ctrlKey) && e.key === 'x') {
                    if (activeObject) {
                        setTempObject(activeObject)
                        deleteObject(null, { target: activeObject })
                    }
                } else if ((e.ctrlKey) && e.key === 'v') {
                    if (tempObject) {
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
                if (activeObject && (!activeDevice && !activeRoom)) {
                    deleteObject(null, { target: activeObject })
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
    }, [dragMode, tempObject, setTempObject, deviceList, onDeviceList, isDrawing, shape, actionType, canvasAction, x1, y1, originalDeviceList, activeDevice, activeRoom, drawWidth, polygonVertices, updatedRoom, roomLabel, AssignAreaIDs, AssignAreaIDsOnMove, activeFloor, onFloorData]);

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
                        <input className='checkbox' type="checkbox" defaultChecked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)} />
                    </div>
                    <div className="view-checkbox">
                        <p>Hide Labels</p>
                        <input className='checkbox' type="checkbox" defaultChecked={hideLabels} onChange={(e) => setHideLabels(e.target.checked)} />
                    </div>
                    <div className="view-checkbox">
                        <p>Hide Devices</p>
                        <input className='checkbox' type="checkbox" defaultChecked={hideDevices} onChange={(e) => setHideDevices(e.target.checked)} />
                    </div>
                </div>

                <div className="floor-mapping">
                    <button className="arrow-button" onClick={() => AddFloor('up', floorArray, onFloorArray)}>+⇧</button>
                    {floorArray.map((floor) => (
                        <div key={floor} className="floor-button-container">
                            <button className={activeFloor === floor ? "floor-button-active" : "floor-button"} key={floor} onClick={() => SwitchFloorCallback(floor)} disabled={activeFloor === floor}><b>{floor}</b></button>
                            {(floor !== 'GR') && (floor === floorArray[0] || floor === floorArray[floorArray.length - 1]) &&
                                <button className="remove-button" onClick={() => RemoveFloorCallback(floor)}>X</button>
                            }
                        </div>
                    ))}
                    <button className="arrow-button" onClick={() => AddFloor('down', floorArray, onFloorArray)}>+⇩</button>
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
                    <DeleteWarning onDeleteWarning={() => setDeleteWarning(false)} onDeleteConfirmation={() => setDeleteConfirmation(true)} onStachedFloor={() => setStachedFloor(null)} />
                )}
            </div>


        </div>
    )
};

export default FabricCanvas;