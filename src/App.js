import { useCallback, useState } from 'react';
import { auth } from './firebase';
import { Undo, Redo } from './icons';
import Menu from './components/Menu';
import './App.css';
import FabricCanvas from './components/canvas/FabricCanvas';
import AboutPopup from './components/menu/information/AboutPopup';
import GuidePopup from './components/menu/information/GuidePopup';
import AccountPopup from './components/menu/information/AccountPopup';
import DrawTool from './components/menu/toolset/DrawTool';
import SensorTool from './components/menu/toolset/SensorTool';
import ComponentTool from './components/menu/toolset/ComponentTool';
import UserAuthentication from './components/menu/filemanager/UserAuthentication';

function App() {

  const user = auth.currentUser;

  const [zoom, setZoom] = useState(1);
  const [transl, setTransl] = useState(0);
  const [touchDistance, setTouchDistance] = useState(0);
  const [touchToggle, setTouchToggle] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const [canvasWidth, setCanvasWidth] = useState(() => sessionStorage.getItem('canvasWidth'));
  const [canvasHeight, setCanvasHeight] = useState(() => sessionStorage.getItem('canvasHeight'));
  const [canvasName, setCanvasName] = useState(() => sessionStorage.getItem('canvasName'));
  const [canvasID, setCanvasID] = useState(() => sessionStorage.getItem('canvasID'));
  const [activeCanvas, setActiveCanvas] = useState(() => JSON.parse(sessionStorage.getItem('activeCanvas')));
  const [deviceList, setDeviceList] = useState(() => JSON.parse(sessionStorage.getItem('sensors')));
  const [originalDeviceList, setOriginalDeviceList] = useState(() => JSON.parse(sessionStorage.getItem('original-sensors')));
  const [labelList, setLabelList] = useState(() => JSON.parse(sessionStorage.getItem('labels')));
  const [deviceRegistry, setDeviceRegistry] = useState(() => JSON.parse(sessionStorage.getItem('deviceRegistry')));
  const [entityRegistry, setEntityRegistry] = useState(() => JSON.parse(sessionStorage.getItem('entityRegistry')));
  const [floorData, setFloorData] = useState(() => { const stored = sessionStorage.getItem("floorData"); return stored ? JSON.parse(stored) : {}; });
  const [floorArray, setFloorArray] = useState(() => { const stored = sessionStorage.getItem("floorArray"); return stored ? JSON.parse(stored) : ["GR"]; });
  const [dragMode, setDragMode] = useState(true);
  const [menuObject, setMenuObject] = useState(null);
  const [objectColor, setObjectColor] = useState("");
  const [strokeColor, setStrokeColor] = useState("");
  const [strokeWidth, setStrokeWidth] = useState(null);
  const [moveStack, setMoveStack] = useState(null);
  const [actionIndex, setActionIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0)
  const [floorStates, setFloorStates] = useState([])
  const [deviceStates, setDeviceStates] = useState([])
  const [stateToggle, setStateToggle] = useState(false);

  const [canvasAction, setCanvasAction] = useState('select');
  const [canvasImageData, setCanvasImageData] = useState(null);
  const [saveToggle, setSaveToggle] = useState(false);
  const [loadToggle, setLoadToggle] = useState(false);
  const [deviceToggle, setDeviceToggle] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [canvasDevice, setCanvasDevice] = useState(false);
  const [handlerToggle, setHandlerToggle] = useState(null);
  const [drawWidth, setDrawWidth] = useState(1)
  const openPopup = (value) => setActivePopup(value);
  const closePopup = () => setActivePopup(null);

  const retrieveWidth = (width) => setCanvasWidth(width);
  const retrieveHeight = (height) => setCanvasHeight(height);
  const retrieveAction = (action) => setCanvasAction(action);
  const retrieveImageData = (image) => setCanvasImageData(image);
  const retrieveName = (name) => setCanvasName(name);
  const retrieveID = (id) => setCanvasID(id);
  const retrieveActive = (active) => setActiveCanvas(active);
  const retrieveSave = (save) => setSaveResult(save);
  const retrieveDevice = (device) => setCanvasDevice(device);
  const retrieveDeviceList = (list) => setDeviceList(list);
  const retrieveOriginalDeviceList = (list) => setOriginalDeviceList(list);
  const retrieveDrawWidth = (pixel) => setDrawWidth(pixel);
  const retrieveLabelList = (labels) => setLabelList(labels);
  const retrieveDeviceRegistry = (data) => setDeviceRegistry(data);
  const retrieveEntityRegistry = (data) => setEntityRegistry(data);
  const retrieveFloorData = (data) => setFloorData(data);
  const retrieveFloorArray = (array) => setFloorArray(array);
  const retrieveMoveStack = (value) => setMoveStack(value);
  const retrieveActionIndex = (index) => setActionIndex(index);
  const retrieveMaxIndex = (index) => setMaxIndex(index);
  const retrieveFloorStates = (state) => setFloorStates(state);
  const retrieveStateToggle = (state) => setStateToggle(state);
  const retrieveDeviceStates = (state) => setDeviceStates(state);

  const canvasInfo = { canvasWidth, canvasHeight, canvasName, canvasID, drawWidth, entityRegistry, deviceRegistry }
  const canvasData = { deviceList, originalDeviceList, labelList, floorData, canvasImageData, canvasDevice, floorArray, menuObject, objectColor, strokeColor, strokeWidth }
  const canvasState = { activeCanvas, canvasAction, saveToggle, loadToggle, refreshToggle, deviceToggle, saveResult, handlerToggle, dragMode, moveStack, actionIndex, maxIndex, floorStates, stateToggle, deviceStates }

  const centerZoom = () => {
    window.scrollTo({
      top: (document.documentElement.scrollHeight - window.innerHeight) / 2,
      left: (document.documentElement.scrollWidth - window.innerWidth) / 2,
    });
  };

  function preventScroll(scrollEvent) {
    scrollEvent.preventDefault();
  }

  const zoomScroll = (e) => {

    if (handlerToggle) {
      return;
    }
    if (e._reactName === 'onWheel') {
      window.addEventListener('wheel', preventScroll, { passive: false });

      if (e.deltaY < 0) {
        setZoom(Math.min(zoom + 0.05, 1.5))
        if (zoom < 1) {
          setTransl(Math.max(transl - 5, 0))
        }
      } else {
        setZoom(Math.max(zoom - 0.05, 0.5))
        if (zoom < 1) {
          setTransl(Math.min(transl + 5, 40))
        }
      }

      if (zoom !== setZoom) {
        centerZoom();
      }

      setTimeout(() => {
        window.removeEventListener('wheel', preventScroll);
      }, 1000);
    } else if (e._reactName === 'onTouchMove' && e.touches.length === 2) {
      const dx = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      const dy = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      if (!touchToggle) {
        setTouchDistance(Math.hypot(dx, dy))
        setTouchToggle(true);
      }
      const distance = Math.hypot(dx, dy);
      if (distance > touchDistance) {
        setZoom(Math.min(zoom + 0.025, 1.5))
        if (zoom < 1) {
          setTransl(Math.max(transl - 2.5, 0))
        }
      } else {
        setZoom(Math.max(zoom - 0.025, 0.5))
        if (zoom < 1) {
          setTransl(Math.min(transl + 2.5, 40))
        }
      }

      if (zoom !== setZoom) {
        centerZoom();
      }
    }
  };

  function endTouch() {
    setTouchDistance(null);
    setTouchToggle(false);
  }

  function sessionSave() {
    sessionStorage.setItem('canvasWidth', canvasWidth)
    sessionStorage.setItem('canvasHeight', canvasHeight)
    sessionStorage.setItem('canvasName', canvasName)
    sessionStorage.setItem('canvasID', canvasID)
    sessionStorage.setItem('activeCanvas', JSON.stringify(activeCanvas))
    sessionStorage.setItem('sensors', JSON.stringify(deviceList))
    sessionStorage.setItem('original-sensors', JSON.stringify(originalDeviceList))
    sessionStorage.setItem('labels', JSON.stringify(labelList))
    sessionStorage.setItem('deviceRegistry', JSON.stringify(deviceRegistry))
    sessionStorage.setItem('entityRegistry', JSON.stringify(entityRegistry))
    sessionStorage.setItem('floorData', JSON.stringify(floorData));
  }

  const retrieveMenuObject = useCallback((obj) => {
    setMenuObject(obj);
  }, [])

  const retrieveObjectColor = useCallback((color) => {
    setObjectColor(color);
  }, [])

  const retrieveStrokeColor = useCallback((color) => {
    setStrokeColor(color);
  }, [])

  const retrieveStrokeWidth = useCallback((width) => {
    setStrokeWidth(width);
  }, [])

  window.addEventListener("beforeunload", sessionSave);
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false })

  function stateChanges(type) {
    if (type === 'undo') {
      setActionIndex((index) => index - 1)
      setStateToggle(true);
    } else if (type === 'redo') {
      setActionIndex((index) => index + 1)
      setStateToggle(true);
    }
  }

  return (
    <div className="App">

      <header>
        <Menu canvasData={canvasData} canvasState={canvasState} canvasInfo={canvasInfo} onOpenPopup={openPopup} onCanvasAction={retrieveAction} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onCanvasImageData={retrieveImageData} onCanvasName={retrieveName} onActive={retrieveActive} onCanvasID={retrieveID} onSaveToggle={() => setSaveToggle(true)}
          onRefreshToggle={() => setRefreshToggle(true)} onSaveResult={retrieveSave} user={user} onDeviceList={retrieveDeviceList} onOriginalDeviceList={retrieveOriginalDeviceList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} onFloorData={retrieveFloorData} onFloorArray={retrieveFloorArray} />
      </header>


      <div className='Canvas-State' style={{ visibility: activeCanvas ? 'visible' : 'hidden' }}>
        <div className='Canvas' style={{ transform: `scale(${zoom}) translate(${transl}%, ${transl}%)`, transformOrigin: 'top left', }} onWheel={zoomScroll} onTouchMove={zoomScroll} onTouchEnd={endTouch}>
          <FabricCanvas canvasInfo={canvasInfo} canvasData={canvasData} canvasState={canvasState} onRefreshToggle={() => setRefreshToggle(false)} onDeviceToggle={() => setDeviceToggle(false)}
            user={user} onDeviceList={retrieveDeviceList} onHandlerToggle={(toggle) => setHandlerToggle(toggle)} onFloorData={retrieveFloorData} onFloorArray={retrieveFloorArray}
            onCanvasID={retrieveID} onSaveToggle={() => setSaveToggle(false)} onSaveResult={retrieveSave} onLoadToggle={() => setLoadToggle(false)} onCanvasImageData={retrieveImageData} retrieveMenuObject={retrieveMenuObject}
            retrieveObjectColor={retrieveObjectColor} retrieveStrokeColor={retrieveStrokeColor} onMoveStack={retrieveMoveStack} retrieveStrokeWidth={retrieveStrokeWidth} onActionIndex={retrieveActionIndex} onMaxIndex={retrieveMaxIndex}
            onFloorStates={retrieveFloorStates} onStateToggle={retrieveStateToggle} onDeviceStates={retrieveDeviceStates}
          />
        </div>

        <div className="canvas-select-menu">
          <div className="view-checkbox">
            <p>Screen Dragging</p>
            <input className='checkbox' type="checkbox" checked={dragMode} onChange={(e) => setDragMode(e.target.checked)} />
          </div>
        </div>
      </div>

      {maxIndex > 0 && (
        <div className='undo-menu'>
          <button disabled={actionIndex === 1} onClick={() => stateChanges('undo')}><img src={Undo} className="menu-icon" alt="logo" />undo</button>
          <button disabled={actionIndex === maxIndex} onClick={() => stateChanges('redo')}><img src={Redo} className="menu-icon" alt="logo" />redo</button>
        </div>
      )}

      {menuObject && menuObject.classifier !== "mark" && menuObject.classifier !== "text" && (
        <div className='object-menu'>
          <h3><b>Object Menu</b></h3>
          <p>type: {menuObject.type}</p>

          {menuObject.type !== 'image' && (menuObject.classifier === 'draw' || menuObject.classifier === 'locked') && (
            <div>
              {menuObject.type !== 'line' && (
                <div className='fill-picker'>
                  <div className='fill'>fill: <input className="object-color-input" type='color' value={objectColor ? (objectColor === "default" ? "#000000" : objectColor) : "#000000"} onChange={(e) => setObjectColor(e.target.value)}></input></div>
                  <button onClick={() => setObjectColor("default")}>clear</button>
                </div>
              )}
              <div className='stroke-picker'>
                <p>stroke: <input className="object-color-input" type='color' value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)}></input></p>
              </div>
            </div>
          )}
          <button onClick={() => setMoveStack('up')}>forward ↑</button>
          <button onClick={() => setMoveStack('down')}>backward ↓</button>

          {menuObject.type !== 'rect' && menuObject.type !== 'image' && menuObject.classifier !== "device" && (
            <div>
              <div className='slider'>
                Stroke Width
                <input type="range" defaultValue={strokeWidth} onChange={(e) => setStrokeWidth(e.target.value)} min="1" max="5" list='data' />
              </div>
              <datalist id="data">
                <option value="1" label='1'></option>
                <option value="2" label='2'></option>
                <option value="3" label='3'></option>
                <option value="4" label='4'></option>
                <option value="5" label='5'></option>
              </datalist>
            </div>
          )}
        </div>
      )
      }

      {activePopup === 'draw' && (
        <DrawTool onCanvasAction={retrieveAction} drawWidth={drawWidth} onDrawWidth={retrieveDrawWidth} />
      )
      } {
        activePopup === 'sensor' && (
          <SensorTool onCanvasDevice={retrieveDevice} onDeviceToggle={() => setDeviceToggle(true)} onDeviceList={retrieveDeviceList} deviceList={deviceList} onOriginalDeviceList={retrieveOriginalDeviceList} onLabelList={retrieveLabelList} labelList={labelList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} />
        )
      } {
        activePopup === 'component' && (
          <ComponentTool onCanvasAction={retrieveAction} />
        )
      }

      {
        activePopup === 'about' && (
          <AboutPopup onClose={closePopup} />
        )
      } {
        activePopup === 'guide' && (
          <GuidePopup onClose={closePopup} />
        )
      }
      {
        activePopup === 'account' && !user && (
          <UserAuthentication onClose={closePopup} />
        )
      }
      {
        activePopup === 'account' && user && (
          <AccountPopup onClose={closePopup} onCanvasName={retrieveName} onCanvasID={retrieveID} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onActive={retrieveActive} onLoadToggle={() => setLoadToggle(true)} onRefreshToggle={() => setRefreshToggle(true)} onDeviceList={retrieveDeviceList} onOriginalDeviceList={retrieveOriginalDeviceList} onLabelList={retrieveLabelList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} user={user} />
        )
      }
    </div >
  );
}

export default App;
