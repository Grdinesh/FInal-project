// HousingList.tsx with filters and live fetch — UPDATED to include 'is_sold' and average_rating
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, CircularProgress, TextField, CardMedia, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Housing Locator</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField label="Search Title" value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
        <TextField label="City" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Furnished</InputLabel>
          <Select value={filters.is_furnished} onChange={(e) => handleFilterChange('is_furnished', e.target.value)} label="Furnished">
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Wi-Fi</InputLabel>
          <Select value={filters.has_wifi} onChange={(e) => handleFilterChange('has_wifi', e.target.value)} label="Wi-Fi">
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.is_sold} onChange={(e) => handleFilterChange('is_sold', e.target.value)} label="Status">
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="false">Available</MenuItem>
            <MenuItem value="true">Sold</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Min Bedrooms" type="number" value={filters.min_bedrooms} onChange={(e) => handleFilterChange('min_bedrooms', e.target.value)} />
        <TextField label="Min Bathrooms" type="number" value={filters.min_bathrooms} onChange={(e) => handleFilterChange('min_bathrooms', e.target.value)} />
        <TextField label="Min Sq Ft" type="number" value={filters.minSqFt} onChange={(e) => handleFilterChange('minSqFt', e.target.value)} />
        <TextField label="Max Sq Ft" type="number" value={filters.maxSqFt} onChange={(e) => handleFilterChange('maxSqFt', e.target.value)} />
      </Box>

      {/* Create Listing Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/housing/create"
        >
          Create Listing
        </Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={3}>
          {listings.map(item => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={item.images?.[0]?.image || 'https://via.placeholder.com/600x300?text=No+Image'}
                  alt="Listing preview"
                />
                <CardContent>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography>{item.city} • ${item.price}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{item.description.slice(0, 80)}...</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={`${item.bedrooms} Bed`} size="small" sx={{ mr: 1 }} />
                    <Chip label={`${item.bathrooms} Bath`} size="small" sx={{ mr: 1 }} />
                    <Chip label={`Rating: ${item.average_rating?.toFixed(1) ?? 'N/A'}`} size="small" color="info" />
                    {item.is_sold && <Chip label="Sold" size="small" color="error" sx={{ ml: 1 }} />}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/housing/${item.id}`}>View Details</Button>
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
