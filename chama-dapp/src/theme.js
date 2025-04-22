// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Default to light mode
    primary: {
      main: '#000000', // Black buttons for light mode
      contrastText: '#FFFFFF', // White text on black buttons
    },
    secondary: {
      main: '#B0B0B0', // Light gray for secondary elements
    },
    background: {
      default: '#FFFFFF', // White background for the Dapp
      paper: '#FFFFFF', // White background for the Navbar
    },
    text: {
      primary: '#000000', // Black text for readability
      secondary: '#4F4F4F', // Dark gray for secondary text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000', // Default button color (black)
          color: '#FFFFFF', // White text on black buttons
          '&:hover': {
            backgroundColor: '#333333', // Slightly lighter black on hover
          },
        },
      },
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
