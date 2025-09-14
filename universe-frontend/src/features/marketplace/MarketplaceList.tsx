import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  CardActions, Button, Chip, TextField, Select, MenuItem,
  FormControl, InputLabel, Pagination, CircularProgress,
  Paper, InputAdornment, Skeleton
} from '@mui/material';
import { 
  Search, 
  Category, 
  AttachMoney, 
  Add,
  FilterList,
  Star,
  Person,
  Edit,
  Message
} from '@mui/icons-material';
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchItems();
  }, [filters, page]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/user-info/');
      setCurrentUserId(res.data.id);
    } catch (err) {
      console.error('Failed to fetch current user', err);
    }
  };

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
      console.log(response,'dxshidhi');
      setItems(response.data);
      setTotalPages(Math.ceil(response.data.count / 10));
      setError(null);
    } catch (err) {
      setError('Failed to fetch marketplace items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === 'is_sold' && typeof value === 'string' ? value === 'true' : value,
    }));
    setPage(1);
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Campus Marketplace
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Buy, sell, and trade with fellow students
        </Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search & Filter
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search items"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.item_type}
                label="Category"
                onChange={(e) => handleFilterChange('item_type', e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Category />
                  </InputAdornment>
                }
              >
                {itemTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              variant="outlined"
              value={filters.min_price ?? ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              variant="outlined"
              value={filters.max_price ?? ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={(filters.is_sold ?? false).toString()}
                label="Status"
                onChange={(e) => handleFilterChange('is_sold', e.target.value)}
              >
                <MenuItem value="false">Available</MenuItem>
                <MenuItem value="true">Sold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Create Listing Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/marketplace/create"
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

      {/* Items List */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <Skeleton variant="rectangular" height={160} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton variant="rounded" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
            No items found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Adjust your filters or be the first to add an item!
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/marketplace/create"
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
          {items.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
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
                    height="160"
                    image={
                      Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0].image
                        : 'https://via.placeholder.com/300x160?text=No+Image'
                    }
                    alt={item.title}
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
                
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3, pr: 1 }}>
                      {item.title}
                    </Typography>
                    <Chip 
                      label={`$${item.price.toLocaleString()}`} 
                      color="primary" 
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 'fit-content' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                    {item.description.length > 80 ? `${item.description.slice(0, 80)}...` : item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip 
                      label={item.item_type} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip 
                      label={item.condition} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.seller_username}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    component={Link}
                    to={`/marketplace/${item.id}`}
                    sx={{
                      flex: 1,
                      borderRadius: 1.5,
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

                  {currentUserId === item.seller ? (
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/marketplace/edit/${item.id}`}
                      startIcon={<Edit />}
                      sx={{ borderRadius: 1.5 }}
                    >
                      Edit
                    </Button>
                  ) : (
                    !item.is_sold && (
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/marketplace/${item.id}#contact-seller`}
                        startIcon={<Message />}
                        sx={{ borderRadius: 1.5 }}
                      >
                        Contact
                      </Button>
                    )
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
