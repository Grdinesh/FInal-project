// src/features/study-groups/SuggestedGroups.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StudyGroup } from './types';

const SuggestedGroups: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await axios.get('/api/study-groups/groups/suggested/');
        setGroups(res.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Suggested Study Groups
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => navigate(`/study-groups/${group.id}`)}>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2">{group.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Tags: {group.subject_tags.join(', ')}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SuggestedGroups;
