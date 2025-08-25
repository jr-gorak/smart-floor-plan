import '../../css/Tools.css';
import { Bathtub, Bed, Chair, Component, KitchenSink, RoundSink, Sofa, Stairs, Stove, ThreeSofa, Toilet, WindowClosed } from '../../../icons/index'

export function toggleAction(value, onCanvasAction) {
  onCanvasAction(value)
  setTimeout(() => {
    onCanvasAction('select');
  }, 20);
}

function ComponentTool({ onCanvasAction }) {

  return (
    <div className="box">
      <div className='head-container'>
        <img src={Component} className="menu-icon" alt="logo" /><p><b>Components</b></p>
      </div>

      <div className='content-grid'>
        <div className='content'><button onClick={() => toggleAction('doorway', onCanvasAction)}><img src={Component} className="menu-icon" alt="logo" />Doorway</button></div>
        <div className='content'><button onClick={() => toggleAction('window', onCanvasAction)}><img src={WindowClosed} className="menu-icon" alt="logo" />Window</button></div>
        <div className='content'><button onClick={() => toggleAction('stairs', onCanvasAction)}><img src={Stairs} className="menu-icon" alt="logo" />Stairs</button></div>
        <p><b>Bedroom</b></p>
        <div className='content'><button onClick={() => toggleAction('bed', onCanvasAction)}><img src={Bed} className="menu-icon" alt="logo" />Bed</button></div>
        <p><b>Seating</b></p>
        <div className='content'><button onClick={() => toggleAction('chair', onCanvasAction)}><img src={Chair} className="menu-icon" alt="logo" />Chair</button></div>
        <div className='content'><button onClick={() => toggleAction('sofa', onCanvasAction)}><img src={Sofa} className="menu-icon" alt="logo" />Two-Seat Sofa</button></div>
        <div className='content'><button onClick={() => toggleAction('three-sofa', onCanvasAction)}><img src={ThreeSofa} className="menu-icon" alt="logo" />Three-Seat Sofa</button></div>
        <p><b>Kitchen</b></p>
        <div className='content'><button onClick={() => toggleAction('stove', onCanvasAction)}><img src={Stove} className="menu-icon" alt="logo" />Stove</button></div>
        <div className='content'><button onClick={() => toggleAction('kitchen-sink', onCanvasAction)}><img src={KitchenSink} className="menu-icon" alt="logo" />Kitchen Sink</button></div>
        <p><b>Bathroom</b></p>
        <div className='content'><button onClick={() => toggleAction('bathtub', onCanvasAction)}><img src={Bathtub} className="menu-icon" alt="logo" />Bathtub</button></div>
        <div className='content'><button onClick={() => toggleAction('round-sink', onCanvasAction)}><img src={RoundSink} className="menu-icon" alt="logo" />Round Sink</button></div>
        <div className='content'><button onClick={() => toggleAction('toilet', onCanvasAction)}><img src={Toilet} className="menu-icon" alt="logo" />Toilet</button></div>
      </div>
    </div>
  );
}

export default ComponentTool;