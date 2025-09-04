import * as fabric from "fabric";
import { v4 as uuidv4 } from 'uuid';

/*
Shapes are created based on a mouse-down => mouse-move => mouse-up series of events.
Mouse down intializes the shape type and initial origin.
Moving the mouse will set the shape's dimensions form the origin to the cursor
Mouse up will finalize the shape and set its coordinates to the new size.
NOTE: Marking rooms uses the drawLine function as creating a polygon is a series of creating lines. There is a check inside 
drawLine for polygon cases.
*/

export function mouseDownLine(event, canvas, drawWidth) {
    const pointer = canvas.getPointer(event.e)

    const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: '#000000',
        strokeWidth: drawWidth,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    })

    return {
        line: newLine,
        lineX1: pointer.x,
        lineY1: pointer.y
    }
};

export function drawLine(event, canvas, shape, isDrawing, x1, y1, polygonVertices) {
    if (isDrawing && shape) {
        const pointer = canvas.getPointer(event.e);
        shape.set({ x2: pointer.x, y2: pointer.y });
        const dx = (pointer.x - x1);
        const dy = (pointer.y - y1);
        const rad = Math.atan2(dy, dx);
        const deg = rad * (180 / Math.PI);

        if ((deg < 2 && deg > -2) || (deg > 178 || deg < -178)) {
            shape.set({ x2: pointer.x, y2: y1 });
        };

        if ((deg < -88 && deg > -92) || (deg > 88 && deg < 92)) {
            shape.set({ x2: x1, y2: pointer.y });
        };

        if ((polygonVertices.length > 2 && pointer.x < polygonVertices[0].x + 5 && pointer.x > polygonVertices[0].x - 5) && (pointer.y < polygonVertices[0].y + 5 && pointer.y > polygonVertices[0].y - 5)) {
            shape.set({ x2: polygonVertices[0].x, y2: polygonVertices[0].y })
        }

        return shape;
    };
};

export function mouseUpLine(event, canvas, shape, x1, y1) {
    const pointer = canvas.getPointer(event.e)
    const dx = (pointer.x - x1)
    const dy = (pointer.y - y1)
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 5) {
        canvas.remove(shape);
    } else {
        shape.setCoords()
        return {
            shape: shape,
            canvas: canvas
        }
    }
}

export function mouseDownRect(event, canvas, drawWidth) {
    const pointer = canvas.getPointer(event.e)
    const newRect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        width: 0,
        height: 0,
        fill: null,
        stroke: '#000000',
        strokeWidth: drawWidth,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    });

    return {
        rect: newRect,
        rectX1: pointer.x,
        rectY1: pointer.y
    }
}

export function drawRect(event, canvas, shape, isDrawing, x1, y1) {
    if (isDrawing && shape) {
        const pointer = canvas.getPointer(event.e);

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

        return shape;
    }
}

export function mouseDownCircle(event, canvas, drawWidth) {
    const pointer = canvas.getPointer(event.e)
    const newCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        originX: 'left',
        originY: 'top',
        fill: null,
        radius: 0,
        stroke: '#000000',
        strokeWidth: drawWidth,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    });
    return {
        circle: newCircle,
        circleX1: pointer.x,
        circleY1: pointer.y
    }
}

export function drawCircle(event, canvas, shape, isDrawing, x1, y1) {
    if (isDrawing && shape) {
        const pointer = canvas.getPointer(event.e);
        if (pointer.x < x1) {
            shape.set({ originX: 'right' })
        } else if (pointer.x > x1) {
            shape.set({ originX: 'left' })
        }

        if (pointer.y < y1) {
            shape.set({ originY: 'bottom' })
        } else if (pointer.y > y1) {
            shape.set({ originY: 'top' })
        }

        const radius = Math.hypot(pointer.x - x1, pointer.y - y1) / 2;
        shape.set({ radius: Math.round(radius * 100) / 100 });
        return shape;
    }
}

export function mouseDownMark(event, canvas) {
    const pointer = canvas.getPointer(event.e);
    const point = { x: pointer.x, y: pointer.y };

    const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: 'red',
        strokeWidth: 5,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'temporary',
        id: null,
        area_id: null,
    })

    return {
        markLine: newLine,
        vertex: point,
    }
}

export function mouseUpMark(polygonVertices, shape) {

    if (polygonVertices.length > 2 && (shape.x2 < polygonVertices[0].x + 5 && shape.x2 > polygonVertices[0].x - 5) && (shape.y2 < polygonVertices[0].y + 5 && shape.y2 > polygonVertices[0].y - 5)) {

        const id = uuidv4();
        const mark = new fabric.Polygon(polygonVertices, {
            fill: '#ff00000d',
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
            left: mark.left + (mark.height / 2),
            top: mark.top + (mark.height / 2),
        })

        return {
            mark: mark,
            text: text,
        }
    }
    else {
        return {
            mark: null,
            text: null,
        }
    }
};