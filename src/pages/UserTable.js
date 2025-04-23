import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Settings,
  Dashboard,
  People,
  Storage,
  FileDownload,
} from "@mui/icons-material";
import styles from "./user.module.css";

const rows = Array.from({ length: 27 }, (_, i) => ({
  userName: `User${i + 1}`,
  name: `Name${i + 1}`,
  department:
    i % 3 === 0
      ? "Frontend"
      : i % 3 === 1
      ? "Backend"
      : "Artificial Intelligence",
  role: i % 2 === 0 ? "Developer" : "N/A",
  email: `user${i + 1}@appolo.com`,
  storageUsed: "10GB",
  manageStorage: "1 GB",
}));

const columns = [
  "USER NAME",
  "NAME",
  "DEPARTMENT",
  "ROLE",
  "USER EMAIL",
  "STORAGE USED",
  "MANAGE STORAGE",
  "TOOLS",
];

export default function UserTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [selected, setSelected] = React.useState([]);
  const [createUser, setCreateUser] = useState(false);
  const [checked, setChecked] = useState(false);
  const [rowsData, setRowsData] = useState(rows);

  console.log(selected)
  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleStatusToggle = (index) => {
    const updatedRows = [...rowsData];
    updatedRows[index].status = !updatedRows[index].status;
    setRowsData(updatedRows);
  };

  const handleCreateUser = () => {
    setCreateUser(true);
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.userName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name) => {
    console.log(name)
    const selectedIndex = selected.indexOf(name?.userName);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name?.userName);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "84vh", height: "84vh" }}>
        <Table stickyHeader>
          <TableHead className={styles.tableHeader}>
            <TableRow
              sx={{ boxShadow: "0 -2px 8px 0 rgba(0, 0, 0, 0.2) !important" }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column} align="center">
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row.userName);

                return (
                  <TableRow key={row.userName} hover selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleClick(row)}
                      />
                    </TableCell>
                    <TableCell align="center">{row.userName}</TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.department}</TableCell>
                    <TableCell align="center">{row.role}</TableCell>
                    <TableCell align="center">{row.email}</TableCell>
                    <TableCell align="center">{row.storageUsed}</TableCell>
                    <TableCell align="center">
                      <Select value={row.manageStorage} size="small">
                        <MenuItem value="1 GB">1 GB</MenuItem>
                        <MenuItem value="5 GB">5 GB</MenuItem>
                        <MenuItem value="10 GB">10 GB</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={row.status ? "In Active" : "Pending"}>
                        <Switch
                          checked={row.status}
                          onChange={() =>
                            handleStatusToggle(page * rowsPerPage + index)
                          }
                          inputProps={{ "aria-label": "status switch" }}
                          sx={{
                            "& .MuiSwitch-thumb": {
                              color: row.status ? "blue" : "orange",
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor: row.status
                                ? "blue"
                                : "rgba(255, 165, 0, 0.5)",
                            },
                          }}
                        />
                      </Tooltip>

                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {selected.length > 0 && (
          <Tooltip title="Download Selected">
            <IconButton
              sx={{
                position: "fixed",
                bottom: 20,
                right: 65,
                bgcolor: "blue", // Solid orange background color
                color: "white",
                "&:hover": { bgcolor: "blue" },
              }}
            >
              <FileDownload />
            </IconButton>
          </Tooltip>
        )}
        <IconButton
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            bgcolor: "rgb(251, 68, 36)", // Solid orange background color
            color: "white",
            "&:hover": { bgcolor: "rgb(251, 68, 36)" },
          }}
          onClick={handleCreateUser}
        >
          <Add />
        </IconButton>
      </div>
    </Paper>
  );
}
