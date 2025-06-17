import '../../css/Tools.css';
import {Component, DoorClose, Upstairs, Downstairs, WindowClosed} from '../../../icons/index'

function ComponentPage() {
  return (
    <div className="box">
        <div className='head-container'>
        <img src={Component} className="menu-icon" alt="logo"/><p><b>Components</b></p>
        </div>

        <div className='content-grid'>
            <div className='content'><button><img src={DoorClose} className="menu-icon" alt="logo"/>Door</button></div>
            <div className='content'><button><img src={WindowClosed} className="menu-icon" alt="logo"/>Window</button></div>
            <div className='content'><button><img src={Upstairs} className="menu-icon" alt="logo"/>Upstairs</button></div>
            <div className='content'><button><img src={Downstairs} className="menu-icon" alt="logo"/>Downstairs</button></div>
            <div className='content'><button>Bed</button></div>
            <div className='content'><button>Table</button></div>
            <div className='content'><button>Component</button></div>
        </div>
    </div>
  );
}

export default ComponentPage;