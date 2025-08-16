import '../../css/Tools.css';
import { useState } from 'react';
import { CircleOutline, Draw, DrawLine, Map, Square } from '../../../icons/index'

function DrawTool({ onCanvasAction, drawWidth, onDrawWidth }) {

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
        } else if (isActive === true && activeValue === value) {
            onCanvasAction('select')
            setIsActive(false);
            setActiveValue(null)
        }
    };

    return (
        <div className="box">
            <div className='head-container'>
                <img src={Draw} className="menu-icon" alt="logo" /><p><b>Draw</b></p>
            </div>

            <div className='content-grid'>
                <div className='content'><button className={activeValue === 'line' ? 'button-on' : 'button-off'} onClick={() => toggleAction('line')}><img src={DrawLine} className="menu-icon" alt="logo" />Line</button></div>
                <div className='content'><button className={activeValue === 'square' ? 'button-on' : 'button-off'} onClick={() => toggleAction('square')}><img src={Square} className="menu-icon" alt="logo" />Square</button></div>
                <div className='content'><button className={activeValue === 'circle' ? 'button-on' : 'button-off'} onClick={() => toggleAction('circle')}><img src={CircleOutline} className="menu-icon" alt="logo" />Circle</button></div>
                <div className='content'><button className={activeValue === 'mark' ? 'button-on' : 'button-off'} onClick={() => toggleAction('mark')}><img src={Map} className="menu-icon" alt="logo" />Mark Room</button></div>
                <div className='slider'>
                    Stroke Width
                    <input type="range" defaultValue={drawWidth} onChange={(e) => onDrawWidth(e.target.value)} min="1" max="5" list='data' />
                </div>
                <datalist id="data">
                    <option value="1" label='1'></option>
                    <option value="2" label='2'></option>
                    <option value="3" label='3'></option>
                    <option value="4" label='4'></option>
                    <option value="5" label='5'></option>
                </datalist>
            </div>
        </div>
    );
}

export default DrawTool;