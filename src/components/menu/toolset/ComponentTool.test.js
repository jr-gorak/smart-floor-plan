import { toggleAction } from "./ComponentTool";

jest.useFakeTimers();

describe('toggleAction', () => {

    const onCanvasAction = jest.fn();
    let value = 'select'

    it('An action value is set then is immediately reset back to the default state', () => {
        value = 'doorway'
        toggleAction(value, onCanvasAction)
        expect(onCanvasAction).toHaveBeenCalledWith("doorway");
        jest.runAllTimers();
        expect(onCanvasAction).toHaveBeenCalledWith("select");
    })
})