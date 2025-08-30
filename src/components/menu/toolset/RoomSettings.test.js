import { toggleHandle, updateRoom } from "./RoomSettings";
import * as fabric from "fabric";

describe('toggleHandle', () => {

    const onActiveRoom = jest.fn();

    it('Room settings popup is exited', () => {
        toggleHandle(onActiveRoom)
        expect(onActiveRoom).toHaveBeenCalledWith("");
    })
})

describe('updateRoom', () => {

    const onUpdatedLabel = jest.fn();
    const onUpdatedRoom = jest.fn();
    const onActiveRoom = jest.fn();
    let roomName = "Mock Room"
    const roomColor = "#0000ff"

    const polygonVertices = [{ x: 50, y: 100 }, { x: 50, y: 200 }, { x: 150, y: 200 }, { x: 150, y: 101 }, { x: 50, y: 100 }]

    const activeRoom = new fabric.Polygon(polygonVertices, {
        fill: '#ff00000d',
        stroke: '#ff00000d',
        area_id: null
    })

    it('The room colour is updated from red to blue', () => {
        updateRoom(roomName, activeRoom, roomColor, onUpdatedLabel, onUpdatedRoom, toggleHandle, onActiveRoom)
        expect(onUpdatedLabel).toHaveBeenCalledWith("Mock Room");
        expect(onUpdatedRoom).toHaveBeenCalledWith(expect.objectContaining({ fill: "#0000ff0d" }));
        expect(onUpdatedRoom).toHaveBeenCalledWith(expect.objectContaining({ area_id: "mock_room" }));
        expect(onActiveRoom).toHaveBeenCalledWith("")
    })

    it('The room name is changed', () => {
        roomName = "New Room"
        updateRoom(roomName, activeRoom, roomColor, onUpdatedLabel, onUpdatedRoom, toggleHandle, onActiveRoom)
        expect(onUpdatedLabel).toHaveBeenCalledWith("New Room");
        expect(onUpdatedRoom).toHaveBeenCalledWith(expect.objectContaining({ fill: "#0000ff0d" }));
        expect(onUpdatedRoom).toHaveBeenCalledWith(expect.objectContaining({ area_id: "new_room" }));
        expect(onActiveRoom).toHaveBeenCalledWith("")
    })
})