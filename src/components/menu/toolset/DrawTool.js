import '../../css/Tools.css';
import { useState } from 'react';
import {Draw, DrawLine, Square} from '../../../icons/index'

function DrawTool({onCanvasAction, canvasAction}) {

    const [isActive, setIsActive] = useState(false);
    const [activeValue, setActiveValue] = useState(null);

    function toggleAction(value) {

        if (isActive === false) {
            onCanvasAction(value)
            setIsActive(true);
            setActiveValue(value)
        } else if (isActive === true && activeValue !== value) {
            onCanvasAction(value)
            setActiveValue(value)
        }  else if (isActive === true && activeValue === value) {
            onCanvasAction('select')
            setIsActive(false);
            setActiveValue(null)
        }  
    }

  return (
    <div className="box">
        <div className='head-container'>
            <img src={Draw} className="menu-icon" alt="logo"/><p><b>Draw</b></p>
        </div>

        <div className='content-grid'>
            <div className='content'><button className={activeValue === 'line' ? 'button-on' : 'button-off'} onClick={() => toggleAction('line')}><img src={DrawLine} className="menu-icon" alt="logo"/>Line</button></div>
            <div className='content'><button className={activeValue === 'square' ? 'button-on' : 'button-off'} onClick={() => toggleAction('square')}><img src={Square} className="menu-icon" alt="logo"/>Square</button></div>
        </div>
    </div>
  );
}

export default DrawTool;