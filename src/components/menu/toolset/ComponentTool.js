import '../../css/Tools.css';
import {Bathtub, Bed, Chair, Component, KitchenSink, RoundSink, Sofa, Stairs, Stove, ThreeSofa, Toilet, WindowClosed} from '../../../icons/index'

function ComponentTool({onCanvasAction}) {

  function toggleAction(value) {
    onCanvasAction(value)
    setTimeout(() => {
      onCanvasAction('select');
        }, 20);
    }
  
  return (
    <div className="box">
        <div className='head-container'>
          <img src={Component} className="menu-icon" alt="logo"/><p><b>Components</b></p>
        </div>

        <div className='content-grid'>
            <div className='content'><button onClick={() => toggleAction('doorway')}><img src={Component} className="menu-icon" alt="logo"/>Doorway</button></div>
            <div className='content'><button onClick={() => toggleAction('window')}><img src={WindowClosed} className="menu-icon" alt="logo"/>Window</button></div>
            <div className='content'><button onClick={() => toggleAction('stairs')}><img src={Stairs} className="menu-icon" alt="logo"/>Stairs</button></div>
            <div className='content'><button onClick={() => toggleAction('bed')}><img src={Bed} className="menu-icon" alt="logo"/>Bed</button></div>
            <div className='content'><button onClick={() => toggleAction('chair')}><img src={Chair} className="menu-icon" alt="logo"/>Chair</button></div>
            <div className='content'><button onClick={() => toggleAction('sofa')}><img src={Sofa} className="menu-icon" alt="logo"/>Two-Seat Sofa</button></div>
            <div className='content'><button onClick={() => toggleAction('three-sofa')}><img src={ThreeSofa} className="menu-icon" alt="logo"/>Three-Seat Sofa</button></div>
            <div className='content'><button onClick={() => toggleAction('stove')}><img src={Stove} className="menu-icon" alt="logo"/>Stove</button></div>
            <div className='content'><button onClick={() => toggleAction('kitchen-sink')}><img src={KitchenSink} className="menu-icon" alt="logo"/>Kitchen Sink</button></div>
            <div className='content'><button onClick={() => toggleAction('bathtub')}><img src={Bathtub} className="menu-icon" alt="logo"/>Bathtub</button></div>
            <div className='content'><button onClick={() => toggleAction('round-sink')}><img src={RoundSink} className="menu-icon" alt="logo"/>Round Sink</button></div>
            <div className='content'><button onClick={() => toggleAction('toilet')}><img src={Toilet} className="menu-icon" alt="logo"/>Toilet</button></div>
        </div>
    </div>
  );
}

export default ComponentTool;