import { createTheme } from '@mui/material/styles';

// Define your theme
const theme = createTheme({
  typography: {
    fontFamily: '"Be Vietnam", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Be Vietnam';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Be Vietnam'), local('BeVietnam-Regular');
        }
      `,
    },
  },
});

export default theme;