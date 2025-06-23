import '../../css/Tools.css';
import {Sensor} from '../../../icons/index'

function SensorTool() {
  return (
    <div className="box">
        <div className='head-container'>
        <img src={Sensor} className="menu-icon" alt="logo"/><p><b>Sensors</b></p>
        </div>

        <div className='content-grid'>
            <div className='content'><button><img src={Sensor} className="menu-icon" alt="logo"/>Temperature</button></div>
            <div className='content'><button>Motion</button></div>
            <div className='content'><button>Sensor</button></div>
            <div className='content'><button>Sensor</button></div>
            <div className='content'><button>Sensor</button></div>
            <div className='content'><button>Sensor</button></div>
        </div>
    </div>
  );
}

export default SensorTool;