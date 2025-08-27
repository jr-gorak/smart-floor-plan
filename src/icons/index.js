import Draw from './menu-icons/pencil.svg';
import Sensor from './menu-icons/sensors.svg';
import Component from './menu-icons/door.svg';
import Create from './menu-icons/plus-box-outline.svg';
import Save from './menu-icons/content-save.svg';
import Export from './menu-icons/file-export-outline.svg';
import Account from './menu-icons/account.svg';
import Guide from './menu-icons/information.svg';
import About from './menu-icons/help.svg';
import DrawLine from './menu-icons/vector-line.svg';
import Square from './menu-icons/square-outline.svg';
import CircleOutline from './menu-icons/circle-outline.svg';
import Map from './menu-icons/map-outline.svg';

import Delete from './control-icons/delete-circle.png';
import Copy from './control-icons/content-copy.svg';
import Share from './control-icons/share-circle.svg';
import Move from './control-icons/hand-back-right.svg';
import Cursor from './control-icons/cursor-pointer.svg';
import Settings from './control-icons/cog-outline.svg';
import Lock from './control-icons/lock.svg';
import Unlock from './control-icons/lock-open.svg';
import ArrowFlipX from './control-icons/arrow_range.svg';
import ArrowFlipY from './control-icons/height.svg';

import DoorOpen from './device-icons/door-open.svg';
import DoorClose from './device-icons/door-closed.svg';
import Upstairs from './device-icons/stairs-up.svg';
import Downstairs from './device-icons/stairs-down.svg';
import WindowClosed from './device-icons/window-closed-variant.svg';
import WindowOpen from './device-icons/window-open-variant.svg';
import Lorawan from './device-icons/assistant_device.svg';
import Zigbee from './device-icons/missing_controller.svg';
import Person from './device-icons/accessibility.svg';
import Battery from './device-icons/battery.svg';
import LightOff from './device-icons/light_off.svg';
import LightOn from './device-icons/lightbulb.svg';
import Co2 from './device-icons/co2.svg';
import Voltage from './device-icons/bolt.svg';
import Humidity from './device-icons/cool_to_dry.svg';
import Thermometer from './device-icons/device_thermostat.svg';
import Pressure from './device-icons/compress.svg';
import Sound from './device-icons/sound_detection.svg';
import Motion from './device-icons/motion_blur.svg';
import Toaster from './device-icons/toaster.svg';
import Microwave from './device-icons/microwave.svg';
import Kettle from './device-icons/kettle.svg';
import Blender from './device-icons/blender.svg';
import TV from './device-icons/television.svg';
import Faucet from './device-icons/faucet.svg';
import Shower from './device-icons/shower-head.svg';
import Cupboard from './device-icons/cupboard.svg';
import Seat from './device-icons/seat.svg';
import BedIcon from './device-icons/bed-double.svg';

import Door from './draw-icons/doorway.svg';
import Bathtub from './draw-icons/bathtub.svg';
import Bed from './draw-icons/bed.svg';
import Chair from './draw-icons/chair.svg';
import KitchenSink from './draw-icons/kitchen_sink.svg';
import RoundSink from './draw-icons/round_sink.svg';
import Sofa from './draw-icons/sofa.svg';
import Stairs from './draw-icons/stairs.svg';
import Stove from './draw-icons/stove.svg';
import ThreeSofa from './draw-icons/three_seat_sofa.svg';
import Toilet from './draw-icons/toilet.svg';
import Window from './draw-icons/window.svg';

var deleteImg = document.createElement('img');
var copyImg = document.createElement('img');
var moveImg = document.createElement('img');
var cursorImg = document.createElement('img');
var settingsImg = document.createElement('img');
var lockImg = document.createElement('img');
var unlockImg = document.createElement('img');
var arrowFlipXImg = document.createElement('img');
var arrowFlipYImg = document.createElement('img');
var lorawanImg = document.createElement('img');
var zigbeeImg = document.createElement('img');
var personImg = document.createElement('img');
var batteryImg = document.createElement('img');
var lightoffImg = document.createElement('img');
var co2Img = document.createElement('img');
var voltageImg = document.createElement('img');
var humidityImg = document.createElement('img');
var thermometerImg = document.createElement('img');
var pressureImg = document.createElement('img');
var soundImg = document.createElement('img');
var motionImg = document.createElement('img');
var sensorImg = document.createElement('img');
var toasterImg = document.createElement('img');
var microwaveImg = document.createElement('img');
var kettleImg = document.createElement('img');
var doorwayImg = document.createElement('img');
var doorImg = document.createElement('img');
var windowImg = document.createElement('img');
var windowClosedImg = document.createElement('img');
var bathtubImg = document.createElement('img');
var bedImg = document.createElement('img');
var chairImg = document.createElement('img');
var kitchensinkImg = document.createElement('img');
var roundsinkImg = document.createElement('img');
var sofaImg = document.createElement('img');
var stairsImg = document.createElement('img');
var stoveImg = document.createElement('img');
var threesofaImg = document.createElement('img');
var toiletImg = document.createElement('img');
var blenderImg = document.createElement('img');
var tvImg = document.createElement('img');
var faucetImg = document.createElement('img');
var showerImg = document.createElement('img');
var cupboardImg = document.createElement('img');
var seatImg = document.createElement('img');
var bedIconImg = document.createElement('img');

copyImg.src = Copy;
deleteImg.src = Delete;
moveImg.src = Move;
cursorImg.src = Cursor;
settingsImg.src = Settings;
lockImg.src = Lock;
unlockImg.src = Unlock;
arrowFlipXImg.src = ArrowFlipX;
arrowFlipYImg.src = ArrowFlipY;
lorawanImg.src = Lorawan;
zigbeeImg.src = Zigbee;
personImg.src = Person;
batteryImg.src = Battery;
lightoffImg.src = LightOff;
co2Img.src = Co2;
voltageImg.src = Voltage;
humidityImg.src = Humidity;
thermometerImg.src = Thermometer;
pressureImg.src = Pressure;
soundImg.src = Sound;
motionImg.src = Motion;
toasterImg.src = Toaster;
microwaveImg.src = Microwave;
kettleImg.src = Kettle;
blenderImg.src = Blender;
tvImg.src = TV;
faucetImg.src = Faucet;
showerImg.src = Shower;
cupboardImg.src = Cupboard;
seatImg.src = Seat;
bedIconImg.src = BedIcon;
sensorImg.src = Sensor;
doorwayImg.src = Door;
doorImg.src = Component;
windowImg.src = Window;
windowClosedImg.src = WindowClosed;
bathtubImg.src = Bathtub;
bedImg.src = Bed;
chairImg.src = Chair;
kitchensinkImg.src = KitchenSink;
roundsinkImg.src = RoundSink;
sofaImg.src = Sofa;
stairsImg.src = Stairs;
stoveImg.src = Stove;
threesofaImg.src = ThreeSofa;
toiletImg.src = Toilet;

const componentImages = {
    door: doorwayImg, stairs: stairsImg, bed: bedImg, chair: chairImg, sofa: sofaImg, window: windowImg, threesofa: threesofaImg, stove: stoveImg,
    kitchensink: kitchensinkImg, bathtub: bathtubImg, roundsink: roundsinkImg, toilet: toiletImg
}

const deviceImages = {
    lorawan: lorawanImg, zigbee: zigbeeImg, person: personImg, battery: batteryImg, light: lightoffImg, co2: co2Img, electric: voltageImg, humidity: humidityImg,
    thermometer: thermometerImg, pressure: pressureImg, sound: soundImg, motion: motionImg, sensor: sensorImg, window: windowClosedImg, door: doorImg, toaster: toasterImg,
    microwave: microwaveImg, kettle: kettleImg, blender: blenderImg, tv: tvImg, faucet: faucetImg, shower: showerImg, cupboard: cupboardImg, seat: seatImg, bed: bedIconImg
}

export {
    Draw, Sensor, Component, Create, Save, Export, Account, Guide, About, DrawLine, Square, DoorOpen, DoorClose, Upstairs, Downstairs, WindowClosed, WindowOpen, Delete,
    Copy, Share, Move, Settings, Lorawan, Zigbee, Person, Battery, LightOff, LightOn, Co2, Voltage, Humidity, Thermometer, Pressure, Sound, Motion,
    Door, Bathtub, Bed, Chair, KitchenSink, RoundSink, Sofa, Stairs, Stove, ThreeSofa, Toilet, Window, Map, CircleOutline,
    deleteImg, copyImg, moveImg, cursorImg, settingsImg, lockImg, unlockImg, arrowFlipXImg, arrowFlipYImg, lorawanImg, zigbeeImg, batteryImg, lightoffImg, co2Img, voltageImg, humidityImg, thermometerImg, pressureImg, soundImg, motionImg,
    doorwayImg, doorImg, windowImg, windowClosedImg, personImg, sensorImg, bathtubImg, bedImg, chairImg, kitchensinkImg, roundsinkImg, sofaImg, stairsImg, stoveImg, threesofaImg, toiletImg, componentImages, deviceImages
};
