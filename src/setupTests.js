// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

//Issue: Jest does not recognize structured clones, solution:
//snippet source: https://github.com/jsdom/jsdom/issues/3363#issuecomment-1221060809
global.structuredClone = val => {
    return JSON.parse(JSON.stringify(val))
}

HTMLCanvasElement.prototype.getContext = function () {
    return {
        textBaseline: '',
        measureText: () => ({ width: 0, height: 0 }),
        fillText: () => { },
        scale: () => { },
        clearRect: () => { },
        save: () => { },
        restore: () => { },
        beginPath: () => { },
        moveTo: () => { },
        lineTo: () => { },
        closePath: () => { },
        transform: () => { },
        translate: () => { },
        setTransform: () => { },
        fill: () => { },
        drawImage: () => { }
    };
};