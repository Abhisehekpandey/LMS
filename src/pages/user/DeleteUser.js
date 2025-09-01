import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  IconButton
} from "@mui/material";
import Close from "@mui/icons-material/Close";
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          backgroundColor: "primary.main",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            fontFamily: '"Be Vietnam", sans-serif',
            color: "#fff",
          }}
        >
          Confirm Deletion
        </Typography>

        <IconButton
          onClick={handleClose} // make sure this closes the dialog
          size="small"
          sx={{
            color: "#fff",
            width: 32,
            height: 32,
            border: "1px solid",
            borderColor: "#fff",
            bgcolor: "error.lighter",
            borderRadius: "50%",
            position: "relative",
            "&:hover": {
              transform: "rotate(180deg)",
            },
            transition: "transform 0.3s ease",
          }}
        >
          <Close
            sx={{
              fontSize: "1rem",
              transition: "transform 0.2s ease",
            }}
          />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText>
          Are you sure you want to delete {rowId.length} user
          {rowId.length > 1 ? "s" : ""}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
       
        <Button
          onClick={handleDelete}
          sx={{
            backgroundColor: "rgb(251, 68, 36)",
            color: "white",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "rgb(251, 68, 36)", // keep same color on hover
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </>
  );
};

export default DeleteUser;


