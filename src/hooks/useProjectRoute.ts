import { useAppDispatch } from "../store/hooks.ts";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { loadProject } from "../project/projectSlice.ts";

type ProjectRouteParams = {
  requireScene?: boolean;
  requireFrame?: boolean;
};

export const useProjectRoute = ({
  requireScene,
  requireFrame,
}: ProjectRouteParams = {}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId, sceneIndex, frameId } = useParams<{
    projectId: string;
    sceneIndex: string;
    frameId: string;
  }>();

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneIndex, frameId }));
    }
  }, [dispatch, projectId, sceneIndex, frameId]);

  if (!projectId) {
    navigate("/");
    return {
      projectId: "",
    };
  }

  if (requireScene && !sceneIndex) {
    navigate("/");
    return {
      projectId: "",
    };
  }

  if (requireFrame && !frameId) {
    navigate("/");
    return {
      projectId: "",
    };
  }

  return { projectId, sceneIndex, frameId };
};
