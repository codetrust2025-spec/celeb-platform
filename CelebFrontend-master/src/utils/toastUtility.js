import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (message, type = 'success') => {
  toast(message, {
    type,
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const createButtonStyles = (size = 'medium') => {
  const sizes = {
    small: { padding: '0.6rem 1.6rem', fontSize: '0.9rem', gap: '0.6rem' },
    medium: { padding: '0.8rem 2rem', fontSize: '1rem', gap: '0.8rem' },
    large: { padding: '1rem 2.5rem', fontSize: '1.2rem', gap: '1rem' },
  };

  const currentSize = sizes[size] || sizes.medium;

  return {
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: 'bold',
    borderRadius: '30px',
    textTransform: 'none',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundImage: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: currentSize.gap,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#2575fc',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
      transform: 'scale(1.03)',
    },
    '&:active': {
      backgroundColor: '#003366',
      boxShadow: 'none',
    },
    '&:focus': {
      outline: '3px solid #ff4081',
    },
    '@media (max-width:600px)': {
      fontSize: size === 'small' ? '0.85rem' : '0.95rem',
      padding: size === 'small' ? '0.5rem 1.4rem' : '0.6rem 1.8rem',
    },
  };
};
