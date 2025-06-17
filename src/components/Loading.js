// export default Loading;
import React from "react";
import { CircularProgress, Box } from "@mui/material";

const Loading = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "calc(50% - 20px)",
        left: 0,
        right: 0,
        margin: "auto",
        height: "40px",
        width: "40px",
      }}
    >
      <Box
        component="img"
        src="/loaderlogo.png"
        alt="loading"
        sx={{
          position: "absolute",
          height: "25px",
          width: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          margin: "auto",
          borderRadius: "50%",
          animation: "rotate 2s linear infinite",
        }}
      />
      <CircularProgress />
      <style>
        {`
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Loading;
