import ReactDOM from 'react-dom';
import { useState } from 'react';
import '../../css/Tools.css';
import '../../css/Popup.css';

export function toggleHandle(onActiveRoom) {
    document.body.style.overflow = 'auto';
    onActiveRoom("");
};

export function updateRoom(roomName, activeRoom, roomColor, onUpdatedLabel, onUpdatedRoom, toggleHandle, onActiveRoom) {
    if (roomName) {
        const textTransform = roomName.toLowerCase().replace(/ /g, '_');
        activeRoom.set({ area_id: textTransform })
    }
    const hexAlpha = roomColor + "0d";
    activeRoom.set({ fill: hexAlpha })

    onUpdatedLabel(roomName);
    onUpdatedRoom(activeRoom);
    toggleHandle(onActiveRoom)
}

function RoomSettings({ activeRoom, roomLabel, onActiveRoom, onUpdatedRoom, onUpdatedLabel }) {

    const [roomName, setRoomName] = useState(roomLabel)
    const [roomColor, setRoomColor] = useState(activeRoom.fill.slice(0, 7))

    document.body.style.overflow = 'hidden';

    return ReactDOM.createPortal(
        <div className="filter" onClick={() => toggleHandle(onActiveRoom)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
                <div className='exit'>
                    <button onClick={() => toggleHandle(onActiveRoom)}>X</button>
                </div>

                <h2>Room Settings</h2>
                <div className='popup-content'>

                    <p><b>Room Label: </b> <input type='text' value={roomName} onChange={(e) => setRoomName(e.target.value)}></input></p>
                    <p><b>Room Color: </b> <input type='color' value={roomColor} onChange={(e) => setRoomColor(e.target.value)}></input></p>

                    <button onClick={() => updateRoom(roomName, activeRoom, roomColor, onUpdatedLabel, onUpdatedRoom, toggleHandle, onActiveRoom)}>Update</button>

                </div>
            </div>
        </div>,
        document.getElementById('popup-container'))
}

export default RoomSettings;