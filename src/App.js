import {useEffect, useState} from 'react';
import {auth} from './firebase';
import Menu from './components/Menu';
import './App.css';
import FabricCanvas from './components/FabricCanvas';
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
  const [activePopup, setActivePopup] = useState(null);

  const [canvasWidth, setCanvasWidth] = useState(() => sessionStorage.getItem('canvasWidth'));
  const [canvasHeight, setCanvasHeight] = useState(() => sessionStorage.getItem('canvasHeight'));
  const [canvasName, setCanvasName] = useState(() => sessionStorage.getItem('canvasName'));
  const [canvasID, setCanvasID] = useState(() => sessionStorage.getItem('canvasID'));
  const [activeCanvas, setActiveCanvas] = useState(() => sessionStorage.getItem('activeCanvas'));
  const [deviceList, setDeviceList] =  useState(() => JSON.parse(sessionStorage.getItem('sensors')));
  const [originalDeviceList, setOriginalDeviceList] = useState(() => JSON.parse(sessionStorage.getItem('original-sensors')));

  const [canvasAction, setCanvasAction] = useState('select');
  const [canvasImage, setCanvasImage] = useState(null);
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
  const retrieveImage = (image) => setCanvasImage(image);
  const retrieveName = (name) => setCanvasName(name);
  const retrieveID = (id) => setCanvasID(id);
  const retrieveActive = (active) => setActiveCanvas(active);
  const retrieveSave = (save) => setSaveResult(save);
  const retrieveDevice = (device) => setCanvasDevice(device);
  const retrieveDeviceList = (list) => setDeviceList(list);
  const retrieveDrawWidth = (pixel) => setDrawWidth(pixel);

  useEffect(() => {
    sessionStorage.setItem('canvasWidth', canvasWidth)
    sessionStorage.setItem('canvasHeight', canvasHeight)
    sessionStorage.setItem('canvasName', canvasName)
    sessionStorage.setItem('canvasID', canvasID)
    sessionStorage.setItem('activeCanvas', activeCanvas)
    sessionStorage.setItem('sensors', JSON.stringify(deviceList))
    sessionStorage.setItem('original-sensors', JSON.stringify(originalDeviceList))
  }, [canvasWidth, canvasHeight, canvasName, canvasID, activeCanvas, refreshToggle, deviceList, canvasDevice, originalDeviceList, drawWidth]);

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

    window.addEventListener('wheel', preventScroll, { passive: false });

      if (e.deltaY < 0) {
          setZoom(Math.min(zoom + 0.05, 1.5))
          if (zoom < 1) {
          setTransl(Math.max(transl - 5, 0))
          }
        } else {
          setZoom(Math.max(zoom - 0.05, 0.5))
          if (zoom < 1) {
          setTransl(Math.min(transl + 5, 50))
          }
        }

        if (zoom !== setZoom) {
          centerZoom();
        }

        setTimeout(() => {
          window.removeEventListener('wheel', preventScroll);
        }, 1000);
  };

  return (
    <div className="App">

      <header>
        <Menu onOpenPopup={openPopup} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onCanvasImage={retrieveImage} onCanvasName={retrieveName} onActive={retrieveActive} onCanvasID={retrieveID} onSaveToggle={() => setSaveToggle(true)} 
        onRefreshToggle={() => setRefreshToggle(true)} onSaveResult={retrieveSave} saveResult={saveResult} user={user} />
      </header>
       
       <div className='Canvas-State' style={{visibility: activeCanvas? 'visible' : 'hidden'}}>
        <div className='Canvas' style={{transform: `scale(${zoom}) translate(${transl}%, ${transl}%)` , transformOrigin: 'top left'}} onWheel={zoomScroll}>
          <FabricCanvas canvasWidth={canvasWidth} canvasHeight={canvasHeight} canvasAction={canvasAction} canvasImage={canvasImage} canvasName={canvasName} canvasID={canvasID}
          onCanvasID={retrieveID} activeCanvas={activeCanvas} saveToggle={saveToggle} onSaveToggle={() => setSaveToggle(false)} onSaveResult={retrieveSave} loadToggle={loadToggle} onLoadToggle={() => setLoadToggle(false)} 
          refreshToggle={refreshToggle} onRefreshToggle={()=> setRefreshToggle(false)} canvasDevice={canvasDevice} deviceToggle={deviceToggle} onDeviceToggle={() => setDeviceToggle(false)} user={user} 
          deviceList={deviceList} onDeviceList={retrieveDeviceList} originalDeviceList={originalDeviceList} onHandlerToggle={(toggle) => setHandlerToggle(toggle)} drawWidth={drawWidth}/>
        </div>
      </div>

      {activePopup === 'draw' && (
      <DrawTool onCanvasAction={retrieveAction} drawWidth={drawWidth} onDrawWidth={retrieveDrawWidth} />
      )} {activePopup === 'sensor' && (
      <SensorTool onCanvasDevice={retrieveDevice} onDeviceToggle={() => setDeviceToggle(true)} onDeviceList={retrieveDeviceList} deviceList={deviceList} onOriginalDeviceList={(list) => setOriginalDeviceList(list)} activeCanvas={activeCanvas}/>
      )} {activePopup === 'component' && (
      <ComponentTool onCanvasAction={retrieveAction}/>
      )}

      {activePopup === 'about' && (
        <AboutPopup onClose={closePopup}/>
      )} {activePopup === 'guide' && (
        <GuidePopup onClose={closePopup}/>
      )}
      {activePopup === 'account' && !user && (
        <UserAuthentication onClose={closePopup} />
      )}
       {activePopup === 'account' && user  && (
        <AccountPopup onClose={closePopup} onCanvasName={retrieveName} onCanvasID={retrieveID} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onActive={retrieveActive} onLoadToggle={() => setLoadToggle(true)}  onRefreshToggle={()=> setRefreshToggle(true)} onDeviceList={retrieveDeviceList} deviceList={deviceList} onOriginalDeviceList={(list) => setOriginalDeviceList(list)} originalDeviceList={originalDeviceList} user={user}/>
      )}
      
    </div>
    
  );
}

export default App;
