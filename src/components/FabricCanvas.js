import {useEffect, useRef} from "react";
import * as fabric from "fabric";

function FabricCanvas() {
    const canvasRef = useRef(null);

useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        height: 800,
        width: 1200,
    })

    return () =>
    {
        fabricCanvas.dispose();
    }

    }, [])

    return (
        <canvas ref={canvasRef} style={{backgroundColor: "white"}}/>
    )
};

export default FabricCanvas;