import { mouseDownLine, drawLine, mouseDownRect, drawRect, mouseDownCircle, drawCircle, mouseDownMark, mouseUpMark } from "./DrawShapes";
import * as fabric from "fabric";

describe('mouseDownLine', () => {
    it('Sets the initial vertex and stroke width for a line', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 50, y: 100 })),
        }
        const mockEvent = { e: {} }
        const mockDrawWidth = 3;
        const { line, lineX1, lineY1 } = mouseDownLine(mockEvent, mockCanvas, mockDrawWidth)

        expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e)
        expect(lineX1).toBe(50);
        expect(lineY1).toBe(100);
        expect(line.x1).toBe(50);
        expect(line.y1).toBe(100);
        expect(line.x2).toBe(50);
        expect(line.y1).toBe(100);
        expect(line.strokeWidth).toBe(3);
        expect(line.classifier).toBe('draw');
    })
})

describe('drawLine', () => {
    let x1 = 50;
    let y1 = 100;
    const mockShape = new fabric.Line([x1, y1, x1, y1], {
        stroke: 'black',
        strokeWidth: 3,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    })
    const mockEvent = { e: {} }
    const isDrawing = true;
    it('Moving from point A to point B while drawing a line', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 330, y: 250 })),
        }
        const polygonVertices = [];
        const shape = drawLine(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1, polygonVertices)
        expect(shape.x1).toBe(50);
        expect(shape.y1).toBe(100);
        expect(shape.x2).toBe(330);
        expect(shape.y2).toBe(250);
    })

    it('Line snaps when draw angle is +- 2 degrees from 90 degrees', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 250, y: 102 })),
        }
        const polygonVertices = [];
        const shape = drawLine(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1, polygonVertices)
        expect(shape.x1).toBe(50);
        expect(shape.y1).toBe(100);
        expect(shape.x2).toBe(250);
        expect(shape.y2).toBe(100);
    })
})

describe('mouseDownRect', () => {
    it('Sets the initial vertex and draw width for a rectangle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 50, y: 100 })),
        }
        const mockEvent = { e: {} }
        const mockDrawWidth = 3;
        const { rect, rectX1, rectY1 } = mouseDownRect(mockEvent, mockCanvas, mockDrawWidth)

        expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e)
        expect(rectX1).toBe(50);
        expect(rectY1).toBe(100);
        expect(rect.left).toBe(50);
        expect(rect.top).toBe(100);
        expect(rect.width).toBe(0);
        expect(rect.height).toBe(0);
        expect(rect.strokeWidth).toBe(3);
    })

})

describe('drawRect', () => {
    let x1 = 50;
    let y1 = 100;
    const mockShape = new fabric.Rect({
        left: x1,
        top: y1,
        originX: 'center',
        originY: 'center',
        width: 0,
        height: 0,
        fill: null,
        stroke: 'black',
        strokeWidth: 3,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    })
    const mockEvent = { e: {} }
    const isDrawing = true;
    it('Moving from point A to point B, down and right, while drawing a rectangle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 330, y: 250 })),
        }
        const shape = drawRect(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)
        expect(shape.left).toBe(190);
        expect(shape.top).toBe(175);
        expect(shape.width).toBe(280);
        expect(shape.height).toBe(150);
    })

    it('Moving from point A to point B, up and left, while drawing a rectangle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 5, y: 10 })),
        }
        const shape = drawRect(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)
        expect(shape.left).toBe(27.5);
        expect(shape.top).toBe(55);
        expect(shape.width).toBe(45);
        expect(shape.height).toBe(90);
    })
})

describe('mouseDownCircle', () => {
    it('Sets the initial origin and draw width for a circle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 50, y: 100 })),
        }
        const mockEvent = { e: {} }
        const mockDrawWidth = 3;
        const { circle, circleX1, circleY1 } = mouseDownCircle(mockEvent, mockCanvas, mockDrawWidth)

        expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e);
        expect(circleX1).toBe(50);
        expect(circleY1).toBe(100);
        expect(circle.left).toBe(50);
        expect(circle.top).toBe(100);
        expect(circle.radius).toBe(0);
        expect(circle.strokeWidth).toBe(3);
    })
})

describe('drawCircle', () => {
    let x1 = 50;
    let y1 = 100;
    const mockShape = new fabric.Circle({
        left: x1,
        top: 100,
        originX: 'left',
        originY: 'top',
        fill: null,
        radius: 0,
        stroke: 'black',
        strokeWidth: 3,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    });
    const mockEvent = { e: {} }
    const isDrawing = true;
    it('Moving from point A to point B, down and right, while drawing a circle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 330, y: 250 })),
        }
        const shape = drawCircle(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)

        expect(shape.left).toBe(50);
        expect(shape.top).toBe(100);
        expect(shape.originX).toBe('left')
        expect(shape.originY).toBe('top')
        expect(shape.radius).toBe(158.82)
    })
    it('Moving from point A to point B, up and left, while drawing a circle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 5, y: 10 })),
        }
        const shape = drawCircle(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)

        expect(shape.left).toBe(50);
        expect(shape.top).toBe(100);
        expect(shape.originX).toBe('right')
        expect(shape.originY).toBe('bottom')
        expect(shape.radius).toBe(50.31)
    })
    it('Moving from point A to point B, up and right, while drawing a circle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 75, y: 10 })),
        }
        const shape = drawCircle(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)

        expect(shape.left).toBe(50);
        expect(shape.top).toBe(100);
        expect(shape.originX).toBe('left')
        expect(shape.originY).toBe('bottom')
        expect(shape.radius).toBe(46.70)
    })
    it('Moving from point A to point B, down and left, while drawing a circle', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 5, y: 150 })),
        }
        const shape = drawCircle(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1)

        expect(shape.left).toBe(50);
        expect(shape.top).toBe(100);
        expect(shape.originX).toBe('right')
        expect(shape.originY).toBe('top')
        expect(shape.radius).toBe(33.63)
    })
})

describe('mouseDownMark', () => {
    it('Sets the initial vertex for a free-form polygon', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 50, y: 100 })),
        }
        const mockEvent = { e: {} }
        const { markLine, vertex } = mouseDownMark(mockEvent, mockCanvas)

        expect(mockCanvas.getPointer).toHaveBeenCalledWith(mockEvent.e)
        expect(markLine.x1).toBe(50);
        expect(markLine.y1).toBe(100);
        expect(markLine.x2).toBe(50);
        expect(markLine.y1).toBe(100);
        expect(vertex.x).toBe(50);
        expect(vertex.y).toBe(100);
    })
})

describe('mouseUpMark', () => {
    let x1 = 50;
    let y1 = 100;
    const mockShape = new fabric.Line([x1, y1, x1, y1], {
        stroke: 'black',
        strokeWidth: 3,
        strokeUniform: true,
        objectCaching: false,
        classifier: 'draw',
        id: null,
        area_id: null,
    })
    const mockEvent = { e: {} }
    const isDrawing = true;

    it('Creates a polygon after snapping into place from reaching the start vertex', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 47, y: 102 })),
        }
        mockShape.set({ x1: 150, y1: 101 })
        x1 = 150
        y1 = 101
        let polygonVertices = [{ x: 50, y: 100 }, { x: 50, y: 200 }, { x: 150, y: 200 }, { x: x1, y: y1 }]

        const shape = drawLine(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1, polygonVertices)
        expect(shape.x1).toBe(150);
        expect(shape.y1).toBe(101);
        expect(shape.x2).toBe(50);
        expect(shape.y2).toBe(100);

        polygonVertices = [{ x: 50, y: 100 }, { x: 50, y: 200 }, { x: 150, y: 200 }, { x: 150, y: 101 }, { x: 47, y: 102 }]

        const { mark, text } = mouseUpMark(polygonVertices, shape)
        expect(mark.points[0]).toMatchObject({ x: 50, y: 100 });
        expect(mark.points[1]).toMatchObject({ x: 50, y: 200 });
        expect(mark.points[2]).toMatchObject({ x: 150, y: 200 });
        expect(mark.points[3]).toMatchObject({ x: 150, y: 101 });
        expect(mark.points[4]).toMatchObject({ x: 47, y: 102 });
        expect(text.text).toBe("Room Label")
    })

    it('Does not create a polygon if the final end point is not reached', () => {
        const mockCanvas = {
            getPointer: jest.fn(() => ({ x: 150, y: 200 })),
        }
        mockShape.set({ x1: 50, y1: 200 })
        x1 = 50
        y1 = 200
        let polygonVertices = [{ x: 50, y: 100 }, { x: x1, y: y1 }]
        const shape = drawLine(mockEvent, mockCanvas, mockShape, isDrawing, x1, y1, polygonVertices)
        expect(shape.x1).toBe(50);
        expect(shape.y1).toBe(200);
        expect(shape.x2).toBe(150);
        expect(shape.y2).toBe(200);

        polygonVertices = [{ x: 50, y: 100 }, { x: 50, y: 200 }, { x: 150, y: 200 }]

        const { mark, text } = mouseUpMark(polygonVertices, shape)
        expect(mark).toBe(null);
        expect(text).toBe(null);
    })
})

