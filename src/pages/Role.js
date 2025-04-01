import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Role({ departments, onThemeToggle }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const [orderBy, setOrderBy] = useState("role");
  const [order, setOrder] = useState("asc");

  // Transform departments data to role-centric view
  const roles = React.useMemo(() => {
    if (!departments) return [];

    return departments.reduce((acc, dept) => {
      dept.roles.forEach((role) => {
        acc.push({
          role: role,
          department: dept.name,
        });
      });
      return acc;
    }, []);
  }, [departments]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRoles = React.useMemo(() => {
    return [...roles].sort((a, b) => {
      return order === "asc"
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });
  }, [roles, order, orderBy]);

  // Add this styled component after imports
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      cursor: "pointer",
    },
  }));

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 2,
          marginLeft: 0,
          transition: "margin-left 0.3s",
          overflow: "hidden",
        }}
      >
        <Navbar onThemeToggle={onThemeToggle} />
        <Box sx={{ p: 3, marginLeft: "50px", overflow: "hidden" }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "role"}
                      direction={orderBy === "role" ? order : "asc"}
                      onClick={() => handleRequestSort("role")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Role Name
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "department"}
                      direction={orderBy === "department" ? order : "asc"}
                      onClick={() => handleRequestSort("department")}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        Department
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role, index) => (
                    <StyledTableRow key={index}>
                      <TableCell>{role.role}</TableCell>
                      <TableCell>{role.department}</TableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={roles.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[8]}
            sx={{ marginTop: 2 }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Role;
