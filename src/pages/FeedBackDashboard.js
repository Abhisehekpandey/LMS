import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Tooltip } from "@mui/material";
import { LineChart, PieChart } from "@mui/x-charts";
import CountUp from "react-countup";

const trendData = [
  { month: "Sun", likes: 420, dislikes: 260 },
  { month: "Mon", likes: 380, dislikes: 120 },
  { month: "Tue", likes: 680, dislikes: 710 },
  { month: "Wed", likes: 450, dislikes: 360 },
  { month: "Thu", likes: 500, dislikes: 380 },
  { month: "Fri", likes: 640, dislikes: 420 },
  { month: "Sat", likes: 920, dislikes: 220 },
];

const sourceSeries = [
  { label: "DocuTalk", value: 55, color: "#42A5F5" },
  { label: "DBTalk", value: 45, color: "#66BB6A" },
];

const contributionSeries = [
  { label: "User", value: 40, color: "#7b61ff" },
  { label: "Department", value: 17, color: "#16c098" },
  { label: "Other", value: 13, color: "#ff4f6d" },
];

const pageBg = "#f4f6f8";
const cardBg = "#ffffff";
const cardShadow = "0 8px 24px rgba(44, 60, 80, 0.06)";

export default function FeedBackDashboard() {
  const [range, setRange] = React.useState("weekly");
  const [statsData, setStatsData] = useState([]);

  const handleRange = (e, val) => {
    if (val) setRange(val);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${window.__ENV__.REACT_APP_ROUTE}/mainGpt/getDashboardData`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
              username: `${sessionStorage.getItem("adminEmail")}`,
            },
          }
        );

        const data = res.data;

        const mappedStats = [
          {
            key: "feedback",
            label: "Total Feedback",
            value: data.totalFeedback,
            changePct: data.feedbackChangePercent,
            icon: "/icons/feedback.png",
            accentBg: "rgba(37, 211, 102, 0.12)",
          },
          {
            key: "likes",
            label: "Total Likes",
            value: data.totalLikes,
            changePct: data.likesChangePercent,
            icon: "/icons/likes.png",
            accentBg: "rgba(105, 92, 255, 0.08)",
          },
          {
            key: "dislikes",
            label: "Total Dislikes",
            value: data.totalDislikes,
            changePct: data.dislikesChangePercent,
            icon: "/icons/dislikes.png",
            accentBg: "rgba(255, 99, 132, 0.08)",
          },
          {
            key: "pending",
            label: "Pending Actions",
            value: 0, // backend didn’t provide pending count
            changePct: 0,
            icon: "/icons/pending.png",
            accentBg: "rgba(18, 140, 126, 0.08)",
          },
        ];

        setStatsData(mappedStats);
      } catch (error) {
        console.error("Error fetching feedback stats:", error);
      }
    };

    fetchStats();
  }, []);

  const dataset = trendData.map((d) => ({
    ...d,
    total: (d.likes + d.dislikes) * 0.7,
  }));

  return (
    <Box
      sx={{
        bgcolor: pageBg,
        minHeight: "100vh",
        p: 6,
        ml: "75px", // 👈 matches sidebar width
        transition: "margin 0.3s ease",
      }}
    >
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <Card
              elevation={0}
              sx={{
                bgcolor: cardBg,
                borderRadius: 3,
                boxShadow: cardShadow,
                overflow: "visible",
                px: 2,
                py: 1.8,
                minHeight: 100,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: s.accentBg,
                  boxShadow: "0 6px 18px rgba(19, 39, 63, 0.04)",
                }}
              >
                <img
                  src={s.icon}
                  alt={`${s.key}-icon`}
                  style={{ width: 34, height: 34, objectFit: "contain" }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h5" fontWeight={800} color="#1f2937">
                    <CountUp end={s.value} duration={1.2} separator="," />
                  </Typography>

                  <Tooltip
                    title={
                      s.changePct >= 0
                        ? `${Math.abs(s.changePct)}% increase from last month`
                        : `${Math.abs(s.changePct)}% decrease from last month`
                    }
                    arrow
                    placement="top"
                  >
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: s.changePct >= 0 ? "#1bb77b" : "#ff6b6b",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "default", // 👈 makes it feel like hoverable text
                      }}
                    >
                      {s.changePct >= 0 ? "▲" : "▼"}{" "}
                      <span style={{ opacity: 0.95 }}>
                        {Math.abs(s.changePct)}%
                      </span>
                    </Typography>
                  </Tooltip>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", mt: 0.6, fontWeight: 600 }}
                >
                  {s.label}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              bgcolor: cardBg,
              borderRadius: 3,
              boxShadow: cardShadow,
              p: 2.5,
              minHeight: 420,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600, // 👈 slightly lighter than 800
                  color: "#1e293b", // 👈 softer dark gray instead of pure black
                  letterSpacing: 0.3, // 👈 adds subtle breathing space
                }}
              >
                Feedback Growth
              </Typography>

              <ToggleButtonGroup
                value={range}
                exclusive
                onChange={handleRange}
                sx={{
                  ".MuiToggleButton-root": {
                    borderRadius: 99,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.5,
                    fontSize: 13,
                  },
                  ".MuiToggleButton-root.Mui-selected": {
                    bgcolor: "#fff",
                    color: "#111827",
                    boxShadow: "0 6px 18px rgba(19,39,63,0.06)",
                  },
                }}
              >
                <ToggleButton value="day">Day</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ height: 340 }}>
              <LineChart
                xAxis={[{ dataKey: "month", scaleType: "band" }]}
                dataset={dataset}
                series={[
                  {
                    dataKey: "dislikes",
                    label: "Dislikes",
                    color: "#ff4f6d",
                    lineWidth: 3,
                    curve: "monotoneX",
                    showMark: true,
                    markStyle: { size: 8, strokeWidth: 0, shadowBlur: 8 },
                    area: false,
                  },
                  {
                    dataKey: "likes",
                    label: "Likes",
                    color: "#7b61ff",
                    lineWidth: 3,
                    curve: "monotoneX",
                    showMark: true,
                    markStyle: { size: 8, strokeWidth: 0, shadowBlur: 8 },
                    area: false,
                  },
                ]}
                height={340}
                grid={{ horizontal: true, vertical: false }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3.5}>
          <Card
            sx={{
              bgcolor: cardBg,
              borderRadius: 3,
              boxShadow: cardShadow,
              p: 2.5,
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600, // 👈 softer than 800
                color: "#1e293b", // 👈 modern dark gray
                letterSpacing: 0.3, // 👈 subtle spacing for readability
                alignSelf: "flex-start",
                mb: 1.5,
              }}
            >
              Feedback Contribution
            </Typography>

            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <PieChart
                series={[
                  {
                    data: contributionSeries.map((item) => ({
                      value: item.value,
                      color: item.color,
                    })),
                    innerRadius: 70,
                    outerRadius: 110,
                    paddingAngle: 3,

                    label: {
                      visible: true,
                      position: "outside",
                      renderLabel: (params) => {
                        const total = contributionSeries.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );
                        const percentage = (
                          (params.value / total) *
                          100
                        ).toFixed(1);
                        return (
                          <Box
                            sx={{
                              bgcolor: "#fff",
                              borderRadius: "50%",
                              width: 56,
                              height: 56,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 8px 22px rgba(2,6,23,0.12)",
                            }}
                          >
                            <Typography fontWeight={800}>
                              {percentage}%
                            </Typography>
                          </Box>
                        );
                      },
                    },
                  },
                ]}
                height={260}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 4,
                mt: 4,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {contributionSeries.map((s) => {
                const total = contributionSeries.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
                const percentage = ((s.value / total) * 100).toFixed(1);

                return (
                  <Box
                    key={s.label}
                    sx={{ display: "flex", gap: 1, alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: s.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography sx={{ fontWeight: 600, color: "#374151" }}>
                      {s.label} ({percentage}%)
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3.5}>
          <Card
            sx={{
              bgcolor: cardBg,
              borderRadius: 3,
              boxShadow: cardShadow,
              p: 2.5,
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600, // softer, balanced
                color: "#1e293b", // modern dark gray
                letterSpacing: 0.3, // subtle spacing for clarity
                alignSelf: "flex-start",
                mb: 1.5,
              }}
            >
              Feedback Source
            </Typography>

            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <PieChart
                series={[
                  {
                    data: sourceSeries.map((item) => ({
                      value: item.value,
                      color: item.color,
                    })),
                    innerRadius: 70,
                    outerRadius: 110,
                    paddingAngle: 3,
                    label: {
                      visible: true,
                      position: "outside",
                      renderLabel: (params) => {
                        const total = sourceSeries.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );
                        const percentage = (
                          (params.value / total) *
                          100
                        ).toFixed(1);
                        return (
                          <Box
                            sx={{
                              bgcolor: "#fff",
                              borderRadius: "50%",
                              width: 56,
                              height: 56,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 8px 22px rgba(2,6,23,0.12)",
                            }}
                          >
                            <Typography fontWeight={800}>
                              {percentage}%
                            </Typography>
                          </Box>
                        );
                      },
                    },
                  },
                ]}
                height={260}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 4,
                mt: 4,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {sourceSeries.map((s) => {
                const total = sourceSeries.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
                const percentage = ((s.value / total) * 100).toFixed(1);

                return (
                  <Box
                    key={s.label}
                    sx={{ display: "flex", gap: 1, alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: s.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography sx={{ fontWeight: 600, color: "#374151" }}>
                      {s.label} ({percentage}%)
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
