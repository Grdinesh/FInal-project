// src/features/study-groups/StudyGroupForm.tsx
import React, { useState } from 'react';
import {
  Box, TextField, Typography, Paper, Button, Chip, Stack, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudyGroupForm: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    course: '',
    subjectTagsInput: '',
    subject_tags: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/study-groups/groups/', {
        ...form,
        subject_tags: form.subject_tags,
      });
      navigate('/study-groups');
    } catch (err) {
      console.error('Failed to create group', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagAdd = () => {
    if (form.subjectTagsInput.trim()) {
      setForm({
        ...form,
        subject_tags: [...form.subject_tags, form.subjectTagsInput.trim()],
        subjectTagsInput: '',
      });
    }
  };

  const handleTagRemove = (tag: string) => {
    setForm({
      ...form,
      subject_tags: form.subject_tags.filter((t) => t !== tag),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Create a Study Group</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Group Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Description" multiline rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Course" value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              label="Add Tag"
              value={form.subjectTagsInput}
              onChange={(e) => setForm({ ...form, subjectTagsInput: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
            />
            <Button onClick={handleTagAdd}>Add</Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {form.subject_tags.map(tag => (
              <Chip key={tag} label={tag} onDelete={() => handleTagRemove(tag)} />
            ))}
          </Stack>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/study-groups')}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Create Group'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default StudyGroupForm;
