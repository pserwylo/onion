import Webcam from "react-webcam";
import {useCallback, useEffect, useRef, useState} from "react";
import {useAppDispatch} from "../store/hooks.ts";
import {
    addImage, generatePreviewVideo,
    removeImage,
    selectImages,
    selectOnionSkinImages,
    selectPreviewVideo,
    selectProjectOptions
} from "./projectSlice.ts";
import {useSelector} from "react-redux";

const ProjectEditor = () => {

    const dispatch = useAppDispatch();
    const onionSkinImages = useSelector(selectOnionSkinImages);
    const images = useSelector(selectImages);
    const [selfieCam, setSelfieCam] = useState(false);
    const [showVideoPreview, setShowVideoPreview] = useState(false);

    // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
    const webcamRef = useRef<Webcam>(null)

    // Call this function to take a screenshot
    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            dispatch(addImage(imageSrc));
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

    if (showVideoPreview) {
        return <VideoPreview onClose={() => setShowVideoPreview(false)} />
    }

    return (
        <div className="content project">
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
            {images.length > 0 && (
                <a className="video-preview--wrapper" href="#" onClick={e => {
                    e.preventDefault()
                    setShowVideoPreview(true);
                }}>
                    <img className="video-preview--image" src={images[0]} />
                    <div className="video-preview--icon">
                        ▶️
                    </div>
                </a>
            )}
        </div>

    );
}

type IVideoPreviewProps = {
    onClose: () => void;
}

const VideoPreview = ({ onClose }: IVideoPreviewProps) => {
    const previewVideo = useSelector(selectPreviewVideo);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(generatePreviewVideo());
    }, [])

    return (
        <div className="content">
            <video
                className="preview"
                src={previewVideo}
                controls
            />
            <div className="main-actions">
                <button className="action--back" onClick={onClose}>
                    ⬅️ Back
                </button>
                <a href={previewVideo} download="video.webm">
                    <button className="action--download-video">
                        🔽 Download
                    </button>
                </a>
            </div>
        </div>
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