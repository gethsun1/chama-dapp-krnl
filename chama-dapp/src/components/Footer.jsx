// src/components/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'secondary.main',
        py: 3,
        mt: 'auto', 
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} Chama DApp. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Documentation
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Social Media
          </Link>
          <Link href="#" color="inherit" sx={{ mx: 2 }}>
            Terms of Service
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
