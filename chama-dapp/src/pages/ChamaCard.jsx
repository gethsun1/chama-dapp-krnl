// src/components/ChamaCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy, WhatsApp, Telegram, Twitter, Email } from "@mui/icons-material";

const ChamaCard = ({ chama }) => {
  // State to control the share modal visibility
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // State to manage the snackbar for copied link confirmation
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  // Generate a shareable URL for the specific Chama
  const shareUrl = `https://chama-dapp.vercel.app/chama/${chama.id}`;

  // Function to copy the share URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySnackbarOpen(true);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  // Placeholder function for contributing, can be expanded later
  const handleContribute = () => {
    alert(`Contribute to ${chama.name} coming soon!`);
  };

  return (
    <>
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardHeader title={chama.name} />
        <CardContent>
          {/* Display Chama details with formatted cycle duration */}
          <Typography variant="body2" color="text.secondary">
            <strong>Cycle:</strong> {chama.cycleDuration ? 
              (Number(chama.cycleDuration) === 86400 ? "Daily" : 
              Number(chama.cycleDuration) === 604800 ? "Weekly" : 
              Number(chama.cycleDuration) === 2592000 ? "Monthly" : 
              `${chama.cycleDuration} sec`) 
              : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Deposit:</strong> {chama.depositAmount ? `${chama.depositAmount} ETH` : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Contribution:</strong> {chama.contributionAmount ? `${chama.contributionAmount} ETH` : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Penalty:</strong> {chama.penalty ? `${chama.penalty}%` : "N/A"}
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
          <Button variant="contained" color="primary" onClick={handleContribute}>
            Contribute
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setShareModalOpen(true)}>
            Invite Members
          </Button>
        </Box>
      </Card>

      {/* Share Modal for inviting members */}
      <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Invite Members to {chama.name}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Share this link to invite members:
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {shareUrl}
            </Typography>
            <IconButton onClick={handleCopyUrl} title="Copy Share URL">
              <ContentCopy />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item>
              <IconButton color="primary" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <WhatsApp />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton color="secondary" onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Telegram />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton color="primary" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Twitter />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton color="primary" onClick={() => window.location.href = `mailto:?subject=Join%20Chama&body=${encodeURIComponent(shareUrl)}`}> 
                <Email />
              </IconButton>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareModalOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification when URL is copied */}
      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setCopySnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopySnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          Share URL copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChamaCard;
