import * as fabric from "fabric";

export function AddFloor(direction, floorArray, onFloorArray) {
    if (direction === 'up') {
        let floorCount = 0;
        floorArray.forEach((floor) => {
            if (floor.includes('B')) {
                floorCount++
            }
        })
        if (floorArray.length < 5) {
            const floors = [((floorArray.length - floorCount) + "F"), ...floorArray]
            onFloorArray(floors)
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
            const floors = [...floorArray, ((floorArray.length - floorCount) + "B")]
            onFloorArray(floors)
        }
    }
}

export async function SwitchFloor(floor, canvas, onFloorData, activeFloor, canvasRef, canvasWidth, canvasHeight, floorData, setActionType, checkObjects, viewpointToggle) {

    const objArray = [];

    async function cloneObjects() {
        const objects = canvas.getObjects().filter(obj => obj.classifier === 'stairs' || obj.classifier === 'locked')
        for (const obj of objects) {
            const clone = await obj.clone()
            objArray.push(clone);
        }
    }

    await cloneObjects();

    return new Promise(resolve => {
        const file = canvas.toJSON();
        const storeData = { ...floorData, [activeFloor]: file }
        onFloorData(storeData)

        canvas.dispose()

        const blankCanvas = new fabric.Canvas(canvasRef, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'white',
        });

        blankCanvas.on('selection:created', checkObjects)
        blankCanvas.on('selection:updated', checkObjects)

        if (floorData[floor]) {
            blankCanvas.loadFromJSON(floorData[floor]).then(() => {
                canvas = blankCanvas;

                viewpointToggle();
                canvas.renderAll();
                setActionType(null);
                resolve(canvas);
            });
        } else if (objArray.length) {
            objArray.forEach(obj => {
                blankCanvas.add(obj)
            })
            canvas = blankCanvas;
            viewpointToggle();
            canvas.renderAll();
            resolve(canvas);
        } else {
            canvas = blankCanvas;
            viewpointToggle();
            canvas.renderAll();
            resolve(canvas);
        }
    })

}

export function RemoveFloor(floor, activeFloor, floorArray, floorData, stachedFloor, onFloorData, onFloorArray, setDeleteWarning, setStachedFloor, setDeleteConfirmation, SwitchFloorCallback, canvas) {
    if (floorData[floor] && floorData[floor].objects.length > 0 && stachedFloor === null) {
        setDeleteWarning(true);
        setStachedFloor(floor);
        return;
    } else if (floorData[floor]) {
        const existingData = { ...floorData }
        delete existingData[floor];
        onFloorData(existingData)
    }

    if (activeFloor === floor) {
        canvas.clear();
        canvas.backgroundColor = 'white';
        let nextFloor = floorArray[floorArray.indexOf(floor) + 1]
        if (activeFloor.includes("B")) {
            nextFloor = floorArray[floorArray.indexOf(floor) - 1]
        }
        SwitchFloorCallback(nextFloor)
    }

    const newFloorArray = floorArray.filter(floorID => floorID !== floor)
    onFloorArray(newFloorArray)
    setStachedFloor(null);
    setDeleteConfirmation(null);
}