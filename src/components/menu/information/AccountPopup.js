import { auth, db } from '../../../firebase';
import { signOut, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import '../../css/Popup.css';
import { collection, query, where, getDoc, getDocs, doc, deleteDoc, addDoc, or, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Delete, Copy, Share, Settings } from '../../../icons';

export function togglePopup(value, setStatesObject, setErrorMessage, name, id, data, width, height, floorArray, list, dev, originalDev, label, devRegistry, entRegistry) {
  if (value === 'copy') {
    setStatesObject.setNewName(`${name} copy`);
  }
  if (value === 'delete-account') {
    setStatesObject.setActiveValue(value);
    return;
  }
  if (value === null) {
    setErrorMessage(null);
  }

  setStatesObject.setActiveName(name ? name : null);
  setStatesObject.setActiveValue(value ? value : null);
  setStatesObject.setActiveID(id ? id : null);
  setStatesObject.setActiveData(data ? data : null);
  setStatesObject.setActiveWidth(width ? width : null);
  setStatesObject.setActiveHeight(height ? height : null);
  setStatesObject.setActiveFloorArray(floorArray ? floorArray : null);
  setStatesObject.setSharedList(list ? list : null);
  setStatesObject.setActiveDevice(dev ? dev : null);
  setStatesObject.setActiveOriginalDevice(originalDev ? originalDev : null);
  setStatesObject.setActiveLabel(label ? label : null);
  setStatesObject.setActiveDeviceRegistry(devRegistry ? devRegistry : null);
  setStatesObject.setActiveEntityRegistry(entRegistry ? entRegistry : null);
}

export async function deleteCanvas(activeID, togglePopup, onCanvasName, onCanvasID, onActive, onRefreshToggle, setErrorMessage, setStatesObject) {
  try {
    await deleteDoc(doc(db, "canvases", activeID))
    togglePopup(null, setStatesObject, setErrorMessage);
    onCanvasName(null);
    onCanvasID(null);
    onActive(false);
    onRefreshToggle();
  } catch (error) {
    setErrorMessage(error.message)
  }
};

export async function duplicateCanvas(e, activeName, newName, user, activeData, activeWidth, activeHeight, activeFloorArray, activeDevice,
  activeOriginalDevice, activeLabel, activeDeviceRegistry, activeEntityRegistry, togglePopup, setStatesObject, setErrorMessage) {
  e.preventDefault();
  if (activeName !== newName) {
    try {
      await addDoc(collection(db, "canvases"), {
        owner: user.uid,
        canvasName: newName,
        floorplanData: activeData,
        width: activeWidth,
        height: activeHeight,
        floorArray: activeFloorArray,
        devices: activeDevice,
        originalDevices: activeOriginalDevice,
        labelList: activeLabel,
        deviceRegistry: activeDeviceRegistry,
        entityRegistry: activeEntityRegistry,
        shared: [],
        created: new Date(),
        updated: new Date()
      });
      togglePopup(null, setStatesObject, setErrorMessage);
    } catch (error) {
      setErrorMessage(error.message)
    }
  } else {
    setErrorMessage("The name must be different from the original!")
  }
};

export async function retrieveFiles(q, setFiles, setLoading) {
  try {
    const querySnapshot = await getDocs(q);

    const canvases = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setFiles(canvases)
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
}

export async function GenerateEmailList(sharedList, setEmailList) {
  const emailArray = [];
  for (const userid of sharedList) {
    const docRef = await getDoc(doc(db, "users", userid))
    const retrievedEmail = docRef.data().email;
    emailArray.push(retrievedEmail);
  }
  setEmailList(emailArray);
}

export async function changeName(e, activeName, newName, activeID, togglePopup, setStatesObject, setErrorMessage) {
  e.preventDefault();
  if (activeName !== newName) {
    try {
      await updateDoc(doc(db, "canvases", activeID), {
        canvasName: newName,
        updated: new Date()
      });
      togglePopup(null, setStatesObject, setErrorMessage);
    } catch (error) {
      setErrorMessage(error.message)
    }
  } else {
    setErrorMessage("The name must be different from the original!")
  }
};

export async function removeSharedUser(user, setEmailList, emailList, activeID, setErrorMessage) {
  const retrieveUserID = query(
    collection(db, "users"),
    where('email', '==', user),
  );

  try {
    const idSnapshot = await getDocs(retrieveUserID);
    const idResult = idSnapshot.docs[0].data().id;
    const emailResult = idSnapshot.docs[0].data().email;
    await updateDoc(doc(db, "canvases", activeID), {
      shared: arrayRemove(idResult)
    });

    setEmailList(emailList.filter(email => email !== emailResult))

  } catch (error) {
    setErrorMessage(error.message)
  }
}

export async function shareCanvas(e, shareRequest, setErrorMessage, activeID, setEmailList, emailList) {
  e.preventDefault();

  const retrieveUserID = query(
    collection(db, "users"),
    where('email', '==', shareRequest),
  );

  try {
    const idSnapshot = await getDocs(retrieveUserID);
    if (idSnapshot.empty) {
      setErrorMessage("This email is not associated with an account")
      return null;
    }
    const idResult = idSnapshot.docs[0].data().id;
    const emailResult = idSnapshot.docs[0].data().email;
    await updateDoc(doc(db, "canvases", activeID), {
      shared: arrayUnion(idResult)
    });

    setEmailList([...emailList, emailResult])

  } catch (error) {
    setErrorMessage(error.message)
    console.log(error);
  }
};

export function loadCanvas(canvasID, canvasName, width, height, devices, originalDevices, labels, coreDevice, coreEntity, onCanvasID,
  onCanvasName, onCanvasWidth, onCanvasHeight, onDeviceList, onOriginalDeviceList, onLabelList, onDeviceRegistry, onEntityRegistry, onActive, onLoadToggle, onClose
) {
  onCanvasID(canvasID);
  onCanvasName(canvasName);
  onCanvasWidth(width);
  onCanvasHeight(height);
  onDeviceList(devices);
  onOriginalDeviceList(originalDevices);
  onLabelList(labels);
  onDeviceRegistry(JSON.parse(coreDevice));
  onEntityRegistry(JSON.parse(coreEntity));
  onActive(true);
  onLoadToggle();
  onClose();
}

export async function userSignOut(onActive, onClose, setErrorMessage) {
  await signOut(auth).then(() => {
    onActive(false);
    onClose();
  }).catch((error) => {
    setErrorMessage(error.message);
  });
}

export async function deleteAccount(user, q, onActive, onRefreshToggle, togglePopup, onClose, setStatesObject, setErrorMessage) {
  try {
    const userid = user.uid;
    const querySnapshot = await getDocs(q);

    await deleteDoc(doc(db, "users", userid))

    querySnapshot.docs.forEach(async (document) => {
      if (document.data().owner === userid) {
        await deleteDoc(doc(db, "canvases", document.id))
      } else if (document.data().shared.includes(userid)) {
        await updateDoc(doc(db, "canvases", document.id), {
          shared: arrayRemove(userid)
        });
      }
    });

    await deleteUser(user)

    onActive(false);
    onRefreshToggle();
    togglePopup(null, setStatesObject, setErrorMessage);
    onClose();

  } catch (error) {
    setErrorMessage(error.message);
  }
}

export async function resetPassword(email, setMessage, setErrorMessage) {
  setMessage("");
  setErrorMessage("");

  await sendPasswordResetEmail(auth, email).then(() => {
    setMessage("An email has been sent to reset your password. It may take a few minutes, and be sure to check your junk email if you have not received it.")
  }).catch((error) => {
    setErrorMessage(error.message);
  })
}

function Account({ onClose, onCanvasName, onCanvasID, onCanvasWidth, onCanvasHeight, onActive, onLoadToggle, onRefreshToggle, onDeviceList, onOriginalDeviceList, onLabelList, onDeviceRegistry, onEntityRegistry, user }) {

  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeValue, setActiveValue] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [activeID, setActiveID] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const [activeWidth, setActiveWidth] = useState(null);
  const [activeHeight, setActiveHeight] = useState(null);
  const [activeFloorArray, setActiveFloorArray] = useState(null);
  const [sharedList, setSharedList] = useState(null);
  const [activeDevice, setActiveDevice] = useState(null);
  const [activeOriginalDevice, setActiveOriginalDevice] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);
  const [activeDeviceRegistry, setActiveDeviceRegistry] = useState(null);
  const [activeEntityRegistry, setActiveEntityRegistry] = useState(null);
  const [emailList, setEmailList] = useState([]);
  const [newName, setNewName] = useState(null);
  const [shareRequest, setShareRequest] = useState("");
  const [tabMode, setTabMode] = useState('floorplan')
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const setStatesObject = {
    setNewName, setActiveName, setActiveValue, setActiveID, setActiveData, setActiveWidth, setActiveHeight, setActiveFloorArray, setSharedList,
    setActiveDevice, setActiveOriginalDevice, setActiveLabel, setActiveDeviceRegistry, setActiveEntityRegistry
  }

  const q = query(
    collection(db, "canvases"),
    or(
      where('owner', '==', user.uid),
      where('shared', 'array-contains', user.uid),
    )
  );

  useEffect(() => {
    retrieveFiles(q, setFiles, setLoading)
  }, [q]);

  useEffect(() => {

    if (sharedList === undefined || sharedList === null || sharedList === "") {
      return;
    };
    GenerateEmailList(sharedList, setEmailList)
  }, [sharedList]);

  if (loading) return;

  return (
    <div className="filter" onClick={onClose}>
      <div className={user ? "frame" : "small-frame"} onClick={e => e.stopPropagation()}>
        <div className='exit'>
          <button onClick={onClose}>X</button>
        </div>

        {user && (
          <div className='popup-content'>
            <h2>Account</h2>
            <p>Welcome to your account!</p>

            <button onClick={() => resetPassword(user.email, setMessage, setErrorMessage)}>Change Password</button>
            <button onClick={() => userSignOut(onActive, onClose, setErrorMessage)}>Sign Out</button>
            {message && (
              <p style={{ color: 'green' }}>{message}</p>
            )}
            {errorMessage && (
              <p style={{ color: 'red' }}>{errorMessage}</p>
            )}

            <div className='tabs'>
              <button className={tabMode === 'floorplan' ? 'button-on' : 'button-off'} onClick={() => setTabMode('floorplan')}><b>Floor Plans</b></button>
              <button className={tabMode === 'shared' ? 'button-on' : 'button-off'} onClick={() => setTabMode('shared')}><b>Shared With Me</b></button>
            </div>
            {tabMode === 'floorplan' && (
              <ul className='floor-plan-grid'>
                {files.filter(file => file.owner === user.uid).map((file) => (
                  <li key={file.id} onClick={() => loadCanvas(file.id, file.canvasName, file.width, file.height, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry, onCanvasID,
                    onCanvasName, onCanvasWidth, onCanvasHeight, onDeviceList, onOriginalDeviceList, onLabelList, onDeviceRegistry, onEntityRegistry, onActive, onLoadToggle, onClose)}>
                    <div className='upper-bar' onClick={e => e.stopPropagation()}>
                      <img className="round-icon" onClick={() => togglePopup('copy', setStatesObject, setErrorMessage, file.canvasName, file.id, file.floorplanData, file.width, file.height, file.floorArray, file.shared, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)} src={Copy} alt='Copy Button' />
                      <img className="round-icon" onClick={() => togglePopup('share', setStatesObject, setErrorMessage, file.canvasName, file.id, file.floorplanData, file.width, file.height, file.floorArray, file.shared, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)} src={Share} alt='Share Button' />
                      <img className="round-icon" onClick={() => togglePopup('delete', setStatesObject, setErrorMessage, file.canvasName, file.id, file.floorplanData, file.width, file.height, file.floorArray, file.shared, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)} src={Delete} alt='Delete Button' />
                      <img className="round-icon" onClick={() => togglePopup('settings', setStatesObject, setErrorMessage, file.canvasName, file.id, file.floorplanData, file.width, file.height, file.floorArray, file.shared, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)} src={Settings} alt='Settings Button' />
                    </div>
                    <p>{file.canvasName}</p>
                  </li>
                ))}
              </ul>
            )}
            {tabMode === 'shared' && (
              <ul className='floor-plan-grid'>
                {files.filter(file => file.owner !== user.uid).map((file) => (
                  <li key={file.id} onClick={() => loadCanvas(file.id, file.canvasName, file.width, file.height, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry, onCanvasID,
                    onCanvasName, onCanvasWidth, onCanvasHeight, onDeviceList, onOriginalDeviceList, onLabelList, onDeviceRegistry, onEntityRegistry, onActive, onLoadToggle, onClose)}>
                    <p>{file.canvasName}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => togglePopup('delete-account', setStatesObject, setErrorMessage)}>Delete Account</button>
          </div>
        )}

        {activeValue === 'delete' && (
          <div className="filter" onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>X</button>
              </div>

              <h2>Would you like to delete "<i>{activeName}</i>"?</h2>
              <div className='popup-content'>
                <button onClick={() => deleteCanvas(activeID, togglePopup, onCanvasName, onCanvasID, onActive, onRefreshToggle, setErrorMessage, setStatesObject)}>Yes</button>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>No</button>
                {errorMessage && (
                  <p style={{ color: 'red' }}>{errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeValue === 'copy' && (
          <div className="filter" onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>X</button>
              </div>

              <h2>Copy</h2>
              <div className='popup-content'>
                <form onSubmit={(e) => duplicateCanvas(e, activeName, newName, user, activeData, activeWidth, activeHeight, activeFloorArray, activeDevice,
                  activeOriginalDevice, activeLabel, activeDeviceRegistry, activeEntityRegistry, togglePopup, setStatesObject, setErrorMessage)}>
                  <input type='text' value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='canvas name' />
                  {errorMessage && (
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                  )}
                  <button type='submit'>Create Copy</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'share' && (
          <div className="filter" onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>X</button>
              </div>

              <h2>Share "<i>{activeName}</i>" With a User</h2>
              <div className='popup-content'>
                Please enter the email of the person you wish to share with.
                <form onSubmit={(e) => shareCanvas(e, shareRequest, setErrorMessage, activeID, setEmailList, emailList)}>
                  <input type='text' value={shareRequest} onChange={(e) => setShareRequest(e.target.value)} placeholder='email' />
                  {errorMessage && (
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                  )}
                  <button type='submit'>Share</button>
                </form>

                <b>Shared users:</b>
                <div className='user-list'>
                  {emailList.map((userEmail) => (
                    <div className='user-item' key={userEmail}>
                      {userEmail}
                      <button onClick={() => removeSharedUser(userEmail, setEmailList, emailList, activeID, setErrorMessage)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'settings' && (
          <div className="filter" onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>X</button>
              </div>

              <h2>"<i>{activeName}</i>" Settings</h2>
              <div className='popup-content'>
                <p>Enter a new name for "<i>{activeName}</i>"</p>
                <form onSubmit={(e) => changeName(e, activeName, newName, activeID, togglePopup, setStatesObject, setErrorMessage)}>
                  <input type='text' defaultValue={activeName} onChange={(e) => setNewName(e.target.value)} placeholder='canvas name' />
                  {errorMessage && (
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                  )}
                  <button type='submit'>Save</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'delete-account' && (
          <div className="filter" onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>X</button>
              </div>

              <h2>Would you like to delete your account?</h2>
              <div className='popup-content'>
                <p><b>NOTE:</b> Deleting your account will remove all data associated with your account. This will include any saved floor plans.
                  Do you really want to delete your account?</p>
                <button onClick={() => deleteAccount(user, q, onActive, onRefreshToggle, togglePopup, onClose, setStatesObject, setErrorMessage)}>Yes, delete my account</button>
                <button onClick={() => togglePopup(null, setStatesObject, setErrorMessage)}>No, do not delete my account</button>
                {errorMessage && (
                  <p style={{ color: 'red' }}>{errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;