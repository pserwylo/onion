import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { CameraDevice } from "../store/db.ts";

type ICameraListProps = {
  cameras: CameraDevice[];
  onSelect: (camera: CameraDevice) => void;
  className?: string;
};

const CameraList = ({ cameras, onSelect, className }: ICameraListProps) => {
  return (
    <List sx={{ pt: 0 }} className={className}>
      <Divider />
      {cameras.map((device) => (
        <>
          <ListItem disablePadding key={device.id}>
            <ListItemButton onClick={() => onSelect(device)}>
              <ListItemAvatar>
                <Avatar>
                  <CameraAlt />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={device.label} />
            </ListItemButton>
          </ListItem>
          <Divider />
        </>
      ))}
    </List>
  );
};

export default CameraList;
