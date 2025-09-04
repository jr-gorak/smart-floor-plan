import { useState, useEffect } from 'react'
import './css/Menu.css';
import './css/Dropdown.css';
import { Draw, Sensor, Component, Create, Save, Account, Guide, About, Export } from '../icons/index'
import CreateDropdown from './menu/filemanager/CreateDropdown';
import ExportDropdown from './menu/filemanager/ExportDropdown';

export function toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction) {
    if (isActive === false) {
        onOpenPopup(value)
        setIsActive(true);
        setActiveValue(value)
        onCanvasAction('select');
    } else if (isActive === true && activeValue !== value) {
        onOpenPopup(value)
        setActiveValue(value)
        onCanvasAction('select');
    } else if (isActive === true && activeValue === value) {
        onOpenPopup(null)
        setIsActive(false);
        setActiveValue(null)
        onCanvasAction('select');
    }
}

export function toggleDropdown(value, activeDropdown, setActiveDropdown) {
    if (activeDropdown === null) {
        setActiveDropdown(value)
    } else if (activeDropdown !== value) {
        setActiveDropdown(value)
    } else {
        setActiveDropdown(null)
    }
};

export function checkSave(user, onOpenPopup, onSaveToggle) {
    if (!user) {
        onOpenPopup('account')
    } else {
        onSaveToggle();
    }
}

export function checkSaveIndicator(saveResult, setSaveIndicator, onSaveResult) {
    if (saveResult === 'success') {
        setSaveIndicator('save-success')
        setTimeout(() => {
            setSaveIndicator('button-off')
            onSaveResult(null);
        }, 500);

    } else if (saveResult === 'failure') {
        setSaveIndicator('save-failure')
        setTimeout(() => {
            setSaveIndicator('button-off')
            onSaveResult(null);
        }, 500);
    }
}

function Menu({ canvasData, canvasState, canvasInfo, onOpenPopup, onCanvasAction, onCanvasWidth, onCanvasHeight, onCanvasImageData, onCanvasName, onActive, onCanvasID, onSaveToggle, onRefreshToggle, onSaveResult, user, onDeviceList, onOriginalDeviceList, onDeviceRegistry, onEntityRegistry, onFloorData, onFloorArray }) {

    const { saveResult, activeCanvas } = canvasState;
    const [isActive, setIsActive] = useState(false);
    const [activeValue, setActiveValue] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [saveIndicator, setSaveIndicator] = useState(null);

    useEffect(() => {

        checkSaveIndicator(saveResult, setSaveIndicator, onSaveResult);

    }, [saveResult, saveIndicator, onSaveResult]);

    return (
        <div className='menu'>
            <div className='draw'>
                <button className={activeValue === 'draw' ? 'button-on' : 'button-off'} onClick={() => toggleMenu('draw', isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)} disabled={!activeCanvas} ><img src={Draw} className="menu-icon" alt="logo" /><p>Draw</p></button>
                <button className={activeValue === 'sensor' ? 'button-on' : 'button-off'} onClick={() => toggleMenu('sensor', isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)} disabled={!activeCanvas} ><img src={Sensor} className="menu-icon" alt="logo" /> Add Sensor</button>
                <button className={activeValue === 'component' ? 'button-on' : 'button-off'} onClick={() => toggleMenu('component', isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)} disabled={!activeCanvas} ><img src={Component} className="menu-icon" alt="logo" /> Add Component</button>
            </div>

            <div className='file'>
                <div className='dropdown'> <button className={activeDropdown === 'create' ? 'button-on' : 'button-off'} onClick={() => toggleDropdown('create', activeDropdown, setActiveDropdown)}><img src={Create} className="menu-icon" alt="logo" />Create New</button>
                    <CreateDropdown activeDropdown={activeDropdown} onActiveDropdown={(value) => setActiveDropdown(value)} onCanvasWidth={onCanvasWidth} onCanvasHeight={onCanvasHeight} onCanvasImageData={onCanvasImageData} onCanvasName={onCanvasName} onCanvasID={onCanvasID} onActive={onActive} onRefreshToggle={onRefreshToggle}
                        onDeviceList={onDeviceList} onOriginalDeviceList={onOriginalDeviceList} onDeviceRegistry={onDeviceRegistry} onEntityRegistry={onEntityRegistry} onFloorData={onFloorData} onFloorArray={onFloorArray} />
                </div>
                <button className={saveIndicator} disabled={!activeCanvas} onClick={() => checkSave(user, onOpenPopup, onSaveToggle)}><img src={Save} className="menu-icon" alt="logo" /> Save</button>
                <div className='dropdown'> <button className={activeDropdown === 'export' ? 'button-on' : 'button-off'} disabled={!activeCanvas} onClick={() => toggleDropdown('export', activeDropdown, setActiveDropdown)}><img src={Export} className="menu-icon" alt="logo" />Export</button>
                    <ExportDropdown activeDropdown={activeDropdown} canvasData={canvasData} canvasState={canvasState} canvasInfo={canvasInfo} />
                </div>
            </div>

            <div className='about'>
                <button onClick={() => onOpenPopup('account')}><img src={Account} className="menu-icon" alt="logo" /> Account</button>
                <button onClick={() => onOpenPopup('guide')}><img src={Guide} className="menu-icon" alt="logo" /> How to Use</button>
                <button onClick={() => onOpenPopup('about')}><img src={About} className="menu-icon" alt="logo" /> About</button>
            </div>
        </div>
    );
};

export default Menu;