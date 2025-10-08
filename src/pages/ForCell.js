import { TableCell, Box, Typography, IconButton, Popover } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

const ForCell = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (!items || items.length === 0) return <TableCell>—</TableCell>;

  // Approx height per item (adjust if needed)
  const itemHeight = 30;
  const maxVisibleItems = 4;
  const popoverHeight =
    items.length > maxVisibleItems ? itemHeight * maxVisibleItems : "auto";

  return (
    <TableCell
      sx={{
        textAlign: "center",
        maxWidth: 150,
        padding: "6px 8px",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          {items[0]}
        </Typography>

        {items.length > 1 && (
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{ ml: 0.5, p: 0.5 }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            p: 1,
            maxHeight: popoverHeight,
            overflowY: items.length > maxVisibleItems ? "auto" : "visible",
            minWidth: 150,
          }}
        >
          {items.map((item, idx) => (
            <Typography key={idx} variant="body2">
              {item}
            </Typography>
          ))}
        </Box>
      </Popover>
    </TableCell>
  );
};

export default ForCell;
