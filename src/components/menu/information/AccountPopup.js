import { auth, db } from '../../../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import '../../css/Popup.css';
import { collection, query, where, getDoc, getDocs, doc, deleteDoc, addDoc, or, updateDoc, arrayUnion, arrayRemove,  } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Delete, Copy, Share, Settings } from '../../../icons';

function Account({ onClose, onCanvasName, onCanvasID, onCanvasWidth, onCanvasHeight, onActive, onLoadToggle, onRefreshToggle, deviceList, onDeviceList, onOriginalDeviceList, originalDeviceList, onLabelList, labelList, onDeviceRegistry, onEntityRegistry, user }) {

  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeValue, setActiveValue] = useState(null);
  const [activeName, setActiveName] = useState(null);
  const [activeID, setActiveID] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const [sharedList, setSharedList] = useState(null);
  const [emailList, setEmailList] = useState([]);
  const [nameCopy, setNameCopy] = useState(null);
  const [shareRequest, setShareRequest] = useState("");
  const [tabMode, setTabMode] = useState('floorplan')
  const [errorMessage, setErrorMessage] = useState("");
  
  const q = query(
    collection(db, "canvases"),
    or (
      where('owner', '==', user.uid),
      where('shared', 'array-contains', user.uid),
    )
  );

  useEffect(() => {
    async function retrieveFiles() {
      try{ 
        const querySnapshot = await getDocs(q);
        const canvases = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
        setFiles(canvases)
      } catch(error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    retrieveFiles();

  }, [q]);

  useEffect(() => {
    if (sharedList === undefined || sharedList === null || sharedList === "" ) {
      return;
    };

    async function GenerateEmailList() {
      const emailArray = [];
      for (const userid of sharedList) {
        const docRef = await getDoc(doc(db, "users", userid))
        const retrievedEmail = docRef.data().email;
        emailArray.push(retrievedEmail);
      }
      setEmailList(emailArray);
    }
    GenerateEmailList()
  }, [sharedList]);

  async function deleteCanvas() {
    try{
      await deleteDoc(doc(db, "canvases", activeID))
      togglePopup(null);
      onCanvasName(null);
      onCanvasID(null);
      onActive(false);
      onRefreshToggle();
    } catch (error){
      setErrorMessage(error.message)
    }
  };

  async function duplicateCanvas(e) {
    e.preventDefault();
    if(activeName !== nameCopy) {
      try{
        await addDoc(collection(db, "canvases"), {
          owner: user.uid,
          canvasName: nameCopy,
          canvasData: activeData,
          devices: deviceList,
          originalDevices: originalDeviceList,
          labelList: labelList,
          shared: [],
          created: new Date(),
          updated: new Date()
        });
        togglePopup(null);
      } catch (error) {
        setErrorMessage(error.message)
      }
    }
  };

  async function changeName(e) {
    e.preventDefault();
    if(activeName !== nameCopy) {
      try{
        await updateDoc(doc(db, "canvases", activeID), {
          canvasName: nameCopy,
          updated: new Date()
        });
        togglePopup(null);
      } catch (error) {
        setErrorMessage(error.message)
      }
    }
  };

  async function shareCanvas(e) {
    e.preventDefault();

    const retrieveUserID = query (
      collection(db, "users"),
        where('email', '==', shareRequest),
    );

    try{
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

  async function removeSharedUser(user) {
    const retrieveUserID = query (
      collection(db, "users"),
        where('email', '==', user),
      );

    try{
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

  function loadCanvas(canvasID, canvasName, width, height, devices, originalDevices, labels, coreDevice, coreEntity) {
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

  function togglePopup(value, name, id, data, list) {
    if (value === 'copy') {
      setNameCopy(`${name} copy`);
    }
    if (value === 'delete-account') {
      setActiveValue(value);
      return;
    }
    if (value === null) {
      setErrorMessage(null);
    }
    setActiveName(name);
    setActiveValue(value);
    setActiveID(id);
    setActiveData(data);
    setSharedList(list);
    }  

  function userSignOut() {
    signOut(auth).then(() => {
      onActive(false);
      onClose();
    }).catch((error) => {
        setErrorMessage(error.message);
    });
  }

  async function deleteAccount() {
    try{
      const userid = user.uid;
      const querySnapshot = await getDocs(q);

      await deleteDoc(doc(db, "users", userid))

      querySnapshot.docs.forEach(async (document) => {
        if(document.data().owner === userid) {
          await deleteDoc(doc(db, "canvases", document.id))
        } else if(document.data().shared.includes(userid)) {
            await updateDoc(doc(db, "canvases", document.id), {
            shared: arrayRemove(userid)
          });
        }
      });

       await deleteUser(user)

      onActive(false);
      onRefreshToggle();
      togglePopup(null);
      onClose();

    } catch(error) {
      setErrorMessage(error.message);
    }
  }

  if (loading) return;

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

          <button disabled={true}>Change Password</button>
          <button onClick={userSignOut}>Sign Out</button>
          {errorMessage && (
            <p style={{color: 'red'}}>{errorMessage}</p>
          )}
          
          <div className='tabs'>
          <button className={tabMode === 'floorplan' ? 'button-on' : 'button-off'} onClick={() => setTabMode('floorplan')}><b>Floor Plans</b></button>
          <button className={tabMode === 'shared' ? 'button-on' : 'button-off'}onClick={() => setTabMode('shared')}><b>Shared With Me</b></button>
          </div>
          {tabMode === 'floorplan' && (
            <ul className='floor-plan-grid'>
            {files.filter(file => file.owner === user.uid).map((file) => (
              <li key={file.id} onClick={() => loadCanvas(file.id, file.canvasName, file.canvasData.width, file.canvasData.height, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)}>
              <div className='upper-bar' onClick={e => e.stopPropagation()}>
                <img className="round-icon" onClick={() => togglePopup('copy', file.canvasName, file.id, file.canvasData, file.shared)} src={Copy} alt='Copy Button'/>
                <img className="round-icon" onClick={() => togglePopup('share', file.canvasName, file.id, file.canvasData, file.shared)} src={Share} alt='Share Button'/>
                <img className="round-icon" onClick={() => togglePopup('delete', file.canvasName, file.id, file.canvasData, file.shared)} src={Delete} alt='Delete Button'/>
                <img className="round-icon" onClick={() => togglePopup('settings', file.canvasName, file.id, file.canvasData, file.shared)} src={Settings} alt='Settings Button'/>
              </div>
                <p>{file.canvasName}</p>
              </li>
            ))}
            </ul>
          )}
          {tabMode === 'shared' && (
            <ul className='floor-plan-grid'>
            {files.filter(file => file.owner !== user.uid).map((file) => (
              <li key={file.id} onClick={() => loadCanvas(file.id, file.canvasName, file.canvasData.width, file.canvasData.height, file.devices, file.originalDevices, file.labelList, file.deviceRegistry, file.entityRegistry)}>
                <p>{file.canvasName}</p>
              </li>
            ))}
            </ul>
          )}
            <button onClick={() => togglePopup('delete-account')}>Delete Account</button>
        </div>
        )}

        {activeValue === 'delete' && (
          <div className="filter" onClick={() => togglePopup(null)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null)}>X</button>
              </div>

              <h2>Would you like to delete "<i>{activeName}</i>"?</h2>
              <div className='popup-content'>
                <button onClick={() => deleteCanvas(activeID)}>Yes</button>
                <button onClick={() => togglePopup(null)}>No</button>
                {errorMessage && (
                  <p style={{color: 'red'}}>{errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeValue === 'copy' && (
          <div className="filter" onClick={() => togglePopup(null)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null)}>X</button>
              </div>

              <h2>Copy</h2>
              <div className='popup-content'>
                <form onSubmit={duplicateCanvas}>
                <input type='text' value={nameCopy} onChange={(e) => setNameCopy(e.target.value)} placeholder='canvas name' />
                {errorMessage && (
                  <p style={{color: 'red'}}>{errorMessage}</p>
                )}
                <button type='submit'>Create Copy</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'share' && (
          <div className="filter" onClick={() => togglePopup(null)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null)}>X</button>
              </div>

              <h2>Share "<i>{activeName}</i>" With a User</h2>
              <div className='popup-content'>
                Please enter the email of the person you wish to share with.
                <form onSubmit={shareCanvas}>
                  <input type='text' value={shareRequest} onChange={(e) => setShareRequest(e.target.value)} placeholder='email' />
                  {errorMessage && (
                    <p style={{color: 'red'}}>{errorMessage}</p>
                  )}
                  <button type='submit'>Share</button>
                </form>

                <b>Shared users:</b>
                <div className='user-list'>
                  {emailList.map((userEmail) => (
                    <div className='user-item' key={userEmail}>
                      {userEmail}
                      <button onClick={() => removeSharedUser(userEmail)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'settings' && (
          <div className="filter" onClick={() => togglePopup(null)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null)}>X</button>
              </div>

              <h2>"<i>{activeName}</i>" Settings</h2>
              <div className='popup-content'>
                <p>Enter a new name for "<i>{activeName}</i>"</p>
                <form onSubmit={changeName}>
                  <input type='text' defaultValue={activeName} onChange={(e) => setNameCopy(e.target.value)} placeholder='canvas name' />
                  {errorMessage && (
                    <p style={{color: 'red'}}>{errorMessage}</p>
                  )}
                  <button type='submit'>Save</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeValue === 'delete-account' && (
          <div className="filter" onClick={() => togglePopup(null)}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
              <div className='exit'>
                <button onClick={() => togglePopup(null)}>X</button>
              </div>

              <h2>Would you like to delete your account?</h2>
              <b>NOTE:</b> Deleting your account will remove all data associated with your account. This will include any saved floor plans.
              Do you really want to delete your account?
              <div className='popup-content'>
                <button onClick={() => deleteAccount()}>Yes, delete my account</button>
                <button onClick={() => togglePopup(null)}>No, do not delete my account</button>
                {errorMessage && (
                  <p style={{color: 'red'}}>{errorMessage}</p>
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