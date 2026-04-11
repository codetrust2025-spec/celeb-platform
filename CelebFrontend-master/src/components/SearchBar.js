import React from 'react';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchQuery, handleSearchChange }) => (
  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
    <TextField
      placeholder="Search Celebrities"
      variant="outlined"
      fullWidth
      value={searchQuery}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <SearchIcon
            sx={{
              color: '#f0a500',
              fontSize: '1.6rem',
              marginRight: '8px',
              '&:hover': { color: '#ffd700' },
            }}
          />
        ),
      }}
      sx={{
        maxWidth: '400px',
        margin: '0 auto',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1c1c1c',
          borderRadius: '25px',
          padding: '10px 18px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          '& fieldset': { borderColor: '#444' },
          '&:hover fieldset': { borderColor: '#f0a500' },
          '&.Mui-focused fieldset': {
            borderColor: '#ffd700',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
          },
        },
        '& .MuiOutlinedInput-input': {
          color: '#dcdcdc',
          fontWeight: 500,
          fontSize: '1rem',
        },
      }}
    />
  </div>
);

export default SearchBar;
