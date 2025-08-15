// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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