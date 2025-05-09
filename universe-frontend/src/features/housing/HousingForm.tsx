// HousingForm.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  IconButton,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { HousingListing } from './types';
import { createHousingListing, deleteHousingImage, fetchHousingById, updateHousingListing } from './api';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  title: yup.string().required(),
  city: yup.string().required(),
  address: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required().min(0),
  bedrooms: yup.number().required().min(0),
  bathrooms: yup.number().required().min(0),
  square_feet: yup.number().min(0).nullable(),
});

const HousingForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; image: string }[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      title: '', description: '', address: '', city: '', price: '',
      bedrooms: '', bathrooms: '', square_feet: '',
      is_furnished: false, has_wifi: false, amenities: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      });
      selectedImages.forEach(img => formData.append('images', img));

      if (isEditMode) {
        await updateHousingListing(Number(id), formData);
        setSnackbar('Listing updated successfully!');
        navigate(`/housing/${id}`);
      } else {
        const newItem = await createHousingListing(formData);
        const fullItem = await fetchHousingById(newItem.id); // Fetch images
        setSnackbar('Listing created successfully!');
        navigate(`/housing/${fullItem.id}`); // Or `/housing` if you want to go to list
      }
         
    }
  });

  useEffect(() => {
    if (isEditMode) {
      fetchHousingById(Number(id)).then((data: HousingListing & { images?: { id: number; image: string }[] }) => {
        formik.setValues({
          title: data.title,
          description: data.description,
          address: data.address,
          city: data.city,
          price: data.price.toString(),
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          square_feet: data.square_feet?.toString() || '',
          is_furnished: data.is_furnished,
          has_wifi: data.has_wifi,
          amenities: data.amenities || ''
        });
        setExistingImages(data.images || []);
      });
    }
  }, [id]);

  const handleCancel = () => {
    if (id) {
      navigate(`/housing/${id}`);
    } else {
      navigate('/housing');
    }
  };
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  const handleRemoveExistingImage = async (imageId: number) => {
    try {
      await deleteHousingImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error("Failed to delete image", error);
    }
  };
  

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{isEditMode ? 'Edit Listing' : 'Create New Listing'}</Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Title" {...formik.getFieldProps('title')} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="City" {...formik.getFieldProps('city')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Address" {...formik.getFieldProps('address')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} {...formik.getFieldProps('description')} /></Grid>
          <Grid item xs={6} sm={4}><TextField fullWidth label="Price" type="number" {...formik.getFieldProps('price')} /></Grid>
          <Grid item xs={6} sm={4}><TextField fullWidth label="Bedrooms" type="number" {...formik.getFieldProps('bedrooms')} /></Grid>
          <Grid item xs={6} sm={4}><TextField fullWidth label="Bathrooms" type="number" {...formik.getFieldProps('bathrooms')} /></Grid>
          <Grid item xs={6} sm={4}><TextField fullWidth label="Square Feet" type="number" {...formik.getFieldProps('square_feet')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Amenities" placeholder="e.g. Gym, Pool, Parking" {...formik.getFieldProps('amenities')} /></Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Checkbox checked={formik.values.is_furnished} onChange={formik.handleChange} name="is_furnished" />} label="Furnished" />
            <FormControlLabel control={<Checkbox checked={formik.values.has_wifi} onChange={formik.handleChange} name="has_wifi" />} label="Wi-Fi" />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" component="label">Upload Images<input type="file" hidden multiple accept="image/*" onChange={handleImageChange} /></Button>
            {selectedImages.map((file, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>{file.name}</Typography>
                <IconButton onClick={() => handleRemoveImage(idx)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            ))}
          </Grid>
          {existingImages.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">Existing Images</Typography>
              <Grid container spacing={2}>
                {existingImages.map((img, index) => (
                  <Grid item key={img.id} xs={6} sm={4} md={3}>
                    <Box sx={{ position: 'relative' }}>
                      <img src={img.image} alt={`image-${index}`} style={{ width: '100%', borderRadius: 8 }} />
                      <IconButton
                        sx={{ position: 'absolute', top: 4, right: 4 }}
                        onClick={() => handleRemoveExistingImage(img.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
          <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" variant="contained">Submit</Button>
          </Grid>
        </Grid>
      </form>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Paper>
  );
};

export default HousingForm;
