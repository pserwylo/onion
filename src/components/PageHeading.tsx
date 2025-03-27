import { Box, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Link } from "react-router";
import clsx from "clsx";

type IProps = {
  title: string;
  backLink: string;
  actions?: React.ReactNode;
  className?: string;
};
const PageHeading = ({ title, backLink, actions, className }: IProps) => {
  return (
    <Box className={clsx("flex gap-4 mt-4", className)}>
      <Typography variant="h2" className="flex-grow">
        {title}
      </Typography>
      {actions}
      <IconButton component={Link} to={backLink}>
        <Close />
      </IconButton>
    </Box>
  );
};

export default PageHeading;
