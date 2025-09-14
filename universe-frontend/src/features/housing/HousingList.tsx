// HousingList.tsx with filters and live fetch — UPDATED to include 'is_sold' and average_rating
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, TextField, CardMedia, FormControl, InputLabel, Select, MenuItem,
  Paper, InputAdornment, Skeleton
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  Bed, 
  Bathtub, 
  SquareFoot, 
  Wifi, 
  Chair, 
  Star,
  Add,
  FilterList
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { HousingListing } from './types';
import { fetchHousingListings } from './api';

const HousingList: React.FC = () => {
  const [listings, setListings] = useState<(HousingListing & { images?: { id: number; image: string }[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: '',
    city: '',
    is_furnished: '',
    has_wifi: '',
    is_sold: 'false',
    min_bedrooms: '',
    min_bathrooms: '',
    minSqFt: '',
    maxSqFt: ''
  });

  const loadListings = useCallback(async () => {
    setLoading(true);
    const params: any = {};
    if (filters.title) params.title__icontains = filters.title;
    if (filters.city) params.city__icontains = filters.city.trim();
    if (filters.is_furnished) params.is_furnished = filters.is_furnished;
    if (filters.has_wifi) params.has_wifi = filters.has_wifi;
    if (filters.is_sold !== '') params.is_sold = filters.is_sold;
    if (filters.min_bedrooms) params.bedrooms__gte = filters.min_bedrooms;
    if (filters.min_bathrooms) params.bathrooms__gte = filters.min_bathrooms;
    if (filters.minSqFt) params.square_feet__gte = filters.minSqFt;
    if (filters.maxSqFt) params.square_feet__lte = filters.maxSqFt;

    const data = await fetchHousingListings(params);
    setListings(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Housing Locator
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Find your perfect home near campus
        </Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search Filters
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              fullWidth
              label="Search Title" 
              value={filters.title} 
              onChange={(e) => handleFilterChange('title', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              fullWidth
              label="City" 
              value={filters.city} 
              onChange={(e) => handleFilterChange('city', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Furnished</InputLabel>
              <Select value={filters.is_furnished} onChange={(e) => handleFilterChange('is_furnished', e.target.value)} label="Furnished">
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Wi-Fi</InputLabel>
              <Select value={filters.has_wifi} onChange={(e) => handleFilterChange('has_wifi', e.target.value)} label="Wi-Fi">
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={filters.is_sold} onChange={(e) => handleFilterChange('is_sold', e.target.value)} label="Status">
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="false">Available</MenuItem>
                <MenuItem value="true">Sold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField 
              fullWidth
              label="Min Bedrooms" 
              type="number" 
              value={filters.min_bedrooms} 
              onChange={(e) => handleFilterChange('min_bedrooms', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Bed />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField 
              fullWidth
              label="Min Bathrooms" 
              type="number" 
              value={filters.min_bathrooms} 
              onChange={(e) => handleFilterChange('min_bathrooms', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Bathtub />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField 
              fullWidth
              label="Min Sq Ft" 
              type="number" 
              value={filters.minSqFt} 
              onChange={(e) => handleFilterChange('minSqFt', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SquareFoot />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField 
              fullWidth
              label="Max Sq Ft" 
              type="number" 
              value={filters.maxSqFt} 
              onChange={(e) => handleFilterChange('maxSqFt', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SquareFoot />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Create Listing Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/housing/create"
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
            }
          }}
        >
          Create Listing
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} />
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton variant="rounded" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : listings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
            No housing listings found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Try adjusting your search filters or create a new listing
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/housing/create"
            startIcon={<Add />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Create First Listing
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {listings.map(item => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    '& .card-image': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    className="card-image"
                    component="img"
                    height="200"
                    image={item.images?.[0]?.image || 'https://via.placeholder.com/600x300?text=No+Image'}
                    alt="Listing preview"
                    sx={{
                      transition: 'transform 0.3s ease',
                      objectFit: 'cover'
                    }}
                  />
                  {item.is_sold && (
                    <Chip 
                      label="Sold" 
                      color="error" 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        fontWeight: 600
                      }} 
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.city}
                    </Typography>
                    <Typography variant="h6" sx={{ ml: 'auto', color: 'primary.main', fontWeight: 700 }}>
                      ${item.price.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.4 }}>
                    {item.description.slice(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      icon={<Bed />}
                      label={`${item.bedrooms} Bed`} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip 
                      icon={<Bathtub />}
                      label={`${item.bathrooms} Bath`} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    {item.is_furnished && (
                      <Chip 
                        icon={<Chair />}
                        label="Furnished" 
                        size="small" 
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {item.has_wifi && (
                      <Chip 
                        icon={<Wifi />}
                        label="Wi-Fi" 
                        size="small" 
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                  
                  {item.average_rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.average_rating.toFixed(1)} rating
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    component={Link} 
                    to={`/housing/${item.id}`}
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default HousingList;
