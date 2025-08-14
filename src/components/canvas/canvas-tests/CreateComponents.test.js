import { filterComponent, createComponent } from "../CreateComponents";
import * as fabric from "fabric";
import { componentImages } from "../../../icons";

describe('createComponent', () => {
    it('Creating a doorway component directly', () => {

        const img = componentImages['door']
        const canvasAction = 'doorway'
        const canvasWidth = 1000;
        const canvasHeight = 800;

        const component = createComponent(img, canvasAction, canvasWidth, canvasHeight)

        expect(component.left).toBe(500);
        expect(component.top).toBe(400)
        expect(component._originalElement.src).toContain('doorway')
    })
})

describe('filterComponent', () => {
    it('Creating each furniture component through simulating canvas action events', () => {

        let canvasAction = 'doorway'
        const mockCanvas = new fabric.Canvas('id', {
            width: 1000,
            height: 800
        })

        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[0]._originalElement.src).toContain('doorway');
        canvasAction = 'window'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[1]._originalElement.src).toContain('window');
        canvasAction = 'stairs'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[2]._originalElement.src).toContain('stair');
        canvasAction = 'bed'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[3]._originalElement.src).toContain('bed');
        canvasAction = 'chair'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[4]._originalElement.src).toContain('chair');
        canvasAction = 'sofa'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[5]._originalElement.src).toContain('sofa');
        canvasAction = 'three-sofa'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[6]._originalElement.src).toContain('three');
        canvasAction = 'stove'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[7]._originalElement.src).toContain('stove');
        canvasAction = 'kitchen-sink'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[8]._originalElement.src).toContain('kitchen');
        canvasAction = 'bathtub'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[9]._originalElement.src).toContain('bath');
        canvasAction = 'round-sink'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[10]._originalElement.src).toContain('round');
        canvasAction = 'toilet'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects[11]._originalElement.src).toContain('toilet');
    })
})

describe('filterComponent', () => {
    it('Instances where canvas action is not a component-based action', () => {

        let canvasAction = 'square'
        const mockCanvas = new fabric.Canvas('id', {
            width: 1000,
            height: 800
        })

        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects.length).toBe(0);

        canvasAction = 'doorway'
        filterComponent(mockCanvas, componentImages, canvasAction, mockCanvas.width, mockCanvas.height)
        expect(mockCanvas._objects.length).toBe(1);
    })
})