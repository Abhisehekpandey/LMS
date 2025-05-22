import React from "react";
import { makeStyles } from '@mui/styles';
import CircularProgress from '@mui/material/CircularProgress';  

const useStyles = makeStyles((theme) => ({
    loading: {
        position: "fixed",
        left: 0,
        right: 0,
        top: "calc(50% - 20px)",
        margin: "auto",
        height: "40px",
        width: "40px",
        "& img": {
            position: "absolute",
            height: "25px",
            width: "auto",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
            borderRadius: "50%",
            animation: "$rotate 2s linear infinite", // Add animation here
        },
    },
    "@keyframes rotate": {
        "0%": {
            transform: "rotate(0deg)",
        },
        "100%": {
            transform: "rotate(360deg)",
        },
    },
}));

const Loading = (props) => {
    const classes = useStyles();

    return (
        <div className={classes.loading}>
            <img
                src={"/loaderlogo.png"}
                alt="loading"
            />
            <CircularProgress />
        </div>
    );
};

export default Loading;