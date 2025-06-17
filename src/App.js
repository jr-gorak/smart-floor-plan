import {useEffect, useState} from 'react';
import Menu from './components/Menu';
import './App.css';
import FabricCanvas from './components/FabricCanvas';
import About from './components/menu/information/AboutPopup';
import Guide from './components/menu/information/GuidePopup';
import Account from './components/menu/information/AccountPopup';
import DrawPage from './components/menu/toolset/DrawTool';
import SensorPage from './components/menu/toolset/SensorTool';
import ComponentPage from './components/menu/toolset/ComponentTool';

function App() {

  const [zoom, setZoom] = useState(1);
  const [transl, setTransl] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  const [canvasWidth, setCanvasWidth] = useState(() => sessionStorage.getItem('canvasWidth'));
  const [canvasHeight, setCanvasHeight] = useState(() => sessionStorage.getItem('canvasHeight'));

  const openPopup = (value) => setActivePopup(value);
  const closePopup = () => setActivePopup(null)

  const retrieveWidth = (width) => setCanvasWidth(width)
  const retrieveHeight = (height) => setCanvasHeight(height)

  useEffect(() => {
    sessionStorage.setItem('canvasWidth', canvasWidth)
    sessionStorage.setItem('canvasHeight', canvasHeight)
  }, [canvasWidth, canvasHeight])

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
        <Menu onOpenPopup={openPopup} onCanvasWidth={retrieveWidth} onCanvasHeight={retrieveHeight}/>
      </header>
       
       {canvasHeight > 0 &&
      <div className='Canvas' style={{transform: `scale(${zoom}) translate(${transl}%, ${transl}%)` , transformOrigin: 'top left'}} onWheel={zoomScroll}>
        <FabricCanvas canvasWidth={canvasWidth} canvasHeight={canvasHeight}/>
      </div>
      }

      {activePopup === 'draw' && (
      <DrawPage/>
      )} {activePopup === 'sensor' && (
      <SensorPage/>
      )} {activePopup === 'component' && (
      <ComponentPage/>
      )}

      {activePopup === 'about' && (
        <About onClose={closePopup}/>
      )} {activePopup === 'guide' && (
        <Guide onClose={closePopup}/>
      )} {activePopup === 'account' && (
        <Account onClose={closePopup}/>
      )}

    </div>
  );
}

export default App;
