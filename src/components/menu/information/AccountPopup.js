import Popup from '../Popup';

const Account = ({ onClose }) => (
  <Popup title="Your Account" onClose={onClose}>
    <div>
    <p>Welcome to your account!</p>

    <button>Change Password</button>
    <button>Delete Account</button>

    <b>Floor plans:</b>
    <div className='floor-plan-grid'>

      <div className='floor-plan-container'>
        <img src="empty.png" alt="Image goes here"></img>
        <p>File Name Here</p>
      </div>

      <div className='floor-plan-container'>
        <img src="empty.png" alt="Image goes here"></img>
        <p>File Name Here</p>
      </div>

      <div className='floor-plan-container'>
        <img src="empty.png" alt="Image goes here"></img>
        <p>File Name Here</p>
      </div>

      <div className='floor-plan-container'>
        <img src="empty.png" alt="Image goes here"></img>
        <p>File Name Here</p>
      </div>

      <div className='floor-plan-container'>
        <img src="empty.png" alt="Image goes here"></img>
        <p>File Name Here</p>
      </div>

    </div>
    </div>
  </Popup>
  
);

export default Account;