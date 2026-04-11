import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { showToast } from '../utils/toastUtility';

const AboutUs = () => {
  const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';

  const handleExploreClick = () => {
    showToast('Explore Celebrities button clicked!', 'info');
  };

  return (
    <Box sx={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '80px 20px', textAlign: 'center' }}>
      <Box sx={{ marginBottom: 6, padding: '40px 20px', backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 2 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, letterSpacing: 5, marginBottom: 2, textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)', fontSize: { xs: '3rem', sm: '4rem', md: '5rem' } }}>
          About Us
        </Typography>
        <Typography variant="h5" sx={{ color: '#ccc', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto', fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, letterSpacing: 1 }}>
          We are passionate about connecting the biggest names in entertainment with our clients to create unforgettable experiences.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 3, textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Why Choose Us?
        </Typography>
        <Grid container spacing={6} justifyContent="center">
          {['Exclusive Access', 'Seamless Experience', 'Memorable Events'].map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 4 }}>
              <Card sx={{ backgroundColor: '#1a1a1a', boxShadow: 10, borderRadius: 3, transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' } }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: 3, letterSpacing: 1, color: '#FFD700' }}>
                    {feature}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc', lineHeight: 1.6, letterSpacing: 0.5, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    We provide exclusive access to some of the most sought-after celebrities for any occasion.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ marginTop: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', marginBottom: 2, letterSpacing: 3, textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Let’s Make Your Event Unforgettable
        </Typography>
        <Typography variant="h6" sx={{ color: '#bbb', lineHeight: 1.8, marginBottom: 4, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, letterSpacing: 1, maxWidth: '800px', margin: '0 auto' }}>
          Whether it’s a wedding, birthday, corporate event, or charity gala, we are here to make it extraordinary.
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#FFD700', color: '#000', padding: '15px 40px', fontWeight: 600, borderRadius: '50px', textTransform: 'uppercase', '&:hover': { backgroundColor: '#fff', color: '#FFD700', transform: 'scale(1.05)' } }}
          component={Link}
          to="/"
          onClick={handleExploreClick}
        >
          Explore Celebrities
        </Button>
      </Box>

      {!isAdminLoggedIn && (
        <Box sx={{ marginTop: 5 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#fff', color: '#000', fontWeight: 700, padding: '12px 25px', borderRadius: '25px', '&:hover': { backgroundColor: '#FFD700', color: '#fff' } }}
            component={Link}
            to="/adminLogin"
          >
            Admin
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AboutUs;
