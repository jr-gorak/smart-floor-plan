import { useState } from 'react';
import '../../css/Dropdown.css';
import '../../css/Popup.css'

function CreateNewBox({activeDropdown, onCanvasWidth, onCanvasHeight, onActiveDropdown}) {

  const [activePopup, setActivePopup] = useState(false);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [error, setError] = useState(null);

  function testCreate() {

    if (height === null || width === null) {
      setError("please ensure there is a width and height")
    } else if (width > 1000) {
      setError("The width must be less than 1000")
    } else if (height > 1000) {
      setError("The height must be less than 1000")
    } else {
    setError(null)
    onCanvasWidth(width)
    onCanvasHeight(height)
    setWidth(null)
    setHeight(null)
    setActivePopup(!activePopup)
    onActiveDropdown(null)
    }
  }


  return (
    <div>
      {activeDropdown === 'create' &&
      <div className="dropdown-container">
          <div className='dropdown-content'>
            <button onClick={() => setActivePopup(!activePopup)}>Create new canvas</button>
            <button>Create canvas from upload</button>
          </div>
      </div>
      }
      {activePopup === true &&
        <div className="filter" onClick={() => setActivePopup(!activePopup)}>
          <div className="small-frame" onClick={e => e.stopPropagation()}>
            <div className='exit'>
            <button onClick={() => setActivePopup(!activePopup)}>X</button>
            </div>
            <h2>Create New Canvas</h2>
            <div className='create-content'><p>Please choose the dimensions of your canvas below</p>
              <div className='dimensions'>
                <input type='number' value={width} onChange={(e) => setWidth(e.target.value)} placeholder='width'/>
                <p>x</p>
                <input type='number' value={height} onChange={(e) => setHeight(e.target.value)} placeholder='height'/>
              </div>
              {error && (
                <p style={{color: 'red', margin: '0 0 0 0'}}>{error}</p>
              )}
              <div className='create-button'>
                <button onClick={() => testCreate()}>Create Canvas</button>
              </div>
            </div> 
          </div>
        </div>
      }
    </div>
  );
}

export default CreateNewBox;