import '../../css/Popup.css';

function About({ onClose }) {
  return (
    <div className="filter" onClick={onClose}>
      <div className="frame" onClick={e => e.stopPropagation()}>
        <div className='exit'>
        <button onClick={onClose}>X</button>
        </div>
        <h2>About This App</h2>
        <div className='popup-content'>
          <p> Welcome to the smart floor plan developer tool! This is an application developed to make
      developing floor plan based dashboards in the software <a href="https://www.home-assistant.io/" target="_blank" rel="noreferrer">Home Assistant</a> more accessible to
      non-programmers. The application allows the user to create a floorplan and integrate various
      sensors in the different rooms. These sensors can be configured and exported to the Home
      Assistant software to give real-time data feedback through the integrated sensors. </p>

      <p> Smart home development and assisted living has been a recent area of concern due to the
      growing populations found all throughout the world. Through deploying smart homes, it can
      become possible to monitor homes and routines and give real-time strategies to benefiting 
      those who require assistance </p>

      <p> This application can be utilized for the purpose of Home Assistant, or also act as a
      floor plan developer tool. The design will be simple and easy to use for quick and easy
      development.</p>

      <p> Developed as part of the CHM9360 module at Aberystwyth University </p>

      <p><b>Developer:</b>  Joseph Gorak - <a href="https://github.com/jr-gorak" target="_blank" rel="noreferrer">(Github)</a></p>
          </div> 
      </div>
    </div>
  );
}

export default About;