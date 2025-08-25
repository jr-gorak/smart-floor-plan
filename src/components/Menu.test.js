import { toggleMenu, toggleDropdown, checkSaveIndicator } from "./Menu";

jest.useFakeTimers();

describe('toggleMenu', () => {

    const onCanvasAction = jest.fn();
    const setIsActive = jest.fn();
    const setActiveValue = jest.fn();
    const onOpenPopup = jest.fn();
    let value = null
    let isActive = false;
    let activeValue = null;

    it('A tool menu is activated', () => {
        value = 'draw'

        toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)

        expect(onOpenPopup).toHaveBeenCalledWith('draw');
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith('draw');
        expect(onCanvasAction).toHaveBeenCalledWith('select');
    })

    it('A tool menu is switched from one menu to another and the canvas action is reset to default', () => {
        value = 'draw'

        toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)

        expect(onOpenPopup).toHaveBeenCalledWith('draw');
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith('draw');
        expect(onCanvasAction).toHaveBeenCalledWith('select');
        isActive = true;
        activeValue = 'draw';

        value = 'sensor'
        toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)
        expect(onOpenPopup).toHaveBeenCalledWith('sensor');
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith('sensor');
        expect(onCanvasAction).toHaveBeenCalledWith('select');
        isActive = false;
        activeValue = null;
    })

    it('A tool menu is deactivated by selecting the button of the current state and the canvas action is reset to default', () => {
        value = 'draw'

        toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)

        expect(onOpenPopup).toHaveBeenCalledWith('draw');
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith('draw');
        expect(onCanvasAction).toHaveBeenCalledWith('select');
        isActive = true;
        activeValue = 'draw';

        value = 'draw'
        toggleMenu(value, isActive, activeValue, onOpenPopup, setIsActive, setActiveValue, onCanvasAction)
        expect(onOpenPopup).toHaveBeenCalledWith(null);
        expect(setIsActive).toHaveBeenCalledWith(false);
        expect(setActiveValue).toHaveBeenCalledWith(null);
        expect(onCanvasAction).toHaveBeenCalledWith('select');
        isActive = false;
        activeValue = null;
    })
})

describe('toggleDropdown', () => {

    const setActiveDropdown = jest.fn();
    let value = null
    let activeDropdown = null;

    it('A dropdown is activated', () => {
        value = 'create'
        toggleDropdown(value, activeDropdown, setActiveDropdown)
        expect(setActiveDropdown).toHaveBeenCalledWith('create');
    })

    it('The dropdown is switched', () => {
        value = 'create'
        toggleDropdown(value, activeDropdown, setActiveDropdown)
        expect(setActiveDropdown).toHaveBeenCalledWith('create');
        activeDropdown = 'create'

        value = 'export'
        toggleDropdown(value, activeDropdown, setActiveDropdown)
        expect(setActiveDropdown).toHaveBeenCalledWith('export');
        activeDropdown = null;
    })

    it('The dropdown is deactived by selecting the corresponding button', () => {
        value = 'create'
        toggleDropdown(value, activeDropdown, setActiveDropdown)
        expect(setActiveDropdown).toHaveBeenCalledWith('create');
        activeDropdown = 'create'

        value = 'create'
        toggleDropdown(value, activeDropdown, setActiveDropdown)
        expect(setActiveDropdown).toHaveBeenCalledWith(null);
    })
})

describe('checkSaveIndicator', () => {

    const setSaveIndicator = jest.fn();
    const onSaveResult = jest.fn();

    it('Visual indicator is set as success when a successful save is tracked, then reset after the cooldown', () => {

        const saveResult = "success";

        checkSaveIndicator(saveResult, setSaveIndicator, onSaveResult)

        expect(setSaveIndicator).toHaveBeenCalledWith('save-success')
        expect(onSaveResult).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(setSaveIndicator).toHaveBeenCalledWith('button-off')
        expect(onSaveResult).toHaveBeenCalledWith(null)
    })

    it('Visual indicator is set as failure when a failed save is tracked, then reset after the cooldown', () => {

        const saveResult = "failure";

        checkSaveIndicator(saveResult, setSaveIndicator, onSaveResult)

        expect(setSaveIndicator).toHaveBeenCalledWith('save-failure')
        expect(onSaveResult).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(setSaveIndicator).toHaveBeenCalledWith('button-off')
        expect(onSaveResult).toHaveBeenCalledWith(null)
    })
})