import React from "react";
import { Box, Typography } from "@mui/material";

const LicenseExpiryLegend = () => {
    const legendItems = [
        { label: "EXPIRED", color: "#FF0000" },
        { label: "IMMEDIATE ACTION REQUIRED", color: "#FF6B00" },
        { label: "CRITICAL", color: "#FFD700" },
        { label: "GOOD", color: "#4CAF50" },
    ];

    return (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
            {legendItems.map((item) => (
                <Box
                    key={item.label}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            backgroundColor: item.color,
                        }}
                    />
                    <Typography sx={{ fontSize: 13 }}>{item.label}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default LicenseExpiryLegend;
