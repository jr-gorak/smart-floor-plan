import { useState } from 'react';
import '../../css/Popup.css';
import { auth } from '../../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../../../firebase';
import { doc, setDoc } from "firebase/firestore";

function UserAuthentication({ onClose }) {

    const [frameMode, setFrameMode] = useState("login");
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [passValidate, setPassValidate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");
    const [togglePasswordReset, setTogglePasswordReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    async function createAccount(e) {
        e.preventDefault();
        if (pass === passValidate) {
            try {
                const docRef = await createUserWithEmailAndPassword(auth, email, pass);
                const newUser = docRef.user;
                await setDoc(doc(db, "users", newUser.uid), {
                    id: newUser.uid,
                    email: newUser.email
                })
                onClose();
            }
            catch (error) {
                setErrorMessage(error);
            }
        } else {
            setErrorMessage("Passwords do not match")
        }
    };

    function signInAccount(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, pass).then(() => {
            onClose();
        }).catch((error) => {
            setErrorMessage(error.message);
        })
    };

    function resetPassword(email) {
        setMessage("");
        setErrorMessage("");

        sendPasswordResetEmail(auth, email).then(() => {
            setMessage("An email has been sent to reset your password. It may take a few minutes, and be sure to check your junk email if you have not received it.")
        }).catch((error) => {
            setErrorMessage(error.message);
        })
    }

    return (

        <div className="filter" onClick={onClose}>
            <div className="small-frame" onClick={e => e.stopPropagation()}>
                <div className='exit'>
                    <button onClick={onClose}>X</button>
                </div>

                {frameMode === 'login' && (
                    <div>
                        <h2>User Login</h2>
                        <div className='popup-content'>
                            <div className='form-container'>
                                <form onSubmit={signInAccount}>

                                    <label>Email: <input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} required /></label>

                                    <label>Password: <input type='password' placeholder='password' value={pass} onChange={(e) => setPass(e.target.value)} required /></label>

                                    <button type='submit'>Sign In</button>
                                </form>
                            </div>
                            <div className='split-view'>
                                <div>
                                    <p> Do not have an account?</p>
                                    <button onClick={() => { setFrameMode("signup"); setPass(""); setMessage(""); setErrorMessage("") }}>Create an Account</button>
                                </div>
                                <div>
                                    <button onClick={() => setTogglePasswordReset(!togglePasswordReset)}>Forgot Password</button>
                                    {togglePasswordReset && (
                                        <div>
                                            <label> Email: <input type='email' placeholder='email' style={{ width: 200 }} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /></label>
                                            <button onClick={() => resetPassword(resetEmail)}>Reset Password</button>
                                        </div>
                                    )
                                    }
                                </div>
                            </div>
                            {message && (
                                <p style={{ color: 'green' }}>{message}</p>
                            )}
                            {errorMessage && (
                                <p style={{ color: 'red' }}>{errorMessage}</p>
                            )}
                        </div>
                    </div>
                )}

                {frameMode === 'signup' && (
                    <div>
                        <h2>Create New Account</h2>
                        <div className='popup-content'>
                            <div className='form-container'>
                                <form onSubmit={createAccount}>

                                    <label>Email: <input type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>

                                    <label>Password: <input type='password' placeholder='password' value={pass} onChange={(e) => setPass(e.target.value)}
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="Must contain at least 8 characters, one lowercase, one uppercase, and one number." minLength={10} required /> </label>

                                    <label>Confirm Password: <input type='password' placeholder='password' value={passValidate} onChange={(e) => setPassValidate(e.target.value)} minLength={10} required /> </label>
                                    {errorMessage && (
                                        <p style={{ color: 'red', margin: '0 0 0 0' }}>{errorMessage}</p>
                                    )}

                                    <button type='submit'>Create an Account</button>

                                </form>

                            </div>
                            <p> Already have an account?</p>
                            <button onClick={() => { setFrameMode("login"); setPass(""); setPassValidate(""); setErrorMessage(""); setResetEmail(""); setTogglePasswordReset(false); }}>Login</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserAuthentication;