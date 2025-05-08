import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, Paper, Button, TextField, Divider,
  CircularProgress, List, ListItem, ListItemButton, ListItemText, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MarketplaceItem, MarketplaceMessage } from './types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const MarketplaceItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const [buyerUsernames, setBuyerUsernames] = useState<Record<number, string>>({});

  const isOwner = currentUser === item?.seller;

  useEffect(() => {
    fetchItemDetails();
    fetchCurrentUser();
  }, [id]);

  useEffect(() => {
    if (item && currentUser) {
      fetchMessages(false);
    }
  }, [item, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedBuyerId]);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/marketplace-items/${id}/`);
      setItem(response.data);
    } catch (err) {
      setError('Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/user-info/');
      setCurrentUser(response.data.id);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchMessages = async (preserveSelected: boolean = true) => {
    try {
      const res = await axios.get('/api/marketplace-messages/');
      const allMsgs: MarketplaceMessage[] = res.data;

      const itemMsgs = allMsgs
        .filter(msg => msg.item === Number(id))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setMessages(itemMsgs);

      if (isOwner) {
        const buyers: Record<number, string> = {};
        itemMsgs.forEach(msg => {
          if (msg.sender !== currentUser) {
            buyers[msg.sender] = msg.sender_username;
          } else if (msg.receiver !== currentUser) {
            buyers[msg.receiver] = msg.receiver_username;
          }
        });
        setBuyerUsernames(buyers);
        if (!preserveSelected || selectedBuyerId === null) {
          const firstBuyerId = Object.keys(buyers)[0];
          if (firstBuyerId) {
            setSelectedBuyerId(Number(firstBuyerId));
          }
        }
      } else {
        setSelectedBuyerId(item?.seller ?? null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !item || !selectedBuyerId || !currentUser) return;

    setSendingMessage(true);
    try {
      await axios.post('/api/marketplace-messages/', {
        item: item.id,
        receiver: isOwner ? selectedBuyerId : item.seller,
        content: messageContent,
      });
      setMessageContent('');
      fetchMessages(true);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMarkAsSold = async () => {
    await axios.post(`/api/marketplace-items/${item?.id}/mark_as_sold/`);
    fetchItemDetails();
  };

  const handleMarkAsUnsold = async () => {
    await axios.post(`/api/marketplace-items/${item?.id}/mark_as_unsold/`);
    fetchItemDetails();
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  if (loading || !item || currentUser === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const filteredMessages = messages.filter(msg =>
    isOwner
      ? (msg.sender === selectedBuyerId || msg.receiver === selectedBuyerId)
      : (msg.sender === currentUser || msg.receiver === currentUser)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => navigate('/marketplace')} sx={{ mb: 2 }}>
        ← Back to Marketplace
      </Button>

      {/* Item Detail Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{item.title}</Typography>
        <Typography>{item.description}</Typography>

        {Array.isArray(item.images) && item.images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {item.images.length === 1 ? (
            // Just show one image without slider
            <img
              src={item.images[0].image}
              alt="Single"
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
            />
          ) : (
            // Render slider only for multiple images
            <Slider {...sliderSettings}>
              {item.images.map((img, idx) => (
                <Box key={idx}>
                  <img
                    src={img.image}
                    alt={`Image ${idx + 1}`}
                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
                  />
                </Box>
              ))}
            </Slider>
          )}
        </Box>
      )}


        <Box sx={{ mt: 2 }}>
          <Chip label={`$${item.price}`} color="primary" sx={{ mr: 1 }} />
          <Chip label={item.item_type} sx={{ mr: 1 }} />
          <Chip label={item.condition} color="secondary" />
          {item.is_sold && <Chip label="Sold" color="error" sx={{ ml: 1 }} />}
        </Box>
        <Typography sx={{ mt: 2 }}>Location: {item.location}</Typography>
        {item.item_pickup_deadline && (
          <Typography>Pickup Deadline: {new Date(item.item_pickup_deadline).toLocaleString()}</Typography>
        )}
        <Typography>Posted by: {item.seller_username}</Typography>

        {isOwner && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/marketplace/edit/${item.id}`)}
            >
              Edit Listing
            </Button>
            <Button
              variant="contained"
              color={item.is_sold ? 'success' : 'secondary'}
              onClick={item.is_sold ? handleMarkAsUnsold : handleMarkAsSold}
            >
              {item.is_sold ? 'Mark as Unsold' : 'Mark as Sold'}
            </Button>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Sidebar for Seller */}
        {isOwner && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 500, overflowY: 'auto' }}>
              <Typography variant="h6">Conversations</Typography>
              <List>
                {Object.entries(buyerUsernames).map(([id, username]) => (
                  <ListItem key={id} disablePadding>
                    <ListItemButton
                      selected={selectedBuyerId === Number(id)}
                      onClick={() => setSelectedBuyerId(Number(id))}
                    >
                      <ListItemText primary={username} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Chat Section */}
        <Grid item xs={12} md={isOwner ? 9 : 12}>
          <Paper sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {isOwner
                ? `Conversation with ${buyerUsernames[selectedBuyerId ?? 0] || 'N/A'}`
                : `Conversation with ${item.seller_username}`}
            </Typography>
            <Divider />
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                mt: 1,
                mb: 2,
                px: 1,
                backgroundColor: '#f9f9f9',
                borderRadius: 1,
              }}
            >
              {filteredMessages.map((msg) => {
                const isMine = msg.sender === currentUser;
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: isMine ? '#1976d2' : '#e0e0e0',
                        color: isMine ? '#fff' : '#000',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: '70%',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketplaceItemDetail;
