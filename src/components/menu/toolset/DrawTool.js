import '../../css/Tools.css';
import {Draw, DrawLine, Square} from '../../../icons/index'

function DrawPage() {
  return (
    <div className="box">
        <div className='head-container'>
        <img src={Draw} className="menu-icon" alt="logo"/><p><b>Draw</b></p>
        </div>

        <div className='content-grid'>
            <div className='content'><button><img src={DrawLine} className="menu-icon" alt="logo"/>Line</button></div>
            <div className='content'><button><img src={Square} className="menu-icon" alt="logo"/>Square</button></div>
        </div>
    </div>
  );
}

export default DrawPage;