// HousingDetail.tsx — Now handles single/no image without slider
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { HousingListing, HousingMessage } from './types';
import { fetchHousingById } from './api';
import { useAuth } from '../../contexts/AuthContext';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

interface HousingImage {
  id: number;
  image: string;
}

const HousingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<HousingListing & { images?: HousingImage[] } | null>(null);
  const [messages, setMessages] = useState<HousingMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [usernames, setUsernames] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser === item?.posted_by;

  useEffect(() => {
    fetchHousingDetails();
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
  }, [messages, selectedUserId]);

  const fetchHousingDetails = async () => {
    setLoading(true);
    const data = await fetchHousingById(Number(id));
    setItem(data);
    setLoading(false);
  };


  if (item) {
    item.latitude = item.latitude ?? 37.335480;  // default to San Jose latitude
    item.longitude = item.longitude ?? -121.893028; // default to San Jose longitude
  }


  const fetchCurrentUser = async () => {
    const res = await axios.get('/api/auth/user-info/');
    setCurrentUser(res.data.id);
  };

  const fetchMessages = async (preserveSelected = true) => {
    const res = await axios.get('/api/housing-messages/');
    const allMsgs = res.data.filter((msg: HousingMessage) => msg.item === Number(id));
    setMessages(allMsgs);

    if (isOwner) {
      const senders: Record<number, string> = {};
      allMsgs.forEach((msg: { sender: number; sender_username: string; receiver: number; receiver_username: string; }) => {
        if (msg.sender !== currentUser) {
          senders[msg.sender] = msg.sender_username;
        } else if (msg.receiver !== currentUser) {
          senders[msg.receiver] = msg.receiver_username;
        }
      });
      setUsernames(senders);
      if (!preserveSelected || selectedUserId === null) {
        const firstId = Object.keys(senders)[0];
        if (firstId) setSelectedUserId(Number(firstId));
      }
    } else {
      setSelectedUserId(item?.posted_by ?? null);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !item || !selectedUserId || !currentUser) return;
    await axios.post('/api/housing-messages/', {
      item: item.id,
      receiver: isOwner ? selectedUserId : item.posted_by,
      content: messageContent,
    });
    setMessageContent('');
    fetchMessages(true);
  };

  const filteredMessages = messages.filter(msg =>
    isOwner
      ? (msg.sender === selectedUserId || msg.receiver === selectedUserId)
      : (msg.sender === currentUser || msg.receiver === currentUser)
  );

  const handleMarkAsSold = async () => {
    await axios.post(`/api/housing/${item?.id}/mark_as_sold/`);
    fetchHousingDetails();
  };
  
  const handleMarkAsUnsold = async () => {
    await axios.post(`/api/housing/${item?.id}/mark_as_unsold/`);
    fetchHousingDetails();
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  const uniqueImages = (item.images && item.images.length > 0)
    ? item.images.filter((img, idx, arr) =>
        arr.findIndex(i => i.image === img.image) === idx
      )
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => navigate('/housing')} sx={{ mb: 2 }}>← Back to Listings</Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{item.title}</Typography>
        <Typography>{item.description}</Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label={`$${item.price}`} color="primary" sx={{ mr: 1 }} />
          <Chip label={`${item.bedrooms} Bedrooms`} sx={{ mr: 1 }} />
          <Chip label={`${item.bathrooms} Bathrooms`} sx={{ mr: 1 }} />
          {item.is_furnished && <Chip label="Furnished" color="success" sx={{ mr: 1 }} />}
          {item.has_wifi && <Chip label="Wi-Fi" color="info" />}
        </Box>
        <Typography sx={{ mt: 2 }}>{item.city} • {item.square_feet} sq ft</Typography>

        <Box sx={{ mt: 3, width: '100%', maxWidth: 800, mx: 'auto' }}>
          {uniqueImages.length === 0 && (
            <img
              src="https://via.placeholder.com/800x400?text=No+Image+Available"
              alt="No Image"
              style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
            />
          )}
          {uniqueImages.length === 1 && (
            <img
              src={uniqueImages[0].image}
              alt="Listing"
              style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
            />
          )}
          {uniqueImages.length > 1 && (
            <Slider {...sliderSettings}>
              {uniqueImages.map((img, idx) => (
                <Box key={img.id ?? idx} sx={{ px: 1 }}>
                  <img
                    src={img.image}
                    alt={`Image ${idx + 1}`}
                    style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              ))}
            </Slider>
          )}
        </Box>
        <Typography sx={{ mt: 2 }}>Posted by: {user?.id === item.posted_by ? user.username : `User ${item.posted_by}`}</Typography>

        {isOwner && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/housing/edit/${item.id}`)}
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

      {item.latitude && item.longitude && (
        <Box sx={{ mt: 4, height: 400 }}>
          <Typography variant="h6" gutterBottom>Location</Typography>
          <MapContainer center={[item.latitude, item.longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[item.latitude, item.longitude]}>
              <Popup>{item.address}</Popup>
            </Marker>
          </MapContainer>
        </Box>
      )}


      <Grid container spacing={3}>
        {isOwner && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 500, overflowY: 'auto' }}>
              <Typography variant="h6">Conversations</Typography>
              <List>
                {Object.entries(usernames).map(([id, username]) => (
                  <ListItem key={id} disablePadding>
                    <ListItemButton
                      selected={selectedUserId === Number(id)}
                      onClick={() => setSelectedUserId(Number(id))}
                    >
                      <ListItemText primary={username} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={isOwner ? 9 : 12}>
          <Paper sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {isOwner
                ? `Conversation with ${usernames[selectedUserId ?? 0] || 'N/A'}`
                : `Conversation with Poster`}
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
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

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
                disabled={!messageContent.trim()}
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

export default HousingDetail;
