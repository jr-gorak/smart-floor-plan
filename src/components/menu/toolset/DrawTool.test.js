import { toggleAction } from "./DrawTool";

describe('toggleAction', () => {

    const onCanvasAction = jest.fn();
    const setIsActive = jest.fn();
    const setActiveValue = jest.fn();
    let value = null
    let isActive = false;
    let activeValue = null;

    it('A draw state is activated', () => {
        value = 'line'

        toggleAction(value, isActive, activeValue, onCanvasAction, setIsActive, setActiveValue)

        expect(onCanvasAction).toHaveBeenCalledWith("line");
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith("line");
    })

    it("Switching to a different draw state from an active state", () => {
        value = 'line'

        toggleAction(value, isActive, activeValue, onCanvasAction, setIsActive, setActiveValue)

        expect(onCanvasAction).toHaveBeenCalledWith("line");
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith("line");

        isActive = true;
        activeValue = 'line';
        value = 'square'

        toggleAction(value, isActive, activeValue, onCanvasAction, setIsActive, setActiveValue)

        expect(onCanvasAction).toHaveBeenCalledWith("square");
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith("square");
        isActive = false;
        activeValue = 'select';
    })

    it("Draw state is de-activated when the corresponding button is selected", () => {
        value = 'line'

        toggleAction(value, isActive, activeValue, onCanvasAction, setIsActive, setActiveValue)

        expect(onCanvasAction).toHaveBeenCalledWith("line");
        expect(setIsActive).toHaveBeenCalledWith(true);
        expect(setActiveValue).toHaveBeenCalledWith("line");

        isActive = true;
        activeValue = 'line';

        toggleAction(value, isActive, activeValue, onCanvasAction, setIsActive, setActiveValue)
        expect(onCanvasAction).toHaveBeenCalledWith("select");
        expect(setIsActive).toHaveBeenCalledWith(false);
        expect(setActiveValue).toHaveBeenCalledWith(null);
        isActive = false;
        activeValue = 'select';
    })
})