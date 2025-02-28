import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    h1: {
      fontSize: "2.8rem",
    },
    h2: {
      fontSize: "2.3rem",
    },
    h3: {
      fontWeight: 400,
      fontSize: "2rem",
    },
    h4: {
      fontSize: "1.7rem",
    },
  },
});

export default theme;
