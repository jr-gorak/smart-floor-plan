import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import '../../css/Popup.css';
import UserAuthentication from '../filemanager/UserAuthentication';

function Account({ onClose, user }) {

  function userSignOut() {
    signOut(auth).then(() => {
      onClose();
      
    }).catch((error) => {
            const errorCode = error.code;
            const errorMess = error.message;
            console.log(errorCode);
            console.log(errorMess);
    });
  }

  return (
    
    <div className="filter" onClick={onClose}>
      <div className={user ? "frame" : "small-frame"} onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={onClose}>X</button>
        </div>

        {user  && (
        <div className='popup-content'> 
          <h2>Account</h2>
          <p>Welcome to your account!</p>

          <button>Change Password</button>
          <button onClick={userSignOut}>Sign Out</button>
          <button>Delete Account</button>

          <b>Floor plans:</b>
          <div className='floor-plan-grid'>

            <div className='floor-plan-container'>
              <img src="empty.png" alt="floorplan"></img>
              <p>File Name Here</p>
            </div>

            <div className='floor-plan-container'>
              <img src="empty.png" alt="floorplan"></img>
              <p>File Name Here</p>
            </div>

            <div className='floor-plan-container'>
              <img src="empty.png" alt="floorplan"></img>
              <p>File Name Here</p>
            </div>

            <div className='floor-plan-container'>
              <img src="empty.png" alt="floorplan"></img>
              <p>File Name Here</p>
            </div>

            <div className='floor-plan-container'>
              <img src="empty.png" alt="floorplan"></img>
              <p>File Name Here</p>
            </div>

          </div>
        </div>
        )};

        {!user && (
        <div>
          <UserAuthentication onClose={onClose} />
        </div>
        )};
      </div>
    </div>
  );
}

export default Account;