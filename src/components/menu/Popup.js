import '../css/Popup.css';

function Popup({ onClose, title, children}) {
  return (
    <div className="filter" onClick={onClose}>
      <div className="frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
        <button onClick={onClose}>X</button>
        </div>
        <h2>{title}</h2>
        <div className='popup-content'>{children}</div> 
      </div>
    </div>
  );
}

export default Popup;