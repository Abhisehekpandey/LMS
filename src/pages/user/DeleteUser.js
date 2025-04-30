import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

const DeleteUser = ({ handleClose, rowId }) => {
  return (
    <div>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {/* Are you sure you want to delete the user "{userToDelete}"? */}
          {/* {selectedIds.length > 0
            ? `Are you sure you want to delete the selected users:${selectedDeleteRow.userName} ?`
            : `Are you sure you want to delete the user "${selectedDeleteRow.userName}"?`} */}
          Are you sure you want to delete the user?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleClose} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </div>
  );
};

export default DeleteUser;
