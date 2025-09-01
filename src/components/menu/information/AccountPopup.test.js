import { auth, db } from '../../../firebase';
import { signOut, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDoc, getDocs, doc, deleteDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
const onCanvasWidth = jest.fn();
const onCanvasHeight = jest.fn();
const onDeviceList = jest.fn();
const onOriginalDeviceList = jest.fn();
const onLabelList = jest.fn();
const onDeviceRegistry = jest.fn();
const onEntityRegistry = jest.fn();
const onLoadToggle = jest.fn();
const onClose = jest.fn();

const setNewName = jest.fn()
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
const setMessage = jest.fn();
const setFiles = jest.fn();
const setLoading = jest.fn();
const setEmailList = jest.fn();



const preventDefault = jest.fn();
const e = { preventDefault };

const setStatesObject = {
    setNewName, setActiveName, setActiveValue, setActiveID, setActiveData, setActiveWidth, setActiveHeight, setActiveFloorArray, setSharedList,
    setActiveDevice, setActiveOriginalDevice, setActiveLabel, setActiveDeviceRegistry, setActiveEntityRegistry
}

const name = "Mock Canvas"
const id = "abcde"

const width = 1000
const height = 800
const floorArray = ["GR"]
const floorData = { GR: { data: "fake data" } }
let mockSharedList = []
const mockDeviceList = ["mock_device_01", "mock_device_02", "mock_device_03"];
const mockOriginalDeviceList = ["mock_device_01", "mock_device_02", "mock_device_03"]
const label = ["location", "activity", "environment"]

const user = { email: "mock@example.com", uid: "main-user-id" }

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
        expect(setStatesObject.setNewName).toHaveBeenCalledWith("Mock Canvas copy")
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
        expect(setStatesObject.setNewName).not.toHaveBeenCalled();
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

describe('duplicateCanvas', () => {

    it('Duplicates the canvas by copying the data and changing to a new name', async () => {

        let newName = 'Mock Canvas copy'
        await duplicateCanvas(e, name, newName, user, floorData, width, height, floorArray, mockDeviceList,
            mockOriginalDeviceList, label, mockDeviceRegistry, mockEntityRegistry, togglePopup, setStatesObject, setErrorMessage)

        expect(collection).toHaveBeenCalledWith(db, "canvases")
        expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ "canvasName": "Mock Canvas copy" }));
        expect(setErrorMessage).toHaveBeenCalledWith(null);
    })

    it('Fails to duplicate as the names are the same', async () => {

        let newName = 'Mock Canvas'
        await duplicateCanvas(e, name, newName, user, floorData, width, height, floorArray, mockDeviceList,
            mockOriginalDeviceList, label, mockDeviceRegistry, mockEntityRegistry, togglePopup, setStatesObject, setErrorMessage)

        expect(addDoc).not.toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith("The name must be different from the original!")
    })
})

describe('retrieveFiles', () => {

    it('Retrieve and map file query and finish loading sequence once completed', async () => {

        const mockQuery = {
            docs: [
                { id: "canvas-01", data: () => ({ data: "fake data 01" }) },
                { id: "canvas-02", data: () => ({ data: "fake data 02" }) }
            ]
        }

        getDocs.mockResolvedValueOnce(mockQuery);

        await retrieveFiles(mockQuery, setFiles, setLoading)

        expect(getDocs).toHaveBeenCalledWith(mockQuery);
        expect(setFiles).toHaveBeenCalledWith([{ "data": "fake data 01", "id": "canvas-01" }, { "data": "fake data 02", "id": "canvas-02" }]);
        expect(setLoading).toHaveBeenCalledWith(false);
    })
})

describe('generateEmailList', () => {

    it('Adds a retrieved email from a provided ID to an email array', async () => {

        mockSharedList = ["fghij"]

        getDoc.mockResolvedValueOnce({
            id: "fghij",
            data: () => ({ email: "other-user@example.com" })
        })

        await GenerateEmailList(mockSharedList, setEmailList)

        expect(doc).toHaveBeenCalledWith(db, "users", "fghij")
        expect(setEmailList).toHaveBeenCalledWith(["other-user@example.com"])

    })

    it('No emails retrieved as there are no shared files', async () => {

        mockSharedList = []

        await GenerateEmailList(mockSharedList, setEmailList)

        expect(setEmailList).toHaveBeenCalledWith([])

    })
})

describe('changeName', () => {

    it('Updating the canvas file with a new name', async () => {
        let newName = "New Canvas Name"
        await changeName(e, name, newName, id, togglePopup, setStatesObject, setErrorMessage)
        expect(doc).toHaveBeenCalledWith(db, "canvases", "abcde")
        expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ "canvasName": "New Canvas Name" }))
        expect(setErrorMessage).toHaveBeenCalledWith(null);
    })

    it('Fails to update canvas file since the new name is the same as the original name', async () => {
        let newName = name;
        await changeName(e, name, newName, id, togglePopup, setStatesObject, setErrorMessage)
        expect(updateDoc).not.toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith("The name must be different from the original!")
    })
})

describe('removeSharedUsers', () => {

    it('Removes a shared user ID from the shared array and removes it from the email list', async () => {

        const emailList = ["other-user@example.com"]

        const mockQuery = {
            docs: [
                { data: () => ({ id: "shared-user-id", email: "other-user@example.com" }) }
            ]
        }

        getDocs.mockResolvedValueOnce(mockQuery);

        await removeSharedUser(user, setEmailList, emailList, id, setErrorMessage)

        expect(doc).toHaveBeenCalledWith(db, "canvases", "abcde");
        expect(arrayRemove).toHaveBeenCalledWith("shared-user-id");
        expect(setEmailList).toHaveBeenCalledWith([])
        expect(setErrorMessage).not.toHaveBeenCalled();

    })
})

describe('shareCanvas', () => {

    it('Sharing a canvas with another user by submitting the email associated with the account and adding it to the email list state', async () => {

        const emailList = []
        const shareRequest = ["other-user@example.com"]

        const mockQuery = {
            empty: false,
            docs: [{ data: () => ({ id: "shared-user-id", email: "other-user@example.com" }) }]
        }

        getDocs.mockResolvedValueOnce(mockQuery);

        await shareCanvas(e, shareRequest, setErrorMessage, id, setEmailList, emailList)
        expect(doc).toHaveBeenCalledWith(db, "canvases", "abcde");
        expect(arrayUnion).toHaveBeenCalledWith("shared-user-id");
        expect(setEmailList).toHaveBeenCalledWith(["other-user@example.com"])
        expect(setErrorMessage).not.toHaveBeenCalled();

    })

    it('Fails to share canvas to another user as the user does not exist', async () => {

        const emailList = []
        const shareRequest = ["false-user@example.com"]

        const mockQuery = { empty: true, docs: [] }

        getDocs.mockResolvedValueOnce(mockQuery)

        await shareCanvas(e, shareRequest, setErrorMessage, id, setEmailList, emailList)
        expect(setErrorMessage).toHaveBeenCalledWith("This email is not associated with an account");
        expect(doc).not.toHaveBeenCalled();
    })
})

describe('loadCanvas', () => {

    it('Sets canvas states as data loaded from the database', () => {

        loadCanvas(id, name, width, height, mockDeviceList, mockOriginalDeviceList, label, JSON.stringify(mockDeviceRegistry), JSON.stringify(mockEntityRegistry), onCanvasID,
            onCanvasName, onCanvasWidth, onCanvasHeight, onDeviceList, onOriginalDeviceList, onLabelList, onDeviceRegistry, onEntityRegistry, onActive, onLoadToggle, onClose)
        expect(onCanvasWidth).toHaveBeenCalledWith(1000);
        expect(onCanvasHeight).toHaveBeenCalledWith(800);
        expect(onDeviceList).toHaveBeenCalledWith(["mock_device_01", "mock_device_02", "mock_device_03"]);
        expect(onOriginalDeviceList).toHaveBeenCalledWith(["mock_device_01", "mock_device_02", "mock_device_03"]);
        expect(onDeviceRegistry).toHaveBeenCalledWith(mockDeviceRegistry);
        expect(onEntityRegistry).toHaveBeenCalledWith(mockEntityRegistry);
        expect(onLoadToggle).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();


    })

})

describe('userSignOut', () => {

    it('User signs out of the account setting active state as false', async () => {

        signOut.mockResolvedValueOnce(auth);

        await userSignOut(onActive, onClose, setErrorMessage)

        expect(signOut).toHaveBeenCalledWith(auth);
        expect(onActive).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalled();
        expect(setErrorMessage).not.toHaveBeenCalled();

    })

})

describe('deleteAccount', () => {

    it('Deleting the user account as well as document data associated with the account', async () => {
        const mockQuery = {
            docs: [
                { id: "canvas-01", data: () => ({ owner: "main-user-id", data: "fake data 01" }) },
                { id: "canvas-02", data: () => ({ owner: "main-user-id", data: "fake data 02" }) }
            ]
        }

        getDocs.mockResolvedValueOnce(mockQuery);

        await deleteAccount(user, mockQuery, onActive, onRefreshToggle, togglePopup, onClose, setStatesObject, setErrorMessage)

        expect(doc).toHaveBeenCalledWith(auth, "users", "main-user-id"); //user doc
        expect(doc).toHaveBeenCalledWith(auth, "canvases", "canvas-01"); //canvas 1 doc
        expect(doc).toHaveBeenCalledWith(auth, "canvases", "canvas-02"); //canvas 2 doc
        expect(deleteUser).toHaveBeenCalledWith({ "email": "mock@example.com", "uid": "main-user-id" });
        expect(updateDoc).not.toHaveBeenCalled();
        expect(onActive).toHaveBeenCalledWith(false);
        expect(onRefreshToggle).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith(null)
    })

    it('Deleting the user account and removing user id from any shared list data', async () => {
        const mockQuery = {
            docs: [
                { id: "canvas-01", data: () => ({ owner: "main-user-id", shared: [], data: "fake data 01" }) },
                { id: "canvas-02", data: () => ({ owner: "shared-user-id", shared: ["main-user-id"], data: "fake data 02" }) }
            ]
        }

        getDocs.mockResolvedValueOnce(mockQuery);

        await deleteAccount(user, mockQuery, onActive, onRefreshToggle, togglePopup, onClose, setStatesObject, setErrorMessage)

        expect(doc).toHaveBeenCalledWith(auth, "users", "main-user-id"); //user doc
        expect(doc).toHaveBeenCalledWith(auth, "canvases", "canvas-01"); //canvas 1 doc
        expect(doc).toHaveBeenCalledWith(auth, "canvases", "canvas-02"); //canvas 2 doc
        expect(deleteUser).toHaveBeenCalledWith({ "email": "mock@example.com", "uid": "main-user-id" });
        expect(updateDoc).toHaveBeenCalledWith(undefined, { "shared": undefined }); //Undefined due to jest timing, what matters is that the function is called
        expect(onActive).toHaveBeenCalledWith(false);
        expect(onRefreshToggle).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith(null)
    })

})

describe('resetPassword', () => {

    it('performs a function', async () => {

        const email = "mock@example.com"

        sendPasswordResetEmail.mockResolvedValueOnce(auth, email)

        await resetPassword(email, setMessage, setErrorMessage)

        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, "mock@example.com");
        expect(setMessage).toHaveBeenCalledWith("An email has been sent to reset your password. It may take a few minutes, and be sure to check your junk email if you have not received it.")
        expect(setErrorMessage).toHaveBeenCalledWith("")

    })

})