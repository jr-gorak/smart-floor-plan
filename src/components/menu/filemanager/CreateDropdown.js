import {useState, useEffect} from 'react';
import '../../css/Dropdown.css';
import '../../css/Popup.css'

function CreateDropdown({activeDropdown, onCanvasWidth, onCanvasHeight, onActiveDropdown, onCanvasImageData, onCanvasName, onCanvasID, onActive, onRefreshToggle, onDeviceList, onOriginalDeviceList}) {

  const [activeValue, setActiveValue] = useState(null);
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(800);
  const [name, setName] = useState("")
  const [error, setError] = useState(null);
  const [buttonToggle, setButtonToggle] = useState(false);
  const [floorArray, setFloorArray] = useState(["GR"]);
  const [imageData, setImageData] = useState({});

  function AddFloor(direction) {
        if (direction === 'up') {
            let floorCount = 0;
            floorArray.forEach((floor) => {
                if (floor.includes('B')) {
                    floorCount++
                }
            })
            if (floorArray.length < 5) {
                setFloorArray(floors => [((floorArray.length - floorCount) + "F"), ...floors])
            }
        }
        if (direction === 'down') {
            let floorCount = 0;
            floorArray.forEach((floor) => {
                if (floor.includes('F')) {
                    floorCount++
                }
            })
            if (floorArray.length < 5) {
            setFloorArray(floors => [...floors, ((floorArray.length - floorCount) + "B")])
            }
        }
    }

  function RemoveFloor(floor) {
    setFloorArray(original => original.filter(floorID => floorID !== floor))
  }

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

    const imageUpload = (e, floor) => {
      console.log(e);
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            setImageData(images => ({
            ...images, 
            [floor]: reader.result
        }))
        }
        reader.readAsDataURL(file)
      }
      console.log(imageData)
    }

  function canvasImageCreate() {
    if (name === "") {
      setError("Please ensure you have named your project");
    } else {
    const img = new Image();
    img.src = imageData["GR"];
    img.onload = () => {
      onCanvasWidth(img.width);
      onCanvasHeight(img.height);
      onCanvasImageData(imageData);
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

  useEffect(() => {
    if(imageData !=="{}" && name) {
      setButtonToggle(true);
    } else {
      setButtonToggle(false)
    }
  }, [imageData, name])

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

            <div className='popup-content'><p>Please select an image to upload as the background of the canvas. If you have multiple floors,
              feel free to add a different image per floor.
            </p>
              <div>
                <p>Upload floor plan:</p>
                <button onClick={() => AddFloor('up')}>Add Upper Floor</button>

                {floorArray.map((floor) => (
                  <div className='upload-map'>
                    <b>{floor}:  </b><input key={floor} type='file' accept='image/*' onChange={(e) => imageUpload(e, floor)} />
                    {(floor !== 'GR') && (floor === floorArray[0] || floor === floorArray[floorArray.length - 1]) && 
                    <button onClick={() => RemoveFloor(floor)}>X</button>
                    }
                  </div>
                ))}

                <button onClick={() => AddFloor('down')}>Add Lower Floor</button>
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