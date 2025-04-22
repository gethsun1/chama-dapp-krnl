// src/components/NavigationBar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import Web3ModalButton from "./Web3ModalButton";
import { useAppKitAccount } from '@reown/appkit/react';
import heroLogo from "../assets/hero-logo.svg";

const NavigationBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isConnected, address } = useAppKitAccount();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Create Chama", path: "/create-chama" },
    { title: "Join Chama", path: "/join-chama" },
    { title: "Dashboard", path: "/dashboard" },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <img src={heroLogo} alt="Chama DApp Logo" style={{ height: "40px" }} />
        </Box>
        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <Box
                sx={{
                  width: 250,
                  bgcolor: "white",
                  height: "100vh",
                }}
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
              >
                <List>
                  {navLinks.map((link, index) => (
                    <ListItem
                      button
                      key={index}
                      component={Link}
                      to={link.path}
                      sx={{
                        transition:
                          "transform 0.3s, background-color 0.3s, box-shadow 0.3s",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#e0e0e0",
                          transform: "scale(1.03)",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={link.title}
                        sx={{
                          color: "black",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          navLinks.map((link, index) => (
            <Button
              key={index}
              component={Link}
              to={link.path}
              sx={{ color: "white", textTransform: "none", mx: 1 }}
            >
              {link.title}
            </Button>
          ))
        )}
        <Box sx={{ ml: 2 }}>
          <Web3ModalButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
