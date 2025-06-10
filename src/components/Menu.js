import './Menu.css';
import {Draw, Sensor, Component, Create, Save, Export, Account, Guide, About} from '../icons/index'

function Menu() {
    return (
        <div className='menu'>
            <div className='draw'>
                <button><img src={Draw} className="menu-icon" alt="logo"/><p>Draw</p></button>
                <button><img src={Sensor} className="menu-icon" alt="logo"/> Add Sensor</button>
                <button><img src={Component} className="menu-icon" alt="logo"/> Add Component</button>
            </div>

            <div className='file'>
                <button><img src={Create} className="menu-icon" alt="logo"/>Create New</button>
                <button><img src={Save} className="menu-icon" alt="logo"/> Save</button>
                <button><img src={Export} className="menu-icon" alt="logo"/> Export</button>
            </div>

            <div className='about'>
                <button><img src={Account} className="menu-icon" alt="logo"/> Account</button>
                <button><img src={Guide} className="menu-icon" alt="logo"/> How to Use</button>
                <button><img src={About} className="menu-icon" alt="logo"/> About</button>
            </div>
        </div>
    );
};

export default Menu;