import {useEffect, useRef, useState} from "react";
import * as fabric from "fabric";
import {Delete, Copy} from '../icons/index';

var deleteImg = document.createElement('img');
deleteImg.src = Delete;

var copyImg = document.createElement('img');
copyImg.src = Copy;

function FabricCanvas({canvasWidth, canvasHeight, canvasAction, canvasImage}) {
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [shape, setShape] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [x1, setX1] = useState(0);
    const [y1, setY1] = useState(0);

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

    //Active Canvas
    useEffect(() => {

        fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
        });

        setTimeout(() => {
            sessionLoad();
        }, 0);

        requestAnimationFrame(() => {
            fabricCanvas.current.renderAll();
         });

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

    // Setting Background Image
    useEffect(()=> {
        
        if(canvasImage) {
            fabric.FabricImage.fromURL(canvasImage).then((img) => {
                fabricCanvas.current.backgroundImage = img;
                fabricCanvas.current.renderAll();
            })
        }
    }, [canvasImage]);

    // Drawing Shapes
    useEffect(()=> {
    
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
                strokwWidth: 10,
                objectCaching: false,
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
                originX: 'left',
                originY: 'top',
                width: 0,
                height: 0,
                fill: null,
                stroke: 'black',
                strokwWidth: 10,
                objectCaching: false,
            });
            fabricCanvas.current.add(newRect);
            setShape(newRect);
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

                fabricCanvas.current.renderAll();
            };
        };

        const drawRect = (event) => {
            if (isDrawing && shape) {
                const pointer = fabricCanvas.current.getPointer(event.e);
                shape.set({
                    width: Math.abs(x1 - pointer.x),
                    height: Math.abs(y1 - pointer.y)
                });

                if (x1 > pointer.x) {
                    shape.set({left: pointer.x});
                }

                if (y1 > pointer.y) {
                    shape.set({top: pointer.y});
                }
                
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

        const mouseUpRect = () => {
            shape.setCoords()
            setIsDrawing(false);
            setShape(null);
        }

        const mouseDown = (event) => {
            switch (actionType) {
                case 'line':
                    mouseDownLine(event);
                    break;
                case 'square':
                    mouseDownRect(event);
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
                    mouseUpRect();
                    break;
                default:
                    break;
            }
        };

        fabricCanvas.current.on('mouse:down', mouseDown);
        fabricCanvas.current.on('mouse:move', mouseMove);
        fabricCanvas.current.on('mouse:up', mouseUp);

        return () =>
        {
            if (fabricCanvas.current) {
            fabricCanvas.current.off('mouse:down', mouseDown);
            fabricCanvas.current.off('mouse:move', mouseMove);
            fabricCanvas.current.off('mouse:up', mouseUp);
            }
        }

    }, [isDrawing, shape, actionType, canvasAction, x1, y1]);

    
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
                canvas.add(cloned);
            })
        };

    // Keyboard Controls
    useEffect(() => {
        let tempObject = null;
        let tempCanvas = null;

        function keyDown(e){
            const activeObject = fabricCanvas.current.getActiveObject();

            if ((e.ctrlKey) && e.key === 'c') {
                if(activeObject) {
                    tempObject = activeObject
                    tempCanvas = activeObject.canvas;
                }
            } else if ((e.ctrlKey) && e.key === 'x') {
                if(activeObject) {
                    tempObject = activeObject
                    tempCanvas = activeObject.canvas;
                    deleteObject(null, { target: activeObject})
                }
            } else if ((e.ctrlKey) && e.key === 'v') {
                if(tempObject) {
                    tempObject.clone().then((cloned) => {
                        cloned.left += 10;
                        cloned.top += 10;
                        cloned.controls.deleteControl = tempObject.controls.deleteControl;
                        cloned.controls.copyControl = tempObject.controls.copyControl;
                        tempCanvas.add(cloned);
                    })
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if(activeObject) {
                    deleteObject(null, { target: activeObject})
                }
            }
        };

        document.removeEventListener('keydown', keyDown);
        document.addEventListener('keydown', keyDown);

        return () => {
            document.removeEventListener('keydown', keyDown);
        }
    }, []);

    return (
        <canvas ref={canvasRef}></canvas>
    )
};

export default FabricCanvas;