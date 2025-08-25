import { canvasCreate, canvasImageCreate } from "./CreateDropdown";

//Mock functions for setting states
const setError = jest.fn();
const onCanvasWidth = jest.fn();
const onCanvasHeight = jest.fn();
const onCanvasName = jest.fn();
const onActive = jest.fn();
const onCanvasID = jest.fn();
const onRefreshToggle = jest.fn();
const setWidth = jest.fn();
const setHeight = jest.fn();
const setName = jest.fn();
const setActiveValue = jest.fn();
const onActiveDropdown = jest.fn();
const onDeviceList = jest.fn();
const onOriginalDeviceList = jest.fn();
const onDeviceRegistry = jest.fn();
const onEntityRegistry = jest.fn();
const onFloorData = jest.fn();
const onFloorArray = jest.fn();
const onCanvasImageData = jest.fn();
const setButtonToggle = jest.fn();

describe('canvasCreate', () => {

    let height = 500;
    let width = 700;
    let name = "mockFloorplan"

    it('Creating a blank canvas and refreshing the canvas states', () => {

        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)

        expect(setError).not.toHaveBeenCalledWith();
        expect(onCanvasWidth).toHaveBeenCalledWith(700);
        expect(onCanvasHeight).toHaveBeenCalledWith(500);
        expect(onCanvasName).toHaveBeenCalledWith("mockFloorplan");
        expect(onActive).toHaveBeenCalledWith(true);
        expect(onCanvasID).toHaveBeenCalledWith(null);
        expect(onRefreshToggle).toHaveBeenCalled();
        expect(setWidth).toHaveBeenCalledWith(1000)
        expect(setHeight).toHaveBeenCalledWith(800);
        expect(setName).toHaveBeenCalledWith("");
        expect(setActiveValue).toHaveBeenCalledWith(null);
        expect(onActiveDropdown).toHaveBeenCalledWith(null);
        expect(onDeviceList).toHaveBeenCalledWith(null);
        expect(onOriginalDeviceList).toHaveBeenCalledWith(null);
        expect(onDeviceRegistry).toHaveBeenCalledWith(null);
        expect(onEntityRegistry).toHaveBeenCalledWith(null);
        expect(onFloorData).toHaveBeenCalledWith({});
        expect(onFloorArray).toHaveBeenCalledWith(["GR"]);
    })

    it('Cannot create a canvas without a width, height, or name', () => {

        height = null;
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("Please ensure all fields are filled out")
        expect(setHeight).not.toHaveBeenCalled();
        expect(setWidth).not.toHaveBeenCalled();
        expect(setName).not.toHaveBeenCalled();

        height = 700;
        width = null;
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("Please ensure all fields are filled out")
        expect(setHeight).not.toHaveBeenCalled();
        expect(setWidth).not.toHaveBeenCalled();
        expect(setName).not.toHaveBeenCalled();

        width = 500;
        name = "";
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("Please ensure all fields are filled out")
        expect(setHeight).not.toHaveBeenCalled();
        expect(setWidth).not.toHaveBeenCalled();
        expect(setName).not.toHaveBeenCalled();

        width = null;
        height = null;
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("Please ensure all fields are filled out")
        expect(setHeight).not.toHaveBeenCalled();
        expect(setWidth).not.toHaveBeenCalled();
        expect(setName).not.toHaveBeenCalled();
    })

    it('Cannot create a canvas when the dimensions are too large', () => {

        height = 5000;
        width = 500;
        name = 'mockCanvas'
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("The height must be less than 2500")
        expect(onCanvasWidth).not.toHaveBeenCalled();
        expect(onCanvasHeight).not.toHaveBeenCalled();
        expect(onCanvasName).not.toHaveBeenCalled();

        height = 1000;
        width = 5000;
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("The width must be less than 2500")
        expect(onCanvasWidth).not.toHaveBeenCalled();
        expect(onCanvasHeight).not.toHaveBeenCalled();
        expect(onCanvasName).not.toHaveBeenCalled();

        height = 5000;
        width = 5000;
        canvasCreate(height, width, name, setError, onCanvasWidth, onCanvasHeight, onCanvasName, onActive, onCanvasID, onRefreshToggle, setWidth, setHeight,
            setName, setActiveValue, onActiveDropdown, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray)
        expect(setError).toHaveBeenCalledWith("The width must be less than 2500")
        expect(onCanvasWidth).not.toHaveBeenCalled();
        expect(onCanvasHeight).not.toHaveBeenCalled();
        expect(onCanvasName).not.toHaveBeenCalled();


    })
})

describe('canvasImageCreate', () => {

    //Will come back to these tests later, I do not feel like looking into getting mock file data just yet

    let name = 'mockFloorplan';
    const buttonToggle = true;

    let mockData = {
        GR: "data-url-1"
    }

    it('Creating a canvas from a single image', () => {

        canvasImageCreate(name, mockData, setError, onCanvasWidth, onCanvasHeight, onCanvasImageData, onCanvasName, onActive, onCanvasID, onRefreshToggle,
            setActiveValue, onActiveDropdown, setName, setButtonToggle, buttonToggle, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray
        )
    })

    it('Creating a canvas from multiple images', () => {
    })

    //This test is alright
    it('Cannot create a canvas without a name', () => {

        name = "";
        canvasImageCreate(name, mockData, setError, onCanvasWidth, onCanvasHeight, onCanvasImageData, onCanvasName, onActive, onCanvasID, onRefreshToggle,
            setActiveValue, onActiveDropdown, setName, setButtonToggle, buttonToggle, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray
        )

        expect(setError).toHaveBeenCalledWith("Please ensure you have named your project")
        expect(onCanvasWidth).not.toHaveBeenCalled();
        expect(onCanvasHeight).not.toHaveBeenCalled();
        expect(onCanvasName).not.toHaveBeenCalled();
    })
})