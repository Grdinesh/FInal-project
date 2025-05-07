// src/features/marketplace/MarketplaceItemDetail.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Divider, List, ListItem, ListItemText, 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MarketplaceItem, MarketplaceMessage } from './types';

const MarketplaceItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageDialog, setMessageDialog] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  
  useEffect(() => {
    fetchItemDetails();
    fetchCurrentUser();
  }, [id]);
  
  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/marketplace-items/${id}/`);
      setItem(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to fetch item details');
      console.error('Error fetching item:', err);
    }
  };
  
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/users/current/');
      setCurrentUser(response.data.id);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };
  
  const fetchMessages = async () => {
    if (!item || !currentUser) return;
    
    try {
      const response = await axios.get(`/api/marketplace-messages/by_item/?item_id=${id}&other_user_id=${item.seller}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };
  
  const handleSendMessage = async () => {
    if (!item || !currentUser || !messageContent.trim()) return;
    
    setSendingMessage(true);
    try {
      await axios.post('/api/marketplace-messages/', {
        item: item.id,
        receiver: item.seller,
        content: messageContent,
      });
      
      setMessageContent('');
      setMessageDialog(false);
      // Refetch messages if they're already showing
      if (messages.length > 0) {
        fetchMessages();
      }
      setSendingMessage(false);
    } catch (err) {
      setSendingMessage(false);
      console.error('Error sending message:', err);
    }
  };
  
  const handleMarkAsSold = async () => {
    if (!item) return;
    
    try {
      await axios.post(`/api/marketplace-items/${id}/mark_as_sold/`);
      // Refetch the item details to update the UI
      fetchItemDetails();
    } catch (err) {
      console.error('Error marking item as sold:', err);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !item) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Item not found'}</Typography>
        <Button onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </Box>
    );
  }
  
  const isOwner = currentUser === item.seller;
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => navigate('/marketplace')}>
          ← Back to Marketplace
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Item Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            {item.images.length > 0 ? (
              <Box sx={{ width: '100%' }}>
                {/* In a real application, implement a carousel component here */}
                <img 
                  src={item.images[0].image} 
                  alt={item.title} 
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 300, 
                  bgcolor: 'grey.200', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 1,
                }}
              >
                <Typography>No images available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Item Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">{item.title}</Typography>
              <Chip 
                label={`$${item.price}`}
                color="primary"
                size="medium"
                />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={item.item_type}
                sx={{ mr: 1 }}
              />
              <Chip 
                label={item.condition}
                color="secondary"
              />
              {item.is_sold && (
                <Chip 
                  label="Sold"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Location:</Typography>
              <Typography variant="body2" gutterBottom>{item.location}</Typography>
              
              {item.item_pickup_deadline && (
                <>
                  <Typography variant="subtitle2">Pickup Deadline:</Typography>
                  <Typography variant="body2" gutterBottom>
                    {new Date(item.item_pickup_deadline).toLocaleDateString()}
                  </Typography>
                </>
              )}
              
              <Typography variant="subtitle2">Posted By:</Typography>
              <Typography variant="body2" gutterBottom>{item.seller_username}</Typography>
              
              <Typography variant="subtitle2">Posted On:</Typography>
              <Typography variant="body2" gutterBottom>
                {new Date(item.posted_date).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {!isOwner && !item.is_sold && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setMessageDialog(true)}
                >
                  Contact Seller
                </Button>
              )}
              
              {isOwner && !item.is_sold && (
                <>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/marketplace/edit/${item.id}`)}
                  >
                    Edit Listing
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={handleMarkAsSold}
                  >
                    Mark as Sold
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Messages Section - visible only to the seller and if there are messages */}
        {(isOwner || messages.length > 0) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              
              {messages.length === 0 ? (
                <Typography>No messages yet.</Typography>
              ) : (
                <List>
                  {messages.map((msg) => (
                    <ListItem key={msg.id} alignItems="flex-start">
                      <ListItemText
                        primary={`From: ${msg.sender_username === item.seller_username ? 'Seller' : 'You'}`}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {msg.content}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {new Date(msg.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Message Dialog */}
      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)}>
        <DialogTitle>Contact Seller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageContent.trim() || sendingMessage}
          >
            {sendingMessage ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplaceItemDetail;