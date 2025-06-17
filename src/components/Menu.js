import {useState} from 'react'
import './css/Menu.css';
import './css/Dropdown.css';
import {Draw, Sensor, Component, Create, Save, Account, Guide, About, Export} from '../icons/index'
import CreateNewBox from './menu/filemanager/CreateDropdown';
import ExportBox from './menu/filemanager/ExportDropdown';

function Menu( {onOpenPopup, onCanvasWidth, onCanvasHeight} ) {

    const [isActive, setIsActive] = useState(false);
    const [activeValue, setActiveValue] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveIndicator, setSaveIndicator] = useState(null);

    function togglePopup(value) {

        if (isActive === false) {
            onOpenPopup(value)
            setIsActive(true);
            setActiveValue(value)
        } else if (isActive === true && activeValue !== value) {
            onOpenPopup(value)
            setActiveValue(value)
        }  else if (isActive === true && activeValue === value) {
            onOpenPopup(null)
            setIsActive(false);
            setActiveValue(null)
        }  
    }

    function toggleDropdown(value) {

        if (activeDropdown === null) {
            setActiveDropdown(value)
        } else if (activeDropdown !== value) {
            setActiveDropdown(value)
        } else {
            setActiveDropdown(null)
        }
    }

    function checkSave() {
        if (saveSuccess === true) {
            setSaveIndicator('save-success')
            setTimeout(() => {
                setSaveIndicator('button-off')
            }, 500);
        } else {
            setSaveIndicator('save-failure')
            setTimeout(() => {
                setSaveIndicator('button-off')
            }, 500);
        }
    }

    return (
        <div className='menu'>
            <div className='draw'>
                <button className={activeValue === 'draw' ? 'button-on' : 'button-off'} onClick={() => togglePopup('draw')}><img src={Draw} className="menu-icon" alt="logo"/><p>Draw</p></button>
                <button className={activeValue === 'sensor' ? 'button-on' : 'button-off'} onClick={() => togglePopup('sensor')}><img src={Sensor} className="menu-icon" alt="logo"/> Add Sensor</button>
                <button className={activeValue === 'component' ? 'button-on' : 'button-off'} onClick={() => togglePopup('component')}><img src={Component} className="menu-icon" alt="logo"/> Add Component</button>
            </div>

            <div className='file'>
                <div className='dropdown'> <button className={activeDropdown === 'create' ? 'button-on' : 'button-off'} onClick={() => toggleDropdown('create')}><img src={Create} className="menu-icon" alt="logo"/>Create New</button>
                <CreateNewBox activeDropdown={activeDropdown} onActiveDropdown={(value) => setActiveDropdown(value)} onCanvasWidth={onCanvasWidth} onCanvasHeight={onCanvasHeight} />
                </div>
                <button className={saveIndicator} onClick={() => checkSave()}><img src={Save} className="menu-icon" alt="logo"/> Save</button>
                <div className='dropdown'> <button className={activeDropdown === 'export' ? 'button-on' : 'button-off'} onClick={() => toggleDropdown('export')}><img src={Export} className="menu-icon" alt="logo"/>Export</button>
                <ExportBox activeDropdown={activeDropdown} />
                </div>
            </div>

            <div className='about'>
                <button onClick={() => onOpenPopup('account')}><img src={Account} className="menu-icon" alt="logo"/> Account</button>
                <button onClick={() => onOpenPopup('guide')}><img src={Guide} className="menu-icon" alt="logo"/> How to Use</button>
                <button onClick={() => onOpenPopup('about')}><img src={About} className="menu-icon" alt="logo"/> About</button>
            </div>
        </div>
    );
};

export default Menu;