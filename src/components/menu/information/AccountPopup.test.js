import { auth, db } from '../../../firebase';
import { signOut, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDoc, getDocs, doc, deleteDoc, addDoc, or, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
    togglePopup, deleteCanvas, duplicateCanvas, retrieveFiles, GenerateEmailList, changeName, removeSharedUser, shareCanvas, loadCanvas,
    userSignOut, deleteAccount, resetPassword
} from './AccountPopup';


jest.mock("firebase/auth", () => ({
    signOut: jest.fn(),
    deleteUser: jest.fn(),
    sendPasswordResetEmail: jest.fn()
}))

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    deleteDoc: jest.fn(),
    addDoc: jest.fn(),
    or: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn()
}))

jest.mock("../../../firebase", () => ({
    auth: { mock: true },
    db: { mock: true }
}))

const onCanvasName = jest.fn();
const onCanvasID = jest.fn();
const onActive = jest.fn();
const onRefreshToggle = jest.fn();

const setNameCopy = jest.fn()
const setActiveName = jest.fn()
const setActiveValue = jest.fn()
const setActiveID = jest.fn()
const setActiveData = jest.fn()
const setActiveWidth = jest.fn()
const setActiveHeight = jest.fn()
const setActiveFloorArray = jest.fn()
const setSharedList = jest.fn()
const setActiveDevice = jest.fn()
const setActiveOriginalDevice = jest.fn()
const setActiveLabel = jest.fn()
const setActiveDeviceRegistry = jest.fn()
const setActiveEntityRegistry = jest.fn()

const setErrorMessage = jest.fn();

const preventDefault = jest.fn();
const e = { preventDefault };

const setStatesObject = {
    setNameCopy: setNameCopy,
    setActiveName: setActiveName,
    setActiveValue: setActiveValue,
    setActiveID: setActiveID,
    setActiveData: setActiveData,
    setActiveWidth: setActiveWidth,
    setActiveHeight: setActiveHeight,
    setActiveFloorArray: setActiveFloorArray,
    setSharedList: setSharedList,
    setActiveDevice: setActiveDevice,
    setActiveOriginalDevice: setActiveOriginalDevice,
    setActiveLabel: setActiveLabel,
    setActiveDeviceRegistry: setActiveDeviceRegistry,
    setActiveEntityRegistry: setActiveEntityRegistry
}

const name = "Mock Canvas"
const id = "abcde"

const width = 1000
const height = 800
const floorArray = ["GR"]
const floorData = { GR: { data: "fake data" } }
const mockSharedList = [] //shared list
const mockDeviceList = ["mock_device_01", "mock_device_02", "mock_device_03"]; //device
const mockOriginalDeviceList = ["mock_device_01", "mock_device_02", "mock_device_03"] //original device
const label = ["location", "activity", "environment"]

const user = { email: "mock@example.com", uid: "12345" }

const mockDeviceRegistry = {
    version: 1,
    minor_version: 9,
    key: "core.device_registry",
    data: {
        devices: [
            { id: "123", name: "mock_device_01", name_by_user: "Lounge Temperature", identifiers: [["thethingsnetwork", "mock_device_01"]] },
            { id: "456", name: "mock_device_02", name_by_user: null, identifiers: [["zha", "mock_device_01"]] },
            { id: "789", name: "mock_device_03", name_by_user: null, identifiers: [["random_value", "mock_device_01"]] }
        ]
    }
}

const mockEntityRegistry = {
    version: 1,
    minor_version: 17,
    key: "core.entity_registry",
    data: {
        entities: [
            { id: "abc", device_id: "123", name: "Temperature Sensor", entity_id: "sensor.mock_sensor_01", platform: "thethingsnetwork", original_name: "Temperature" },
            { id: "def", device_id: "123", name: null, entity_id: "sensor.mock_sensor_02", platform: "thethingsnetwork", original_name: "Humidity" },
            { id: "ghi", device_id: "456", name: null, entity_id: "binary_sensor.mock_sensor_03", platform: "zha", original_name: null }
        ]
    }
}

describe('togglePopup', () => {

    it('Opens a file action popup and sets values for the selected file', () => {

        const value = 'copy';

        togglePopup(value, setStatesObject, setErrorMessage, name, id, floorData, width, height, floorArray, mockSharedList, mockDeviceList, mockOriginalDeviceList, label, mockDeviceRegistry, mockEntityRegistry)
        expect(setStatesObject.setNameCopy).toHaveBeenCalledWith("Mock Canvas copy")
        expect(setErrorMessage).not.toHaveBeenCalled();
        expect(setStatesObject.setActiveName).toHaveBeenCalledWith("Mock Canvas")
        expect(setStatesObject.setActiveValue).toHaveBeenCalledWith("copy")
        expect(setStatesObject.setActiveID).toHaveBeenCalledWith("abcde")
        expect(setStatesObject.setActiveData).toHaveBeenCalledWith({ GR: { data: "fake data" } })
        expect(setStatesObject.setActiveWidth).toHaveBeenCalledWith(1000)
        expect(setStatesObject.setActiveHeight).toHaveBeenCalledWith(800)
        expect(setStatesObject.setActiveFloorArray).toHaveBeenCalledWith(["GR"])
        expect(setStatesObject.setSharedList).toHaveBeenCalledWith([])
        expect(setStatesObject.setActiveDevice).toHaveBeenCalledWith(["mock_device_01", "mock_device_02", "mock_device_03"])
        expect(setStatesObject.setActiveOriginalDevice).toHaveBeenCalledWith(["mock_device_01", "mock_device_02", "mock_device_03"])
        expect(setStatesObject.setActiveLabel).toHaveBeenCalledWith(["location", "activity", "environment"])
        expect(setStatesObject.setActiveDeviceRegistry).toHaveBeenCalledWith(mockDeviceRegistry)
        expect(setStatesObject.setActiveEntityRegistry).toHaveBeenCalledWith(mockEntityRegistry)
    })

    it('Closing a file action popup and resetting values', () => {

        const value = null;

        togglePopup(value, setStatesObject, setErrorMessage)
        expect(setStatesObject.setNameCopy).not.toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith(null);
        expect(setStatesObject.setActiveValue).toHaveBeenCalledWith(null);
    })
})

describe('deleteCanvas', () => {

    it('Deletes the selected file after the user confirms deletion and refresh active states', async () => {

        let canvasID = "abcde"

        doc.mockReturnValue("mock-canvas-doc");

        await deleteCanvas(canvasID, togglePopup, onCanvasName, onCanvasID, onActive, onRefreshToggle, setErrorMessage, setStatesObject)
        expect(doc).toHaveBeenCalledWith(db, "canvases", "abcde")
        expect(deleteDoc).toHaveBeenCalledWith("mock-canvas-doc")
        expect(onCanvasName).toHaveBeenCalledWith(null);
        expect(onCanvasID).toHaveBeenCalledWith(null);
        expect(onActive).toHaveBeenCalledWith(false);
        expect(onRefreshToggle).toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith(null);
    })
})


//COME BACK TO THIS ONE!
describe('duplicateCanvas', () => {

    it('Duplicates the canvas by copying the data and changing to a new name', async () => {

        collection.mockReturnValue("mock-collection")
        addDoc.mockResolvedValue("mock-doc-ref")

        let nameCopy = 'Mock Canvas copy'
        await duplicateCanvas(e, name, nameCopy, user, floorData, width, height, floorArray, mockDeviceList,
            mockOriginalDeviceList, label, mockDeviceRegistry, mockEntityRegistry, togglePopup, setStatesObject, setErrorMessage)
    })

    //expect(addDoc).toHaveBeenCalledWith();

    expect(setErrorMessage).not.toHaveBeenCalled();

    it('Fails to duplicate as the names are the same', async () => {

        let nameCopy = 'Mock Canvas'
        await duplicateCanvas(e, name, nameCopy, user, floorData, width, height, floorArray, mockDeviceList,
            mockOriginalDeviceList, label, mockDeviceRegistry, mockEntityRegistry, togglePopup, setStatesObject, setErrorMessage)

        expect(addDoc).not.toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith("The name must be different from the original!")
    })
})

describe('retrieveFiles', () => {

    it('performs a function', () => {

    })

})

describe('generateEmailList', () => {

    it('performs a function', () => {

    })

})

describe('changeName', () => {

    it('performs a function', () => {

    })

})

describe('removeSharedUsers', () => {

    it('performs a function', () => {

    })

})

describe('shareCanvas', () => {

    it('performs a function', () => {

    })

})

describe('loadCanvas', () => {

    it('performs a function', () => {

    })

})

describe('userSignOut', () => {

    it('performs a function', () => {

    })

})

describe('deleteAccount', () => {

    it('performs a function', () => {

    })

})

describe('resetPassword', () => {

    it('performs a function', () => {

    })

})