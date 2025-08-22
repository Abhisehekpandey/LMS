import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { deleteUsers } from "../../api/userService"; // adjust path
import { toast } from "react-toastify";

const DeleteUser = ({ handleClose, rowId }) => {
  const handleDelete = async () => {
    if (!rowId || rowId.length === 0) {
      toast.warn("No users selected for deletion.");
      return;
    }

    try {
      await deleteUsers(rowId); // ✅ send only IDs
      toast.success("User(s) deleted successfully.");
      handleClose();
    } catch (error) {
      console.error("Deletion failed", error);
      toast.error("Failed to delete user(s).");
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          fontWeight: "bold",
          padding: "8px 12px",
          backgroundColor: "primary.main", // MUI blue
          color: "white", // white text
        }}
      >
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {rowId.length} user
          {rowId.length > 1 ? "s" : ""}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </>
  );
};

export default DeleteUser;


