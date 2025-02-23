import clsx from "clsx";
import { PlayCircle } from "@mui/icons-material";
import { Link } from "react-router";

type IVideoPreviewLinkProps = {
  projectId: string;
  imageData: string;
  className?: string;
};

const VideoPreviewLink = ({
  projectId,
  imageData,
  className,
}: IVideoPreviewLinkProps) => (
  <Link
    className={clsx("relative w-full block", className)}
    to={`/project/${projectId}/preview`}
  >
    <img className="w-full" src={imageData} />
    <PlayCircle
      className="absolute opacity-80 text-white"
      sx={{
        top: "calc(50% - 50px)",
        left: "calc(50% - 50px)",
        width: 100,
        height: 100,
      }}
    />
  </Link>
);

export default VideoPreviewLink;
