import { togglePopup, generateType, generateLabel, generateSensors, checkDevice, checkEntity, combineObjects } from "./SensorTool";

jest.useFakeTimers();

const setErrorMessage = jest.fn();
const setActiveValue = jest.fn();
const setActiveDevice = jest.fn();
const setDevices = jest.fn();
const onDeviceRegistry = jest.fn();
const onEntityRegistry = jest.fn();
const setEntities = jest.fn();
const onDeviceList = jest.fn();
const onOriginalDeviceList = jest.fn();
const onLabelList = jest.fn();
const locationWords = ["motion", "digital", "binary", "occupancy", "rad", "status"]
const activityWords = ["current", "energy", "power", "button"]
const environmentWords = ["temp", "humid", "light"]

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

/*

const mock_core_device = {
    version: 1,
    minor_version: 9,
    key: "core.device_registry",
    data: {
        devices: [
            { id: "123", name: "mock_device_01", name_by_user: "Lounge Temperature", identifiers: [["thethingsnetwork", "aber-shl_lw-elsys-ems-02"]] },
            { id: "456", name: "mock_device_01", name_by_user: null, identifiers: [["zha", "aber-shl_lw-elsys-ems-02"]] },
            { id: "789", name: "mock_device_01", name_by_user: null, identifiers: [["random_value", "aber-shl_lw-elsys-ems-02"]] }
        ]
    }
}

const mock_core_entity = {
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


const mockDevice = new File([JSON.stringify(mock_core_device)], "core.device_registry", { type: "application/json" });

const mockEntity = new File([JSON.stringify(mock_core_entity)], "core.entity_registry", { type: "application/json" });
    */



describe('togglePopup', () => {

    it('Triggering the upload sensor popup menu', () => {
        const value = "upload"
        const device = null;
        togglePopup(value, device, setErrorMessage, setActiveValue, setActiveDevice)
        expect(setErrorMessage).not.toHaveBeenCalled();
        expect(setActiveValue).toHaveBeenCalledWith("upload")
        expect(setActiveDevice).not.toHaveBeenCalled();
    })

    it('Triggering the device configuration menu by selecting a non-active object', () => {
        const value = "device-config"
        const device = mock_device_01
        togglePopup(value, device, setErrorMessage, setActiveValue, setActiveDevice)
        expect(setErrorMessage).not.toHaveBeenCalled();
        expect(setActiveValue).toHaveBeenCalledWith("device-config")
        expect(setActiveDevice).toHaveBeenCalledWith(mock_device_01);
    })

    it('Exiting the device configuration or upload sensor popup menus', () => {
        const value = null
        const device = null
        togglePopup(value, device, setErrorMessage, setActiveValue, setActiveDevice)
        expect(setErrorMessage).toHaveBeenCalledWith(null)
        expect(setActiveValue).toHaveBeenCalledWith(null)
        expect(setActiveDevice).not.toHaveBeenCalled();
    })
})

describe('generateType', () => {

    it('Generating a type match for a type that does not generate', () => {
        const entityString = "binary_sensor.z_pir_01"
        const result = generateType(entityString)
        expect(result).toBe("Binary")
    })

    it('Generating a type for an entity with no match', () => {
        const entityString = "sensor.mock_differnet_01"
        const result = generateType(entityString)
        expect(result).toBe("Unknown")
    })
})

describe('generateLabel', () => {

    it('Generating a label for an entity with a string match', () => {
        const entityString = "sensor.lw_ms_air_qual_01_humidity"
        const result = generateLabel(entityString, locationWords, activityWords, environmentWords)
        expect(result).toBe("environment")
    })

    it('Generating a label for an entity with no string matches', () => {
        const entityString = "sensor.lw_ms_air_qual_01_activity"
        const result = generateLabel(entityString, locationWords, activityWords, environmentWords)
        expect(result).toBe("")
    })
})

/* Come back later- file mocking is hard!
describe('generateSensors', () => {

    it('performs a function', async () => {

        const coreDeviceFile = mockDevice;
        const coreEntityFile = mockEntity;

        await generateSensors(coreDeviceFile, onDeviceRegistry, setDevices, coreEntityFile, onEntityRegistry, setEntities, locationWords, activityWords, environmentWords)
        jest.runAllTimers();
        expect(onDeviceRegistry).toHaveBeenCalledWith();


    })
})
    

describe('checkDevice', () => {

    it('performs a function', () => {

    })
})

describe('checkEntity', () => {

    it('performs a function', () => {

    })
})
    */

describe('combineObjects', () => {

    it('Combines entities with devices through the device id to create the deviceList', () => {

        const mockDevices = [{
            id: "abc",
            original_name: "mock_device_01",
            name: "mock_device_01",
            platform: "thethingsnetwork",
            isActive: false,
            area_id: null,
        }];

        const mockEntities = [{
            id: "123",
            device_id: "abc",
            original_name: "mock_entity_01",
            name: "mock_entity_01",
            platform: "thethingsnetwork",
            type: "temperature",
            label: ["ambient"],
            visible: false,
        }, {
            id: "456",
            device_id: "abc",
            original_name: "mock_entity_02",
            name: "mock_entity_02",
            platform: "thethingsnetwork",
            type: "digital",
            label: ["location"],
            visible: false,
        }]

        combineObjects(mockDevices, mockEntities, onDeviceList, onOriginalDeviceList, onLabelList, setActiveValue, setDevices, setEntities)
        expect(onDeviceList).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ original_name: "mock_device_01" })]));
        expect(onDeviceList).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ entities: expect.arrayContaining([expect.objectContaining({ name: "mock_entity_01" }), expect.objectContaining({ name: "mock_entity_02" })]) })]));
        expect(onOriginalDeviceList).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ original_name: "mock_device_01" })]));
        expect(onOriginalDeviceList).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ entities: expect.arrayContaining([expect.objectContaining({ name: "mock_entity_01" }), expect.objectContaining({ name: "mock_entity_02" })]) })]));
        expect(onLabelList).toHaveBeenCalledWith(["location", "activity", "environment"]);
        expect(setActiveValue).toHaveBeenCalledWith(null);
        expect(setDevices).toHaveBeenCalledWith(null);
        expect(setEntities).toHaveBeenCalledWith(null);


    })
})