import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const RegisterAndLoginPrompt = () => {
  const location = useLocation();
  const { celebrity } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: '#1c1c1c',
        color: '#fff',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h4"
        sx={{ marginBottom: '20px', fontWeight: 'bold', letterSpacing: '1.5px' }}
      >
        Please Register or Log In
      </Typography>
      <Typography
        variant="body1"
        sx={{ marginBottom: '40px', fontSize: '1.2rem', color: '#ccc' }}
      >
        You need an account to book a celebrity.
      </Typography>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        <Button
          component={Link}
          to="/register"
          state={{ celebrity }}
          variant="contained"
          sx={{
            backgroundColor: '#f0a500', color: '#fff', fontWeight: 'bold',
            textTransform: 'none', fontSize: '1rem', padding: '10px 30px',
            borderRadius: '25px', '&:hover': { backgroundColor: '#e88b00' },
          }}
        >
          Register
        </Button>
        <Button
          component={Link}
          to="/userLogin"
          state={{ celebrity }}
          variant="outlined"
          sx={{
            borderColor: '#f0a500', color: '#f0a500', fontWeight: 'bold',
            textTransform: 'none', fontSize: '1rem', padding: '10px 30px',
            borderRadius: '25px', '&:hover': { backgroundColor: '#e88b00', borderColor: '#e88b00', color: '#fff' },
          }}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterAndLoginPrompt;
