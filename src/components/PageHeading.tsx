import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Close, Edit } from "@mui/icons-material";
import { Link } from "react-router";
import React, { useState } from "react";
import clsx from "clsx";

type IProps = {
  title: string;
  subtitle?: string;
  onTitleChange?: (title: string) => void;
  backLink: string;
  actions?: React.ReactNode;
  thumbnail?: string;
  className?: string;
};

const PageHeading = ({
  title,
  subtitle,
  onTitleChange,
  backLink,
  actions,
  thumbnail,
  className,
}: IProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleTitleChange = (value: string) => {
    onTitleChange?.(value);
    setIsEditingTitle(false);
    setNewTitle("");
  };

  return (
    <>
      <Box className={clsx("flex gap-4 mt-4 items-start", className)}>
        {thumbnail && (
          <img alt="scene image" src={thumbnail} className="h-24" />
        )}
        <Box className="flex flex-col flex-grow">
          <Typography variant="h2" className="mb-0">
            {title}
          </Typography>
          {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
        </Box>
        {onTitleChange && (
          <IconButton
            onClick={() => {
              setNewTitle(title);
              setIsEditingTitle(true);
            }}
          >
            <Edit />
          </IconButton>
        )}
        {actions}
        <IconButton component={Link} to={backLink}>
          <Close />
        </IconButton>
      </Box>
      <Dialog
        open={isEditingTitle}
        onClose={() => setIsEditingTitle(false)}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              handleTitleChange(newTitle);
            },
          },
        }}
      >
        <DialogTitle>Title</DialogTitle>
        <DialogContent className="pt-2!">
          <TextField
            autoFocus
            label="Title"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setIsEditingTitle(false)}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PageHeading;
