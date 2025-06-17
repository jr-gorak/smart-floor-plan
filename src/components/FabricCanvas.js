import {useEffect, useRef} from "react";
import * as fabric from "fabric";

function FabricCanvas({canvasWidth, canvasHeight}) {
    const canvasRef = useRef(null)

useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
    })

    return () =>
    {
        fabricCanvas.dispose();
    }

    }, [canvasWidth, canvasHeight])

    return (
        <canvas ref={canvasRef} style={{backgroundColor: "white"}}></canvas>
    )
};

export default FabricCanvas;