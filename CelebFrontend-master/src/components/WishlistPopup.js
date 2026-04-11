import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { showToast } from '../utils/toastUtility';
import { buildFileURL } from '../utils/fileUrl';

// Reusable CSS cross-fade cycler — no react-slick, no layout measurement issues
const ImageCycler = ({ images, alt, height = 200 }) => {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height, borderRadius: '8px', overflow: 'hidden' }}>
      {images.map((url, i) => (
        <Box
          key={url + i}
          component="img"
          src={buildFileURL(url)}
          alt={i === 0 ? alt : ''}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === active ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}
    </Box>
  );
};

const WishlistPopup = ({ isPopupOpen, wishlist, handleRemoveClick, closePopup }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleRemoveWithToast = async (id) => {
    try {
      setLoadingId(id);
      await handleRemoveClick(id);
    } catch {
      showToast('Failed to remove celebrity. Please try again.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog
      open={isPopupOpen}
      onClose={closePopup}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' } }}
    >
      <DialogTitle sx={{ color: '#FFD700', fontWeight: '500', fontSize: '1.4rem' }}>
        Your Wishlist
      </DialogTitle>

      <DialogContent sx={{ padding: '24px 36px', background: '#1A1A1A' }}>
        <Grid container spacing={3} justifyContent="center">
          {wishlist?.length > 0 ? (
            wishlist.map((celebrity) => {
              const images = Array.isArray(celebrity.imageUrls) && celebrity.imageUrls.length
                ? celebrity.imageUrls
                : celebrity.imageUrl ? [celebrity.imageUrl] : [];
              return (
                <Grid key={celebrity._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{
                    textAlign: 'center', borderRadius: '12px', padding: '16px',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-6px)' }
                  }}>
                    {images.length > 0
                      ? <ImageCycler images={images} alt={celebrity.name} height={200} />
                      : <Box sx={{ height: 200, bgcolor: '#333', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#FFD700' }}>No images</Typography>
                        </Box>
                    }
                    <Typography variant="h6" sx={{ mt: 2, color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                      {celebrity.name}
                    </Typography>
                    <Button
                      onClick={() => handleRemoveWithToast(celebrity._id)}
                      disabled={loadingId === celebrity._id}
                      sx={{
                        mt: 1.5, px: 2, py: 0.75, fontSize: '0.85rem', color: '#FF4D4D',
                        fontWeight: '600', textTransform: 'none', backgroundColor: 'transparent',
                        borderRadius: '20px', border: '1px solid #FF4D4D',
                        '&:hover': { backgroundColor: '#FF4D4D', color: '#fff' },
                        display: 'inline-flex', alignItems: 'center', gap: 0.5
                      }}
                    >
                      {loadingId === celebrity._id
                        ? <CircularProgress size={16} sx={{ color: '#FF4D4D' }} />
                        : <Delete sx={{ fontSize: '1rem' }} />
                      }
                      Remove
                    </Button>
                  </Box>
                </Grid>
              );
            })
          ) : (
            <Typography sx={{ color: '#FFD700', fontSize: '1.1rem', textAlign: 'center', py: 4, width: '100%' }}>
              No celebrities in your wishlist.
            </Typography>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', backgroundColor: '#1A1A1A', borderTop: '1px solid #333' }}>
        <Button
          onClick={closePopup}
          sx={{
            color: '#FFD700', backgroundColor: '#333', fontWeight: '600', fontSize: '1rem',
            textTransform: 'none', padding: '8px 18px', borderRadius: '20px',
            border: '1px solid #FFD700',
            '&:hover': { backgroundColor: '#FFD700', color: '#1A1A1A' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WishlistPopup;
