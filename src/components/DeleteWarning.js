import ReactDOM from 'react-dom';
import './css/Popup.css';

function DeleteWarning({onDeleteWarning, onDeleteConfirmation, onStachedFloor}) {

    document.body.style.overflow = 'hidden';
    
    function toggleHandle() {
        document.body.style.overflow = 'auto';
        onStachedFloor();
        onDeleteWarning();
    };

    function removeFloor() {
        document.body.style.overflow = 'auto';
        onDeleteConfirmation();
        onDeleteWarning();
    }

    return ReactDOM.createPortal(
        <div className="filter" onClick={() => toggleHandle()}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
                <div className='exit'>
                    <button onClick={() => toggleHandle()}>X</button>
                </div>

                <h2>WARNING!</h2>
                <div className='popup-content'>
                    <p> The floor you are trying to delete has active objects on it. Do you really want to delete that floor? </p>
                    <button onClick={() => removeFloor()}>Yes, Delete</button>
                    <button onClick={() => toggleHandle()}>No, Do Not Delete</button>
                </div>
            </div>
        </div>,
    document.getElementById('popup-container'))
    }

export default DeleteWarning;