import { useState } from 'react';
import { auth } from './firebase';
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

  const canvasInfo = { canvasWidth, canvasHeight, canvasName, canvasID, drawWidth, entityRegistry, deviceRegistry }
  const canvasData = { deviceList, originalDeviceList, labelList, floorData, canvasImageData, canvasDevice, floorArray }
  const canvasState = { activeCanvas, canvasAction, saveToggle, loadToggle, refreshToggle, deviceToggle, saveResult, handlerToggle, dragMode }

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
    sessionStorage.setItem("floorData", JSON.stringify(floorData));
  }

  window.addEventListener("beforeunload", sessionSave);
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false })


  return (
    <div className="App">

      <header>
        <Menu canvasData={canvasData} canvasState={canvasState} canvasInfo={canvasInfo} onOpenPopup={openPopup} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onCanvasImageData={retrieveImageData} onCanvasName={retrieveName} onActive={retrieveActive} onCanvasID={retrieveID} onSaveToggle={() => setSaveToggle(true)}
          onRefreshToggle={() => setRefreshToggle(true)} onSaveResult={retrieveSave} user={user} onDeviceList={retrieveDeviceList} onOriginalDeviceList={retrieveOriginalDeviceList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} onFloorData={retrieveFloorData} onFloorArray={retrieveFloorArray} />
      </header>


      <div className='Canvas-State' style={{ visibility: activeCanvas ? 'visible' : 'hidden' }}>
        <div className='Canvas' style={{ transform: `scale(${zoom}) translate(${transl}%, ${transl}%)`, transformOrigin: 'top left', }} onWheel={zoomScroll} onTouchMove={zoomScroll} onTouchEnd={endTouch}>
          <FabricCanvas canvasInfo={canvasInfo} canvasData={canvasData} canvasState={canvasState} onRefreshToggle={() => setRefreshToggle(false)} onDeviceToggle={() => setDeviceToggle(false)}
            user={user} onDeviceList={retrieveDeviceList} onHandlerToggle={(toggle) => setHandlerToggle(toggle)} onFloorData={retrieveFloorData} onFloorArray={retrieveFloorArray}
            onCanvasID={retrieveID} onSaveToggle={() => setSaveToggle(false)} onSaveResult={retrieveSave} onLoadToggle={() => setLoadToggle(false)} onCanvasImageData={retrieveImageData}
          />
        </div>

        <div className="canvas-select-menu">
          <div className="view-checkbox">
            <p>Screen Dragging</p>
            <input className='checkbox' type="checkbox" checked={dragMode} onChange={(e) => setDragMode(e.target.checked)} />
          </div>
        </div>
      </div>

      {activePopup === 'draw' && (
        <DrawTool onCanvasAction={retrieveAction} drawWidth={drawWidth} onDrawWidth={retrieveDrawWidth} />
      )} {activePopup === 'sensor' && (
        <SensorTool onCanvasDevice={retrieveDevice} onDeviceToggle={() => setDeviceToggle(true)} onDeviceList={retrieveDeviceList} deviceList={deviceList} onOriginalDeviceList={retrieveOriginalDeviceList} onLabelList={retrieveLabelList} labelList={labelList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} />
      )} {activePopup === 'component' && (
        <ComponentTool onCanvasAction={retrieveAction} />
      )}

      {activePopup === 'about' && (
        <AboutPopup onClose={closePopup} />
      )} {activePopup === 'guide' && (
        <GuidePopup onClose={closePopup} />
      )}
      {activePopup === 'account' && !user && (
        <UserAuthentication onClose={closePopup} />
      )}
      {activePopup === 'account' && user && (
        <AccountPopup onClose={closePopup} onCanvasName={retrieveName} onCanvasID={retrieveID} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onActive={retrieveActive} onLoadToggle={() => setLoadToggle(true)} onRefreshToggle={() => setRefreshToggle(true)} onDeviceList={retrieveDeviceList} deviceList={deviceList} onOriginalDeviceList={retrieveOriginalDeviceList} originalDeviceList={originalDeviceList} onLabelList={retrieveLabelList} labelList={labelList} onDeviceRegistry={retrieveDeviceRegistry} onEntityRegistry={retrieveEntityRegistry} user={user} />
      )}
    </div>
  );
}

export default App;
