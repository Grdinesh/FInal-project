// src/features/study-groups/StudyGroupList.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StudyGroup } from './types';

const StudyGroupList: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/study-groups/groups/');
        setGroups(res.data);
      } catch (err) {
        console.error('Error fetching study groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Study Groups
      </Typography>
      <Button variant="contained" onClick={() => navigate('/study-groups/create')} sx={{ mb: 2 }}>
        Create New Group
      </Button>

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
                  Course: {group.course}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudyGroupList;
