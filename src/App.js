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

function App() {

  const user = auth.currentUser;
  
  if (user) {
    console.log("User is in!")
  } else {
    console.log("No user is in!")
  }

  const [zoom, setZoom] = useState(1);
  const [transl, setTransl] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  const [canvasWidth, setCanvasWidth] = useState(() => sessionStorage.getItem('canvasWidth'));
  const [canvasHeight, setCanvasHeight] = useState(() => sessionStorage.getItem('canvasHeight'));
  const [canvasAction, setCanvasAction] = useState('select');
  const [canvasImage, setCanvasImage] = useState(null);

  const openPopup = (value) => setActivePopup(value);
  const closePopup = () => setActivePopup(null);

  const retrieveWidth = (width) => setCanvasWidth(width);
  const retrieveHeight = (height) => setCanvasHeight(height);
  const retrieveAction = (action) => setCanvasAction(action);
  const retrieveImage = (image) => setCanvasImage(image)

  useEffect(() => {
    sessionStorage.setItem('canvasWidth', canvasWidth)
    sessionStorage.setItem('canvasHeight', canvasHeight)
  }, [canvasWidth, canvasHeight]);

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
        <Menu onOpenPopup={openPopup} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight} onCanvasImage={retrieveImage} user={user}/>
      </header>
       
       {canvasHeight > 0 &&
      <div className='Canvas' style={{transform: `scale(${zoom}) translate(${transl}%, ${transl}%)` , transformOrigin: 'top left'}} onWheel={zoomScroll}>
        <FabricCanvas canvasWidth={canvasWidth} canvasHeight={canvasHeight} canvasAction={canvasAction} canvasImage={canvasImage}/>
      </div>
      }

      {activePopup === 'draw' && (
      <DrawTool onCanvasAction={retrieveAction} canvasAction={canvasAction}/>
      )} {activePopup === 'sensor' && (
      <SensorTool/>
      )} {activePopup === 'component' && (
      <ComponentTool/>
      )}

      {activePopup === 'about' && (
        <AboutPopup onClose={closePopup}/>
      )} {activePopup === 'guide' && (
        <GuidePopup onClose={closePopup}/>
      )} {activePopup === 'account' && (
        <AccountPopup onClose={closePopup} user={user}/>
      )}
      
    </div>
  );
}

export default App;
