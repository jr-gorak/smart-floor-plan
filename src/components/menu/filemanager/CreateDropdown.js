import {useState} from 'react';
import '../../css/Dropdown.css';
import '../../css/Popup.css'

function CreateDropdown({activeDropdown, onCanvasWidth, onCanvasHeight, onActiveDropdown, onCanvasImage, onCanvasName, onCanvasID, onActive, onRefreshToggle, onDeviceList, onOriginalDeviceList}) {

  const [activeValue, setActiveValue] = useState(null);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(800);
  const [name, setName] = useState("")
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [buttonToggle, setButtonToggle] = useState(false);

  function canvasCreate() {

    if (height === null || width === null || name === "") {
      setError("Please ensure all fields are filled out")
    } else if (width > 2500) {
      setError("The width must be less than 2500")
    } else if (height > 2500) {
      setError("The height must be less than 2500")
    } else {
    setError(null);
    onCanvasWidth(width);
    onCanvasHeight(height);
    onCanvasName(name);
    onActive(true);
    onCanvasID(null);
    onRefreshToggle();
    setWidth(1000);
    setHeight(800);
    setName("");
    setActiveValue(null);
    onActiveDropdown(null);
    onDeviceList(null);
    onOriginalDeviceList(null);
    }
  }

    const imageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          setButtonToggle(!buttonToggle);
        }
        reader.readAsDataURL(file)
      }
    }

  function canvasImageCreate() {
    if (name === "") {
      setError("Pleae ensure you have named your project");
    } else {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      onCanvasWidth(img.width);
      onCanvasHeight(img.height);
      onCanvasImage(image);
      onCanvasName(name);
      onActive(true);
      onCanvasID(null);
      onRefreshToggle();
      setActiveValue(null);
      onActiveDropdown(null);
      setName("");
      setButtonToggle(!buttonToggle);
      onDeviceList(null);
      onOriginalDeviceList(null);
    }
    }
  }

  function togglePopup(value) {

      if (activeValue === null) {
          setActiveValue(value)
      } else if (activeValue !== value) {
          setActiveValue(value)
      }  else if (activeValue === value) {
          setActiveValue(null)
      }  
  }

  return (
    <div>
      {activeDropdown === 'create' &&
      <div className="dropdown-container">
          <div className='dropdown-content'>
            <button onClick={() => togglePopup('new')}>Create new canvas</button>
            <button onClick={() => togglePopup('upload')}>Create canvas from image</button>
          </div>
      </div>
      }
      {activeValue === 'new' &&
        <div className="filter" onClick={() => setActiveValue(null)}>
          <div className="small-frame" onClick={e => e.stopPropagation()}>
            <div className='exit'>
            <button onClick={() => setActiveValue(null)}>X</button>
            </div>
            <h2>Create New Canvas</h2>
            <div className='popup-content'><p>Please choose the dimensions of your canvas below</p>
              <div className='dimensions'>
                <p>w:</p>
                <input type='number' value={width} onChange={(e) => setWidth(e.target.value)} placeholder='width' />
                <p>h:</p>
                <input type='number' value={height} onChange={(e) => setHeight(e.target.value)} placeholder='height' />
              </div>

              Floor Plan Name: <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='name' maxLength={100} />
              {error && (
                <p style={{color: 'red'}}>{error}</p>
              )}
              <div className='create-button'>
                <button onClick={() => canvasCreate()}>Create Canvas</button>
              </div>
            </div> 
          </div>
        </div>
      }

      {activeValue === 'upload' &&
        <div className="filter" onClick={() => setActiveValue(null)}>
          <div className="small-frame" onClick={e => e.stopPropagation()}>
            <div className='exit'>
            <button onClick={() => setActiveValue(null)}>X</button>
            </div>
            <h2>Upload Image for Canvas Background</h2>
            <div className='popup-content'><p>Please select an image to upload as the background of the canvas</p>
              <div className='dimensions'>
                <p>Upload floor plan:</p>
                <input type='file' accept='image/*' onChange={imageUpload} />
              </div>
              Floor Plan Name: <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='name' maxLength={100} />
              {error && (
                <p style={{color: 'red'}}>{error}</p>
              )}
              <div className='create-button'>
                <button onClick={() => canvasImageCreate()} disabled={!buttonToggle}>Upload Image</button>
              </div>
            </div> 
          </div>
        </div>
      }
    </div>
  );
}

export default CreateDropdown;