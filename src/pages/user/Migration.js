import { DialogTitle, Typography } from "@mui/material";
import React from "react";

const Migration = ({ handleClose ,rowData}) => {
  return (
    <div>
      <DialogTitle>
        <Typography variant="subtitle2" color="text.secondary">
          Total Data to Migrate:
          {rowData.storageUsed}
        </Typography>
      </DialogTitle>
    </div>
  );
};

export default Migration;
