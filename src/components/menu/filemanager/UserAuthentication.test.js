import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { createAccount, createUser, signInAccount, resetPassword } from './UserAuthentication';
import { auth, db } from '../../../firebase';

jest.mock("firebase/auth", () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn()
}))

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    setDoc: jest.fn()
}))

jest.mock("../../../firebase", () => ({
    auth: { mock: true },
    db: { mock: true }
}))

const onClose = jest.fn();

describe('createAccount', () => {
    const preventDefault = jest.fn();
    const e = { preventDefault };
    const setErrorMessage = jest.fn();

    it('User creates a new account with a new email and correct password', async () => {

        let email = "mock@example.com"
        let pass = "PassW0rd12345!"
        let passValidate = "PassW0rd12345!"

        createUserWithEmailAndPassword.mockResolvedValue({ user: { email: "mock@example.com", uid: "123" } })

        await createAccount(e, pass, passValidate, email, setErrorMessage, onClose)

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "mock@example.com", "PassW0rd12345!");
        expect(setErrorMessage).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    })

    it('Attempting to create an account without matching passwords', async () => {

        let email = "mock@example.com"
        let pass = "PassW0rd12345!"
        let passValidate = "Password12345!"

        await createAccount(e, pass, passValidate, email, setErrorMessage, onClose)

        expect()

        expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
        expect(setErrorMessage).toHaveBeenCalledWith("Passwords do not match");
    })
})

describe('createUser', () => {

    it('Creates a new user document', async () => {

        const docRef = { user: { email: "mock@example.com", uid: "123" } }

        await createUser(docRef, onClose)

        expect(setDoc).toHaveBeenCalledWith(undefined, { "email": "mock@example.com", "id": "123" })
        expect(doc).toHaveBeenCalledWith(db, "users", "123")
        expect(onClose).toHaveBeenCalled();
    })

})

describe('signInAccount', () => {

    /*Note: Error handling events that are handled by firebase are not tested (i.e. no user match, incorrect password). The reason for this
    is that firebase handles its own instances of error handling, which are not necessarily testable with mock functions. The above
    createUser was tested for an incorrect password as the application also handles it's own password validation logic. Sign-in logic is purely
    firebase authentication. 
    */

    const preventDefault = jest.fn();
    const e = { preventDefault };
    const setErrorMessage = jest.fn();
    const onClose = jest.fn();
    let email = "mock@example.com"
    let pass = "PassW0rd12345!"

    it('Signing into an existing account', async () => {

        signInWithEmailAndPassword.mockResolvedValueOnce({ user: { email: "mock@example.com", uid: "123" } })

        await signInAccount(e, pass, email, setErrorMessage, onClose)

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "mock@example.com", "PassW0rd12345!")
        expect(onClose).toHaveBeenCalled();
        expect(setErrorMessage).not.toHaveBeenCalled();

    })
})

describe('resetPassword', () => {

    let setMessage = jest.fn();
    let setErrorMessage = jest.fn();
    let email = "mock@example.com"

    it('Sets a message informing the user that a password reset email has been sent', async () => {

        sendPasswordResetEmail.mockResolvedValueOnce(auth, "mock@example.com")
        await resetPassword(email, setMessage, setErrorMessage)
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, "mock@example.com");
        expect(setMessage).toHaveBeenCalledWith("An email has been sent to reset your password. It may take a few minutes, and be sure to check your junk email if you have not received it.");
        expect(setErrorMessage).toHaveBeenCalledWith("");
    })
})