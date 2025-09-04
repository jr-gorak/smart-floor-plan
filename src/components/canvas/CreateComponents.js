import * as fabric from "fabric";

//Creates the fabric object to go onto the canvas
export function createComponent(img, type, width, height) {
    var component = new fabric.FabricImage(img, {
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: 0.1,
        scaleY: 0.1,
        selectable: true,
        strokeUniform: true,
        id: null,
        classifier: type === 'stairs' ? 'stairs' : 'draw',
        area_id: null,
    });
    return component;
}

//Filters by the component type to assign an icon from componentImages
export function filterComponent(canvas, componentImages, canvasAction, canvasWidth, canvasHeight) {
    if (canvasAction === 'doorway') {
        return canvas.add(createComponent(componentImages['door'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'window') {
        return canvas.add(createComponent(componentImages['window'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'stairs') {
        return canvas.add(createComponent(componentImages['stairs'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'bed') {
        return canvas.add(createComponent(componentImages['bed'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'chair') {
        return canvas.add(createComponent(componentImages['chair'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'sofa') {
        return canvas.add(createComponent(componentImages['sofa'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'three-sofa') {
        return canvas.add(createComponent(componentImages['threesofa'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'stove') {
        return canvas.add(createComponent(componentImages['stove'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'kitchen-sink') {
        return canvas.add(createComponent(componentImages['kitchensink'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'bathtub') {
        return canvas.add(createComponent(componentImages['bathtub'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'round-sink') {
        return canvas.add(createComponent(componentImages['roundsink'], canvasAction, canvasWidth, canvasHeight));
    } else if (canvasAction === 'toilet') {
        return canvas.add(createComponent(componentImages['toilet'], canvasAction, canvasWidth, canvasHeight));
    }
}
