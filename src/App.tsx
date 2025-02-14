import './App.css'
import Webcam from "react-webcam";
import {useCallback, useRef, useState} from "react";
import Whammy from 'ts-whammy';

// https://stackoverflow.com/a/67551175
function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = _e => resolve(reader.result as string);
        reader.onerror = _e => reject(reader.error);
        reader.onabort = _e => reject(new Error("Read aborted"));
        reader.readAsDataURL(blob);
    });
}

function App() {
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    };

    const [images, setImages] = useState<string[]>([]);
    const [previewVideo, setPreviewVideo] = useState<string|undefined>();
    const [numOnionSkins, setNumOnionSKins] = useState<number>(5);
    const [currentFrame, setCurrentFrame] = useState<number>(0)

    // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
    const webcamRef = useRef<Webcam>(null)

    // Call this function to take a screenshot
    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            const newImages = [...images, imageSrc];
            setImages(newImages);

            const video = Whammy.fromImageArray(newImages, 15) as Blob;
            const data = await blobToDataURL(video);
            setPreviewVideo(data);
        }
    }, [webcamRef, images])

    const onionSkins = images.slice(images.length - Math.min(numOnionSkins, images.length)).reverse();

    const handleSeek = (index: number) => {
        setCurrentFrame(index);
    }

  return (
    <>
        <button onClick={capture}>
            📷 Take picture
        </button>
        <div className="camera-wrapper">
            <Webcam
                ref={webcamRef}
                audio={false}
                height={480}
                screenshotFormat="image/webp"
                width={640}
                className="camera camera--feed"
                videoConstraints={videoConstraints} />

            {onionSkins.map((image) => (
                <img className="onion-skin" src={image} key={image} />
            ))}
        </div>
        <ul className="frames">
            {images.map(((image, i) =>
                <li className="frame" key={i}>
                    <a href="#" onClick={() => handleSeek(i)}>
                        <img src={image} className={"thumbnail " + (i === Math.floor(currentFrame) ? 'current' : '')} />
                    </a>
                </li>
            ))}
        </ul>
        <video
            className="preview"
            src={previewVideo}
            onTimeUpdate={(event) => setCurrentFrame(event.currentTarget.currentTime / event.currentTarget.duration * images.length)}
        />
    </>
  )
}

export default App
