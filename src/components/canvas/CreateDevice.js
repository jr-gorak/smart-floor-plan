import * as fabric from "fabric";

export function createDevice(device, width, height, updateDeviceToggle, canvas, deviceImages) {
    let l = width / 2;
    let t = height / 2;
    let sx = 1;
    let sy = 1;
    let area_id = null;

    if (updateDeviceToggle) {

        const oldDevice = canvas.getObjects().find(obj => obj.id === device.id)
        if (oldDevice) {
            l = oldDevice.left;
            t = oldDevice.top;
            sx = oldDevice.scaleX;
            sy = oldDevice.scaleY;
            area_id = oldDevice.area_id;
            canvas.remove(oldDevice);
        }
    }

    const deviceArray = []
    let sensorCounter = 0;
    let angleScaler = 0;

    let deviceHolder = deviceImages['lorawan'];

    if (device.platform === 'zha') {
        deviceHolder = deviceImages['zigbee']
    }

    var deviceImg = new fabric.FabricImage(deviceHolder, {
        left: 0,
        top: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        originX: 'center',
        originY: 'center',
        selectable: true,
        strokeUniform: true,
        id: device.id,
        classifier: 'device',
        area_id: area_id,
    });

    deviceArray.push(deviceImg);


    const deviceText = new fabric.FabricText(device.name, {
        fontSize: 12,
        id: null,
        classifier: 'text',
        path: null,
        area_id: area_id,
        fill: 'red'
    })

    deviceText.set({
        left: deviceImg.left - deviceText.width / 2,
        top: deviceImg.top + 13,
    })

    deviceArray.push(deviceText);

    device.entities.forEach(sensor => {
        if (sensor.visible === true) {
            sensorCounter++;
        }
    });

    device.entities.forEach(sensor => {
        if (sensor.visible === true) {
            const angle = (2 * Math.PI / sensorCounter) * angleScaler;

            const x = (deviceImg.left + 35) * Math.cos(angle);
            const y = (deviceImg.top + 35) * Math.sin(angle);

            let imgHolder = deviceImages['sensor'];

            if (sensor.type.toLowerCase().includes('temp')) {
                imgHolder = deviceImages['thermometer'];
            } else if (sensor.type.toLowerCase().includes('occupancy')) {
                imgHolder = deviceImages['person'];
            } else if (sensor.type.toLowerCase().includes('battery')) {
                imgHolder = deviceImages['battery'];
            } else if (sensor.type.toLowerCase().includes('light')) {
                imgHolder = deviceImages['light'];
            } else if (sensor.type.toLowerCase().includes('co2')) {
                imgHolder = deviceImages['co2'];
            } else if (sensor.type.toLowerCase().includes('current')) {
                imgHolder = deviceImages['electric'];
            } else if (sensor.type.toLowerCase().includes('humidity')) {
                imgHolder = deviceImages['humidity'];
            } else if (sensor.type.toLowerCase().includes('pressure')) {
                imgHolder = deviceImages['pressure'];
            } else if (sensor.type.toLowerCase().includes('sound')) {
                imgHolder = deviceImages['sound'];
            } else if (sensor.type.toLowerCase().includes('motion')) {
                imgHolder = deviceImages['motion'];
            } else if (sensor.type.toLowerCase().includes('door')) {
                imgHolder = deviceImages['door'];
            } else if (sensor.type.toLowerCase().includes('window')) {
                imgHolder = deviceImages['window'];
            } else if (sensor.type.toLowerCase().includes('microwave')) {
                imgHolder = deviceImages['microwave'];
            } else if (sensor.type.toLowerCase().includes('kettle')) {
                imgHolder = deviceImages['kettle'];
            } else if (sensor.type.toLowerCase().includes('toaster')) {
                imgHolder = deviceImages['toaster'];
            } else if (sensor.type.toLowerCase().includes('blender')) {
                imgHolder = deviceImages['blender'];
            } else if (sensor.type.toLowerCase().includes('tv')) {
                imgHolder = deviceImages['tv'];
            } else if (sensor.type.toLowerCase().includes('cupboard')) {
                imgHolder = deviceImages['cupboard'];
            } else if (sensor.type.toLowerCase().includes('faucet')) {
                imgHolder = deviceImages['faucet'];
            } else if (sensor.type.toLowerCase().includes('shower')) {
                imgHolder = deviceImages['shower'];
            } else if (sensor.type.toLowerCase().includes('seat')) {
                imgHolder = deviceImages['seat'];
            } else if (sensor.type.toLowerCase().includes('bed')) {
                imgHolder = deviceImages['bed'];
            }

            var sensorObject = new fabric.FabricImage(imgHolder, {
                left: x,
                top: y,
                scaleX: 1,
                scaleY: 1,
                originX: 'center',
                originY: 'center',
                id: sensor.id,
                classifier: 'sensor',
                area_id: area_id,
            });

            angleScaler++;
            deviceArray.push(sensorObject);
        }
    });

    const group = new fabric.Group(deviceArray, {
        left: l,
        top: t,
        scaleX: sx,
        scaleY: sy,
        strokeUniform: true,
        originX: 'center',
        originY: 'center',
        classifier: 'device',
        id: device.id,
        area_id: area_id,
    });

    return group;

}