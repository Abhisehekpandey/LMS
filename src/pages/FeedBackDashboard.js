import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import { LineChart, PieChart } from "@mui/x-charts";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { AreaChart } from "@mui/x-charts";

const statsData = [
  {
    title: "Total Feedback",
    value: 1746,
    change: "+27%",
    icon: <ChatBubbleIcon color="primary" />,
    color: "green",
  },
  {
    title: "Total Likes",
    value: 474,
    change: "-18%",
    icon: <ThumbUpIcon color="success" />,
    color: "red",
  },
  {
    title: "Total Dislikes",
    value: 802,
    change: "+12%",
    icon: <ThumbDownIcon color="error" />,
    color: "green",
  },
  {
    title: "Pending Actions",
    value: 635,
    change: "-5%",
    icon: <PendingActionsIcon color="warning" />,
    color: "red",
  },
];

const trendData = [
  { month: "Mar", likes: 278, dislikes: 107 },
  { month: "Apr", likes: 311, dislikes: 128 },
  { month: "May", likes: 344, dislikes: 149 },
  { month: "Jun", likes: 377, dislikes: 170 },
  { month: "Jul", likes: 410, dislikes: 191 },
  { month: "Aug", likes: 395, dislikes: 264 },
  { month: "Sep", likes: 476, dislikes: 300 },
];

const feedbackSourceData = [
  { label: "DocuTalk", value: 76 },
  { label: "DBTalk", value: 24 },
];

const contributionData = [
  { label: "User", value: 64 },
  { label: "Department", value: 36 },
];

export default function FeedbackDashboard() {
  return (
    <Box
      sx={{
        p: 2,
        ml: "75px",
      }}
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsData.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                p: 2,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ "& svg": { fontSize: 56 } }}>{stat.icon}</Box>

                  <Box>
                    <Typography
                      sx={{
                        color: stat.color,
                        fontWeight: 700, 
                        fontSize: "1.2rem", 
                        letterSpacing: "0.5px", 
                      }}
                    >
                      {stat.change} From Last Month
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {stat.value}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.primary"
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              boxShadow: 4,
              height: 400,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                borderBottom: 1,
                borderColor: "divider",
                pb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Feedback Trend
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#2ECC71",
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="caption">Likes</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#E74C3C",
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="caption">Dislikes</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <LineChart
                xAxis={[{ dataKey: "month", scaleType: "band" }]}
                series={[
                  {
                    dataKey: "likes",
                    label: "Likes",
                    color: "#2ECC71", 
                    lineWidth: 3,
                    curve: "monotoneX",
                    area: true,
                    showMark: true,
                    fill: "url(#likesGradient)",
                  },
                  {
                    dataKey: "dislikes",
                    label: "Dislikes",
                    color: "#E74C3C", 
                    lineWidth: 3,
                    curve: "monotoneX",
                    area: true,
                    showMark: true,
                    fill: "url(#dislikesGradient)",
                  },
                ]}
                dataset={trendData}
                height={300}
                slotProps={{
                  xAxis: {
                    tickLine: false,
                    axisLine: { stroke: "#ccc" },
                  },
                  yAxis: {
                    tickLine: false,
                    axisLine: { stroke: "#ccc" },
                  },
                  legend: {
                    position: { vertical: "top", horizontal: "middle" },
                    padding: 10,
                  },
                  tooltip: { trigger: "item" },
                }}
                grid={{ horizontal: true, vertical: false }}
                defs={
                  <>
                    <linearGradient
                      id="likesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2ECC71"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#2ECC71" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="dislikesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#E74C3C"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#E74C3C" stopOpacity={0} />
                    </linearGradient>
                  </>
                }
              />
            </Box>
          </Card>
        </Grid>

       

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              boxShadow: 4,
              height: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Feedback Source
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PieChart
                series={[
                  {
                    data: feedbackSourceData.map((item, i) => ({
                      ...item,
                      label: `${item.label} (${item.value}%)`,
                      color: ["#2ECC71", "#3498DB", "#9B59B6", "#F1C40F"][
                        i % 4
                      ],
                    })),
                    innerRadius: 0,
                    outerRadius: 80,
                    labelPosition: "outside", // 👈 move labels outside with leader lines
                    paddingAngle: 3,
                  },
                ]}
                height={250}
                margin={{ top: 10, bottom: 50, left: 20, right: 20 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: 10,
                    itemMarkWidth: 18,
                    itemMarkHeight: 12,
                    labelStyle: {
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    },
                  },
                  tooltip: { trigger: "item" },
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              boxShadow: 4,
              height: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Feedback Contribution
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <PieChart
                series={[
                  {
                    data: contributionData.map((item, i) => ({
                      ...item,
                      label: `${item.label} (${item.value}%)`,
                      color: ["#1ABC9C", "#E67E22", "#E74C3C", "#8E44AD"][
                        i % 4
                      ],
                    })),
                    innerRadius: 45,
                    outerRadius: 85,
                    labelPosition: "outside", // 👈 labels outside with leader lines
                    paddingAngle: 3,
                  },
                ]}
                height={250}
                margin={{ top: 10, bottom: 50, left: 20, right: 20 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: 10,
                    itemMarkWidth: 18,
                    itemMarkHeight: 12,
                    labelStyle: {
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    },
                  },
                  tooltip: { trigger: "item" },
                }}
              />

             
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {contributionData.reduce((sum, d) => sum + d.value, 0)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
