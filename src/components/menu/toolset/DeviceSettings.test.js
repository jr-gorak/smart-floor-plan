import { toggleHandle, filterImage, addDevice, updateDevice, saveUpdateDevice, addNewLabel, resetLabel, selectToggle, checkLabel, addLabel, removeLabel } from "./DeviceSettings";
import * as fabric from "fabric";
import { deviceImages } from "../../../icons";

const onTogglePopup = jest.fn();
const setErrorMessage = jest.fn();
const setActiveValue = jest.fn();
const setActiveDevice = jest.fn();
const onDeviceToggle = jest.fn();
const onCanvasDevice = jest.fn();
const onDeviceList = jest.fn();
const setActiveEntity = jest.fn();
const setDevice = jest.fn();
const setInputToggle = jest.fn();
const onUpdatedDevice = jest.fn();
const onUpdateDeviceToggle = jest.fn();
const setNewLabel = jest.fn();
const setSelectLabel = jest.fn();
const setSelectLabelID = jest.fn();

const mock_device_01 = {
    id: "abcde",
    original_name: "mock_device_01",
    name: "mock_device_01",
    platform: "thethingsnetwork",
    isActive: false,
    area_id: null,
    entities: [{
        id: "12345",
        device_id: "abcde",
        original_name: "mock_entity_01",
        name: "mock_entity_01",
        platform: "thethingsnetwork",
        type: "temperature",
        label: ["ambient"],
        visible: false,
    }, {
        id: "67890",
        device_id: "abcde",
        original_name: "mock_entity_02",
        name: "mock_entity_02",
        platform: "thethingsnetwork",
        type: "digital",
        label: ["location"],
        visible: false,
    }]
};

const mock_device_02 = {
    id: "fghij",
    original_name: "mock_device_02",
    name: "mock_device_02",
    platform: "thethingsnetwork",
    isActive: false,
    area_id: null,
    entities: [{
        id: "a1b2c",
        device_id: "fghij",
        original_name: "mock_entity_03",
        name: "mock_entity_03",
        platform: "thethingsnetwork",
        type: "current",
        label: ["activity"],
        visible: false,
    }]
};

const deviceList = [mock_device_01, mock_device_02];

const labelList = ["location", "activity", "environment"]

describe('toggleHandle', () => {

    let settingsMode = null;

    it('Closing the device menu when accessed from the canvas', () => {
        settingsMode = "canvas"
        toggleHandle(settingsMode, onTogglePopup, setErrorMessage, setActiveValue, setActiveDevice)
        expect(onTogglePopup).toHaveBeenCalled()
    })

    it('Closing the device menu when accessed from the tool menu', () => {
        settingsMode = "tool"
        toggleHandle(settingsMode, onTogglePopup, setErrorMessage, setActiveValue, setActiveDevice)
        expect(onTogglePopup).toHaveBeenCalledWith(null, null, setErrorMessage, setActiveValue, setActiveDevice)
    })
})

describe('filterImage', () => {

    let type = null;

    it('There is no type value', () => {
        const icon = filterImage(type, deviceImages)
        expect(icon).toBe(undefined);
    })

    it('There is a matching type value', () => {
        type = "temperature";
        const icon = filterImage(type, deviceImages)
        expect(icon).toContain("device_thermostat.svg");

    })

    it('There is not a matching type value', () => {
        type = "power";
        const icon = filterImage(type, deviceImages)
        expect(icon).toContain("sensors.svg");
    })
})

describe('addDevice', () => {

    it('Trigger adding a device to the canvas', () => {

        let settingsMode = 'tool'
        const activeDevice = mock_device_01;

        addDevice(activeDevice, onDeviceList, deviceList, onCanvasDevice, onDeviceToggle, toggleHandle, settingsMode, onTogglePopup, setErrorMessage, setActiveValue, setActiveDevice)
        expect(onDeviceList).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ original_name: "mock_device_01" }), expect.objectContaining({ original_name: "mock_device_02" })]));
        expect(onCanvasDevice).toHaveBeenCalledWith(expect.objectContaining({ original_name: "mock_device_01" }));
        expect(onDeviceToggle).toHaveBeenCalled();
        expect(onTogglePopup).toHaveBeenCalledWith(null, null, setErrorMessage, setActiveValue, setActiveDevice)
    })
})

describe('updateDevice', () => {

    let classifier = null;
    let value = null;
    let activeDevice = mock_device_01;
    let device = activeDevice;
    let deviceID = activeDevice.id;
    let entityID = "12345"

    it('Changing device name', () => {

        classifier = "device";
        value = "New Mock Device Name"

        expect(activeDevice.name).toBe("mock_device_01")
        updateDevice(classifier, deviceID, value, device, activeDevice, setDevice)
        expect(activeDevice.name).toBe("New Mock Device Name")

    })

    it('Changing entity name', () => {

        classifier = "entity";
        value = "New Mock Entity Name"
        const entityID = "12345"

        const entity = activeDevice.entities.find(d => d.id === entityID)

        expect(entity.name).toBe("mock_entity_01")
        updateDevice(classifier, entityID, value, device, activeDevice, setDevice)
        expect(entity.name).toBe("New Mock Entity Name")
    })

    it('Setting entity as active', () => {

        classifier = "entity-visible";
        value = true

        const entity = activeDevice.entities.find(d => d.id === entityID)

        expect(entity.visible).toBe(false)
        updateDevice(classifier, entityID, value, device, activeDevice, setDevice, setInputToggle, setActiveEntity)
        expect(entity.visible).toBe(true)
    })

    it('Setting entity as not active', () => {

        classifier = "entity-visible";
        value = false

        const entity = activeDevice.entities.find(d => d.id === entityID)

        expect(entity.visible).toBe(true)
        updateDevice(classifier, entityID, value, device, activeDevice, setDevice)
        expect(entity.visible).toBe(false)
    })

    it('Changing type of entity', () => {

        classifier = "type";
        entityID = "67890"
        value = "door"

        const entity = activeDevice.entities.find(d => d.id === entityID)

        expect(entity.type).toBe("digital")
        updateDevice(classifier, entityID, value, device, activeDevice, setDevice)
        expect(entity.type).toBe("door")
        expect(setDevice).toHaveBeenCalledWith(expect.objectContaining({ entities: [expect.objectContaining({ type: "temperature" }), expect.objectContaining({ type: "door" })] }));
    })
})

describe('saveUpdateDevice', () => {

    let settingsMode = "canvas";

    let activeDevice = mock_device_01;

    it('Save updates from device changes and trigger toggle to create device on canvas', () => {

        saveUpdateDevice(deviceList, onDeviceList, onUpdatedDevice, activeDevice, onUpdateDeviceToggle, toggleHandle, settingsMode, onTogglePopup, setErrorMessage, setActiveValue, setActiveDevice)
        expect(onDeviceList).toHaveBeenCalledWith(deviceList);
        expect(onUpdatedDevice).toHaveBeenCalledWith(activeDevice);
        expect(onUpdateDeviceToggle).toHaveBeenCalled();
        expect(onTogglePopup).toHaveBeenCalled();
    })
})

describe('addNewLabel', () => {

    let activeDevice = mock_device_01;
    let device = activeDevice;
    const entityID = "12345"
    const activeEntity = activeDevice.entities.find(d => d.id === entityID)

    it('Adds a new label to the label list and assigns it to the active entity', () => {

        const newLabel = "sound"

        expect(labelList).not.toContain("sound")
        expect(activeEntity.label).not.toContain("sound")
        addNewLabel(newLabel, labelList, device, activeEntity, activeDevice, setDevice, setInputToggle, setActiveEntity, setNewLabel, setSelectLabel, setSelectLabelID)
        expect(labelList).toContain("sound")
        expect(activeEntity.label).toContain("sound")

        expect(setDevice).toHaveBeenCalledWith(device);
        expect(setInputToggle).toHaveBeenCalledWith(false);
        expect(setActiveEntity).toHaveBeenCalledWith(null);
        expect(setNewLabel).toHaveBeenCalledWith("");
        expect(setSelectLabel).toHaveBeenCalledWith(false);
        expect(setSelectLabelID).toHaveBeenCalledWith(null);
    })
})

describe('resetLabel', () => {

    it('Resets the label input state when closing out of the add new label popup screen', () => {
        resetLabel(setInputToggle, setActiveEntity)
        expect(setInputToggle).toHaveBeenCalledWith(false)
        expect(setActiveEntity).toHaveBeenCalledWith(null)
    })
})

describe('selectToggle', () => {

    const entityID = "12345"
    let activeID = null;

    it('Selecting the add new label button for a new or different entity', () => {
        selectToggle(entityID, activeID, setSelectLabel, setSelectLabelID)
        expect(setSelectLabel).toHaveBeenCalledWith(true)
        expect(setSelectLabelID).toHaveBeenCalledWith("12345");
    })

    it('Selecting the same add new label button while it is active', () => {
        activeID = "12345"
        selectToggle(entityID, activeID, setSelectLabel, setSelectLabelID)
        expect(setSelectLabel).toHaveBeenCalledWith(false)
        expect(setSelectLabelID).toHaveBeenCalledWith(null);
    })
})

describe('checkLabel', () => {

    const activeDevice = mock_device_01;
    const entityID = "12345"
    const activeEntity = activeDevice.entities.find(d => d.id === entityID)
    const entityLabels = activeEntity.label

    it('The rendered label is an active label', () => {
        let label = "ambient";
        const result = checkLabel(label, entityLabels)
        expect(result).toBe(true);
    })

    it('The rendered label not an active label', () => {
        let label = "temperature";
        const result = checkLabel(label, entityLabels)
        expect(result).toBe(undefined);
    })

})

describe('addLabel', () => {

    const activeDevice = mock_device_01;
    const entityID = "12345"
    const activeEntity = activeDevice.entities.find(d => d.id === entityID)

    it('Adds an existing label to the active entity', () => {

        let value = "temperature"

        expect(activeEntity.label).not.toContain("temperature")
        addLabel(value, entityID, activeDevice, setDevice, setSelectLabel, setSelectLabelID)
        expect(activeEntity.label).toContain("temperature")

        expect(setDevice).toHaveBeenCalledWith(activeDevice)
        expect(setSelectLabel).toHaveBeenCalledWith(false)
        expect(setSelectLabelID).toHaveBeenCalledWith(null)
    })
})

describe('removeLabel', () => {

    const activeDevice = mock_device_01;
    const entityID = "12345"
    const activeEntity = activeDevice.entities.find(d => d.id === entityID)

    it('Removing a label from an active entity', () => {

        let value = "temperature"

        expect(activeEntity.label).toContain("temperature")
        removeLabel(value, entityID, activeDevice, setDevice)
        expect(activeEntity.label).not.toContain("temperature")

        expect(setDevice).toHaveBeenCalledWith(activeDevice);

    })
})
