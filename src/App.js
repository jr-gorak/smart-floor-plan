import {useState} from 'react';
import Menu from './components/Menu';
import './App.css';
import FabricCanvas from './components/FabricCanvas';

function App() {

  const [zoom, setZoom] = useState(1);
  const [transl, setTransl] = useState(0);

  const centerZoom = () => {
    window.scrollTo({
      top: (document.documentElement.scrollHeight - window.innerHeight) / 2,
      left: (document.documentElement.scrollWidth - window.innerWidth) / 2,
    });
  };

  const zoomScroll = (e) => {
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
  };

  window.addEventListener('wheel', function(e) {
    e.preventDefault();
  }, { passive: false });

  return (
    <div className="App">

      <header>
        <Menu />
      </header>
      
      <div className='Canvas' style={{transform: `scale(${zoom}) translate(${transl}%, ${transl}%)` , transformOrigin: 'top left'}} onWheel={zoomScroll}>
        <FabricCanvas />
      </div>

    </div>
  );
}

export default App;
