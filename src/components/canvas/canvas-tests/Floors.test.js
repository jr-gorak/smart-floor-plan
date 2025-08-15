import { AddFloor, SwitchFloor, RemoveFloor } from "../Floors";
import * as fabric from "fabric";

describe('AddFloor', () => {
    let floorArray = ['GR']
    it('Adding a floor above the ground floor', () => {
        const direction = 'up';
        const onFloorArray = jest.fn();
        AddFloor(direction, floorArray, onFloorArray)
        expect(onFloorArray).toHaveBeenCalledWith(['1F', 'GR'])
    })

    it('Adding a floor below the ground floor', () => {
        const direction = 'down';
        const onFloorArray = jest.fn();
        AddFloor(direction, floorArray, onFloorArray)
        expect(onFloorArray).toHaveBeenCalledWith(['GR', '1B'])
    })

    it('Adding multiple floors in each direction', () => {
        const onFloorArray = jest.fn();
        AddFloor('up', floorArray, onFloorArray)

        expect(onFloorArray).toHaveBeenCalledWith(['1F', 'GR'])
        floorArray = ['1F', 'GR'];

        AddFloor('down', floorArray, onFloorArray)
        expect(onFloorArray).toHaveBeenCalledWith(['1F', 'GR', '1B'])
        floorArray = ['1F', 'GR', '1B'];

        AddFloor('down', floorArray, onFloorArray)
        expect(onFloorArray).toHaveBeenCalledWith(['1F', 'GR', '1B', '2B'])
        floorArray = ['1F', 'GR', '1B', '2B'];

        AddFloor('up', floorArray, onFloorArray)
        expect(onFloorArray).toHaveBeenCalledWith(['2F', '1F', 'GR', '1B', '2B'])

    })

    it('Attempting to add more than the five-level floor limit', () => {
        const onFloorArray = jest.fn();
        floorArray = ['4F', '3F', '2F', '1F', 'GR']
        AddFloor('up', floorArray, onFloorArray)
        expect(onFloorArray).not.toHaveBeenCalledWith()
        AddFloor('down', floorArray, onFloorArray)
        expect(onFloorArray).not.toHaveBeenCalledWith()
    })
})

describe('SwitchFloor', () => {

    const canvasRef = 'id';

    const mockCanvas = new fabric.Canvas(canvasRef, {
        width: 1000,
        height: 800
    })

    const rect = new fabric.Rect({
        top: 400,
        left: 500,
        width: 100,
        height: 100
    });

    mockCanvas.add(rect);

    const floorData = { GR: mockCanvas.toJSON() }

    const onFloorData = jest.fn();
    const viewpointToggle = jest.fn();
    const checkObjects = jest.fn();
    const setActionType = jest.fn();
    const floorArray = ['1F', 'GR']

    it('Switching to a brand new floor, GR to 1F', async () => {

        const floor = floorArray[0];
        const activeFloor = 'GR'
        expect(mockCanvas._objects.length).toBe(1);
        const newCanvas = await SwitchFloor(floor, mockCanvas, onFloorData, activeFloor, canvasRef, mockCanvas.width, mockCanvas.height, floorData, setActionType, checkObjects, viewpointToggle)
        expect(newCanvas._objects.length).toBe(0);
        expect(newCanvas.__eventListeners['selection:created']).toBeDefined();
        expect(newCanvas.__eventListeners['selection:updated']).toBeDefined();
        expect(onFloorData).toHaveBeenCalledWith({ GR: expect.any(Object) });
        expect(viewpointToggle).toHaveBeenCalled();
        expect(setActionType).not.toHaveBeenCalledWith();
    })

    it('Switching to an existing floor with objects', async () => {
        //An empty canvas will go into the function and return a new canvas with the data saved in floorData.
        const emptyCanvas = new fabric.Canvas(canvasRef, {
            width: 1000,
            height: 800
        })
        const floor = floorArray[1];
        const activeFloor = '1F'
        expect(emptyCanvas._objects.length).toBe(0);
        const newCanvas = await SwitchFloor(floor, emptyCanvas, onFloorData, activeFloor, canvasRef, emptyCanvas.width, emptyCanvas.height, floorData, setActionType, checkObjects, viewpointToggle)
        expect(newCanvas._objects.length).toBe(1);
        expect(newCanvas.__eventListeners['selection:created']).toBeDefined();
        expect(newCanvas.__eventListeners['selection:updated']).toBeDefined();
        expect(onFloorData).toHaveBeenCalledWith({ GR: expect.any(Object), '1F': expect.any(Object) });
        expect(viewpointToggle).toHaveBeenCalled();
        expect(setActionType).toHaveBeenCalledWith(null);
    })

    it('Switching to a brand new floor with a locked object on the originating floor', async () => {
        const lockedObjectCanvas = new fabric.Canvas(canvasRef, {
            width: 1000,
            height: 800
        })

        const lockedRect = new fabric.Rect({
            top: 400,
            left: 500,
            width: 100,
            height: 100,
            classifier: 'locked'
        });

        lockedObjectCanvas.add(lockedRect)

        const lockedObjectFloorData = { GR: lockedObjectCanvas.toJSON() }

        const floor = floorArray[0];
        const activeFloor = 'GR'
        expect(mockCanvas._objects.length).toBe(1);
        const newCanvas = await SwitchFloor(floor, lockedObjectCanvas, onFloorData, activeFloor, canvasRef, mockCanvas.width, mockCanvas.height, lockedObjectFloorData, setActionType, checkObjects, viewpointToggle)
        expect(newCanvas._objects.length).toBe(1);
        expect(newCanvas._objects[0].type).toBe('rect');
        expect(newCanvas._objects[0].top).toBe(400);
        expect(newCanvas._objects[0].left).toBe(500);
        expect(newCanvas.__eventListeners['selection:created']).toBeDefined();
        expect(newCanvas.__eventListeners['selection:updated']).toBeDefined();
        expect(onFloorData).toHaveBeenCalledWith({ GR: expect.any(Object) });
        expect(viewpointToggle).toHaveBeenCalled();
        expect(setActionType).not.toHaveBeenCalledWith();
    })
})

describe('RemoveFloor', () => {

    const canvasRef = 'id';

    const mockCanvas = new fabric.Canvas(canvasRef, {
        width: 1000,
        height: 800
    })

    const rect = new fabric.Rect({
        top: 400,
        left: 500,
        width: 100,
        height: 100
    });

    mockCanvas.add(rect);

    const floorData = { GR: mockCanvas.toJSON() }
    const onFloorArray = jest.fn();
    const onFloorData = jest.fn();
    const setStachedFloor = jest.fn();
    const setDeleteWarning = jest.fn();
    const setDeleteConfirmation = jest.fn();
    const SwitchFloorCallback = jest.fn();

    let floorArray = ['1F', 'GR'];

    it('Removing a different floor that is blank', () => {
        const floor = floorArray[0];
        const activeFloor = 'GR'
        const stachedFloor = null;

        RemoveFloor(floor, activeFloor, floorArray, floorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(SwitchFloorCallback).not.toHaveBeenCalled;
        expect(onFloorArray).toHaveBeenCalledWith(['GR']);
        expect(setDeleteWarning).not.toHaveBeenCalled();
    })

    it('Trigger warning for removing a different floor that has canvas data', () => {
        const newFloorData = { GR: mockCanvas.toJSON(), "1F": mockCanvas.toJSON() }
        const floor = floorArray[0];
        const activeFloor = 'GR'
        const stachedFloor = null;

        RemoveFloor(floor, activeFloor, floorArray, newFloorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(SwitchFloorCallback).not.toHaveBeenCalled;
        expect(onFloorArray).not.toHaveBeenCalled();
        expect(setDeleteWarning).toHaveBeenCalledWith(true);
        expect(setStachedFloor).toHaveBeenCalledWith("1F")
    })

    it('Approve warning to delete a different floor that has canvas data', () => {
        const newFloorData = { GR: mockCanvas.toJSON(), "1F": mockCanvas.toJSON() }
        const floor = floorArray[0];
        const activeFloor = 'GR'
        let stachedFloor = null;

        RemoveFloor(floor, activeFloor, floorArray, newFloorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(onFloorArray).not.toHaveBeenCalled();
        expect(setDeleteWarning).toHaveBeenCalledWith(true);
        expect(setStachedFloor).toHaveBeenCalledWith("1F")
        stachedFloor = "1F"

        RemoveFloor(floor, activeFloor, floorArray, newFloorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(SwitchFloorCallback).not.toHaveBeenCalled;
        expect(onFloorArray).toHaveBeenCalledWith(['GR']);
    })

    it('Trigger warning for removing the active floor with objects on it and approval', () => {
        const newFloorData = { GR: mockCanvas.toJSON(), "1F": mockCanvas.toJSON() }
        const floor = floorArray[0];
        const activeFloor = '1F'
        let stachedFloor = null;

        RemoveFloor(floor, activeFloor, floorArray, newFloorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(onFloorArray).not.toHaveBeenCalled();
        expect(setDeleteWarning).toHaveBeenCalledWith(true);
        expect(setStachedFloor).toHaveBeenCalledWith("1F")
        stachedFloor = "1F"

        RemoveFloor(floor, activeFloor, floorArray, newFloorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, mockCanvas)
        expect(SwitchFloorCallback).toHaveBeenCalledWith("GR");
        expect(onFloorArray).toHaveBeenCalledWith(['GR']);
    })
})