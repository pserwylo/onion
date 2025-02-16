import Webcam from "react-webcam";
import {useCallback, useRef, useState} from "react";
import {useAppDispatch} from "../store/hooks.ts";
import {
    appendImageAndRefreshPreviewVideo, removeImage,
    selectImages, selectOnionSkinImages,
    selectPreviewVideo,
    selectProjectOptions
} from "./projectSlice.ts";
import {useSelector} from "react-redux";

const ProjectEditor = () => {

    const dispatch = useAppDispatch();
    const onionSkinImages = useSelector(selectOnionSkinImages);
    const images = useSelector(selectImages);
    const [selfieCam, setSelfieCam] = useState(false);

    // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
    const webcamRef = useRef<Webcam>(null)

    // Call this function to take a screenshot
    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            dispatch(appendImageAndRefreshPreviewVideo(imageSrc));
        }
    }, [webcamRef])

    const reverse = () => {
        setSelfieCam(!selfieCam);
    }

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: selfieCam ? "user" : {
            exact: "environment",
        }
    };

    return (
        <div className="project">
            <div className="camera-wrapper">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/webp"
                    height={480}
                    width={640}
                    disablePictureInPicture
                    className="camera camera--feed"
                    videoConstraints={videoConstraints}/>

                {onionSkinImages.map((image) => (
                    <img className="onion-skin" src={image} key={image}/>
                ))}
                <button onClick={reverse} className="action--camera-reverse">
                    🔄
                </button>
            </div>
            <div className="main-actions">
                <button onClick={capture} className="action--take-photo">
                    📷 Take picture
                </button>
            </div>
            <FrameList />
            {images.length > 0 && <VideoPreview />}
        </div>

    );
}

const VideoPreview = () => {
    const previewVideo = useSelector(selectPreviewVideo);

    return (
        <>
            <video
                className="preview"
                src={previewVideo}
                controls
            />
            <div className="main-actions">
                <a href={previewVideo} className="action--download-video" download="video.webm">Download</a>
            </div>
        </>
    );
}

const FrameList = () => {
    const images = useSelector(selectImages);

    return (
        <div className="frame-wrapper">
            <ul className="frames">
                {images.toReversed().map(((image, i) => <Frame image={image} key={i} index={images.length - i} />))}
            </ul>
        </div>
    )
}

type IFrameProps = {
    image: string;
    index: number;
}

const Frame = ({ image, index }: IFrameProps) => {
    const { frameRate } = useSelector(selectProjectOptions);
    const dispatch = useAppDispatch();

    const calculateFrameTime = (index: number) => {
        return index / frameRate;
    };

    const handleDelete = () => {
        dispatch(removeImage(image));
    }

    return (
        <li className="frame">
            <img src={image} className="thumbnail" />
            <div className="frame--index">
                {index}
            </div>
            <div className="frame--time">
                {calculateFrameTime(index)}s
            </div>
            <div className="frame--actions">
                <button className="frame-action frame-action--delete-frame" onClick={handleDelete}>
                    ❌
                </button>
            </div>
        </li>
    )
}

export default ProjectEditor;