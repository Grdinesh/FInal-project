// src/features/marketplace/MarketplaceList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  CardActions, Button, Chip, TextField, Select, MenuItem, 
  FormControl, InputLabel, Pagination, CircularProgress 
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MarketplaceItem, MarketplaceFilters } from './types';

const MarketplaceList: React.FC = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: '',
    item_type: '',
    min_price: undefined,
    max_price: undefined,
    is_sold: false,
  });
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchItems();
  }, [filters, page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.item_type) queryParams.append('item_type', filters.item_type);
      if (filters.min_price !== undefined) queryParams.append('min_price', filters.min_price.toString());
      if (filters.max_price !== undefined) queryParams.append('max_price', filters.max_price.toString());
      if (filters.is_sold !== undefined) queryParams.append('is_sold', filters.is_sold.toString());
      
      queryParams.append('page', page.toString());
      
      const response = await axios.get(`/api/marketplace-items/?${queryParams.toString()}`);
      setItems(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per
      // src/features/marketplace/MarketplaceList.tsx (continued)
setItems(response.data.results);
setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
setLoading(false);
setError(null);
    } catch (err) {
      setLoading(false);
      setError('Failed to fetch marketplace items');
      console.error('Error fetching items:', err);
    }
  };

  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    if (key === 'is_sold' && typeof value === 'string') {
      // Convert "true"/"false" strings to boolean
      setFilters({
        ...filters,
        [key]: value === "true",
      });
    } else {
      setFilters({
        ...filters,
        [key]: value,
      });
    }
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const itemTypes = [
    { value: '', label: 'All Categories' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'groceries', label: 'Groceries' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Campus Marketplace
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.item_type}
                label="Category"
                onChange={(e) => handleFilterChange('item_type', e.target.value)}
              >
                {itemTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              variant="outlined"
              value={filters.min_price || ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              variant="outlined"
              value={filters.max_price || ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.is_sold}
                label="Status"
                onChange={(e) => handleFilterChange('is_sold', e.target.value)}
              >
                <MenuItem value="false">Available</MenuItem>
                <MenuItem value="true">Sold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Create Listing Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/marketplace/create"
        >
          Create Listing
        </Button>
      </Box>
      
      {/* Items List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : items.length === 0 ? (
        <Typography>No items found matching your criteria.</Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.images.length > 0 ? item.images[0].image : 'https://via.placeholder.com/300x140?text=No+Image'}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" noWrap>{item.title}</Typography>
                    <Chip 
                      label={`$${item.price}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={item.item_type}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={item.condition}
                      size="small"
                      color="secondary"
                    />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Posted by: {item.seller_username}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    component={Link}
                    to={`/marketplace/${item.id}`}
                  >
                    View Details
                  </Button>
                  {item.is_sold && (
                    <Chip 
                      label="Sold"
                      color="error"
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );
};

export default MarketplaceList;