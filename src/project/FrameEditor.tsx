import { useParams } from "react-router";
import { useEffect } from "react";
import { loadFrame, selectFrameToEdit } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";

const FrameEditor = () => {
  const dispatch = useAppDispatch();
  const { frameId } = useParams<{
    frameId: string;
  }>();
  const frame = useSelector(selectFrameToEdit);

  useEffect(() => {
    if (frameId === undefined) {
      return;
    }

    dispatch(loadFrame(frameId));
  }, [dispatch, frameId]);

  if (frame == null) {
    return null;
  }

  return <img src={frame.data} />;
};

export default FrameEditor;
