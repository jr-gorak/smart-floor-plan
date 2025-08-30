import { createDevice } from "./CreateDevice";
import * as fabric from "fabric";
import { deviceImages } from "../../icons";

describe('createDevice', () => {
    let mockLoRaWAN = {
        id: '12345',
        entities: [{
            id: 'abcde',
            device_id: '12345',
            original_name: 'MockEntity',
            name: 'MockEntity',
            platform: 'thethingsnetwork',
            type: 'temperature',
            label: 'environment',
            visible: false,
            tag: null,
        }],
        original_name: 'MockDevice',
        name: 'MockDevice',
        platform: 'thethingsnetwork',
        isActive: false,
        area_id: null,
    }

    let mockZigbee = {
        id: '67890',
        entities: [{
            id: 'fghij',
            device_id: '67890',
            original_name: 'MockZigbeeEntity',
            name: 'MockZigbeeEntity',
            platform: 'zha',
            type: 'binary',
            label: 'location',
            visible: false,
            tag: null,
        }],
        original_name: 'MockZigbee',
        name: 'MockZigbee',
        platform: 'zha',
        isActive: false,
        area_id: null,
    }

    const mockCanvas = new fabric.Canvas('id', {
        width: 1000,
        height: 800
    })

    let updateDeviceToggle = false;

    it('Creates a LoRaWAN device', () => {

        const group = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)

        expect(group.id).toBe('12345');
        expect(group._objects.length).toBe(2)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('12345');
        expect(group._objects[0]._originalElement.src).toContain('assistant_device') //Lorawan's icon is google's assistant_device icon
        expect(group._objects[1].classifier).toBe('text');
        expect(group._objects[1].text).toBe('MockDevice')
    })

    it('Creates a Zigbee device', () => {

        const group = createDevice(mockZigbee, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)

        expect(group.id).toBe('67890');
        expect(group._objects.length).toBe(2)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('67890');
        expect(group._objects[0]._originalElement.src).toContain('missing_controller') //Zigbee's icon is google's missing_controller icon
        expect(group._objects[1].classifier).toBe('text');
        expect(group._objects[1].text).toBe('MockZigbee')
    })

    it('Adds an entity to a device', () => {
        mockLoRaWAN.entities[0].visible = true;
        const group = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(group.id).toBe('12345');
        expect(group._objects.length).toBe(3)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('12345');
        expect(group._objects[0]._originalElement.src).toContain('assistant_device')
        expect(group._objects[1].classifier).toBe('text');
        expect(group._objects[1].text).toBe('MockDevice')
        expect(group._objects[2].classifier).toBe('sensor');
        expect(group._objects[2]._originalElement.src).toContain('device_thermostat')
    })

    it('Updates a device by adding an entity', () => {
        //Create initial device without any entities, then changing the position.
        mockLoRaWAN.entities[0].visible = false;
        const group = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(group.id).toBe('12345');
        expect(group._objects.length).toBe(2)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('12345');
        expect(group._objects[0]._originalElement.src).toContain('assistant_device')
        expect(group._objects[1].classifier).toBe('text');
        group.left = 200
        group.top = 300
        mockCanvas.add(group)

        //Update initial device to add the entity, then verifying it is still in the same position.
        mockLoRaWAN.entities[0].visible = true;
        updateDeviceToggle = true;

        const newGroup = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(newGroup.id).toBe('12345');
        expect(newGroup._objects.length).toBe(3)
        expect(newGroup._objects[0].classifier).toBe('device');
        expect(newGroup._objects[0].id).toBe('12345');
        expect(newGroup._objects[0]._originalElement.src).toContain('assistant_device')
        expect(newGroup._objects[1].classifier).toBe('text');
        expect(newGroup._objects[1].text).toBe('MockDevice')
        expect(newGroup._objects[2].classifier).toBe('sensor');
        expect(newGroup._objects[2]._originalElement.src).toContain('device_thermostat')
        expect(newGroup.left).toBe(200);
        expect(newGroup.top).toBe(300);
    })

    it('Updates a device by changing the name', () => {
        //Create initial device with the default name, then changing the position.
        mockLoRaWAN.entities[0].visible = false;
        const group = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(group.id).toBe('12345');
        expect(group._objects.length).toBe(2)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('12345');
        expect(group._objects[0]._originalElement.src).toContain('assistant_device')
        expect(group._objects[1].classifier).toBe('text');
        group.left = 700
        group.top = 800
        mockCanvas.add(group)

        //Update initial device to change the name, then verifying it is still in the same position.
        mockLoRaWAN.name = 'New Name'
        updateDeviceToggle = true;

        const newGroup = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(newGroup.id).toBe('12345');
        expect(newGroup._objects.length).toBe(2)
        expect(newGroup._objects[0].classifier).toBe('device');
        expect(newGroup._objects[0].id).toBe('12345');
        expect(newGroup._objects[0]._originalElement.src).toContain('assistant_device')
        expect(newGroup._objects[1].classifier).toBe('text');
        expect(newGroup._objects[1].text).toBe('New Name')
        expect(newGroup.left).toBe(700);
        expect(newGroup.top).toBe(800);

        mockLoRaWAN.name = 'MockDevice'
    })

    it('Updates a device by removing an entity', () => {
        //Create initial device with an entity, then change its position.
        mockLoRaWAN.entities[0].visible = true;
        const group = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(group.id).toBe('12345');
        expect(group._objects.length).toBe(3)
        expect(group._objects[0].classifier).toBe('device');
        expect(group._objects[0].id).toBe('12345');
        expect(group._objects[0]._originalElement.src).toContain('assistant_device')
        expect(group._objects[1].classifier).toBe('text');
        expect(group._objects[1].text).toBe('MockDevice')
        expect(group._objects[2].classifier).toBe('sensor');
        expect(group._objects[2]._originalElement.src).toContain('device_thermostat')
        group.left = 50
        group.top = 80
        mockCanvas.add(group)

        //Update initial device to remove the entity, then verifying it is still in the same position.
        mockLoRaWAN.entities[0].visible = false;
        updateDeviceToggle = true;

        const newGroup = createDevice(mockLoRaWAN, mockCanvas.width, mockCanvas.height, updateDeviceToggle, mockCanvas, deviceImages)
        expect(newGroup.id).toBe('12345');
        expect(newGroup._objects.length).toBe(2)
        expect(newGroup._objects[0].classifier).toBe('device');
        expect(newGroup._objects[0].id).toBe('12345');
        expect(newGroup._objects[0]._originalElement.src).toContain('assistant_device')
        expect(newGroup._objects[1].classifier).toBe('text');
        expect(newGroup._objects[1].text).toBe('MockDevice')
        expect(newGroup.left).toBe(50);
        expect(newGroup.top).toBe(80);
    })
})
