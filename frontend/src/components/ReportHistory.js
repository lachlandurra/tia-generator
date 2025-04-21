// ReportHistory.js - New component for report history management
import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Button, Typography, Tooltip, Divider,
  DialogContentText, Box
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';

function ReportHistory({ open, reports, onClose, onSelectReport, onDeleteReport }) {
  const [deleteConfirmation, setDeleteConfirmation] = React.useState(null);
  
  const handleRequestDelete = (index) => {
    setDeleteConfirmation(index);
  };
  
  const handleConfirmDelete = () => {
    if (deleteConfirmation !== null) {
      onDeleteReport(deleteConfirmation);
      setDeleteConfirmation(null);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Report History
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          {reports.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <InfoIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
              <Typography color="textSecondary">
                No reports have been generated yet.
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {reports.map((report, index) => {
                // Use project title or date for report name
                const reportDate = formatDate(new Date().toISOString());
                
                return (
                  <React.Fragment key={index}>
                    <ListItem
                      button
                      onClick={() => onSelectReport(index)}
                      dense
                      sx={{ 
                        py: 2,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText
                        primary={`Report ${index + 1}`}
                        secondary={`Generated on ${reportDate}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="View Report">
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReport(index);
                            }}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Report">
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestDelete(index);
                            }}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < reports.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation !== null}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Report {deleteConfirmation !== null ? deleteConfirmation + 1 : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportHistory;