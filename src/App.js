import {useState} from 'react';
import Menu from './components/Menu';
import './App.css';
import FabricCanvas from './components/FabricCanvas';

function App() {

  const [zoom, setZoom] = useState(1);

  const zoomScroll = (e) => {
    if (e.deltaY < 0) {
        setZoom(Math.min(zoom + 0.1, 3));
      } else {
        setZoom(Math.max(zoom - 0.1, 0.5));
      }
    };

  return (
    <div className="App">

      <header>
        <Menu />
      </header>

      <div className='Canvas' style={{transform: `scale(${zoom})`, transformOrigin: 'center'}} onWheel={zoomScroll}>
        <FabricCanvas />
      </div>

    </div>
  );
}

export default App;
