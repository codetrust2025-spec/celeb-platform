import React from 'react'
import { List, ListItem, ListItemText, Drawer } from '@mui/material'
import { Link } from 'react-router-dom'
import { showToast } from '../utils/toastUtility'

const MobileDrawer = ({ isMenuOpen, setIsMenuOpen, navLinks }) => {
  const filteredLinks = navLinks.filter(
    link => !['Home', 'Wishlist', 'Bookings'].includes(link.label)
  )

  const handleItemClick = (action, label) => {
    if (action) action()
    const toastMessages = {
      Logout: 'You’ve been logged out successfully 👋',
      Delete: 'Item removed successfully 🗑️',
      Save: 'Your changes have been saved 💾',
      Submit: 'Form submitted successfully 🚀'
    }
    if (toastMessages[label]) showToast(toastMessages[label], 'success')
    setIsMenuOpen(false)
  }

  return (
    <Drawer
      anchor='right'
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.48)',
          transition: 'opacity .28s ease .03s',
          opacity: isMenuOpen ? 1 : 0
        }
      }}
      PaperProps={{
        sx: {
          backgroundColor: '#1A1A1A',
          color: '#fff',
          width: { xs: '70%', sm: '50%', md: '35%', lg: '30%' },
          maxWidth: 260,
          p: { xs: '12px', sm: '14px', md: '16px' },
          borderRadius: '12px 0 0 12px',
          boxShadow: isMenuOpen
            ? '0 8px 30px rgba(0,0,0,0.45), 0 0 24px rgba(240,165,0,0.06)'
            : '0 6px 18px rgba(0,0,0,0.35)',
          borderLeft: isMenuOpen ? '3px solid rgba(240,165,0,0.12)' : '3px solid transparent',
          transition:
            'transform .35s cubic-bezier(.2,.8,.2,1) .08s, opacity .28s ease .08s, box-shadow .28s ease .08s, border-left .28s ease .08s',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(8%)',
          opacity: isMenuOpen ? 1 : 0
        }
      }}
    >
      <List sx={{ p: 0 }}>
        {filteredLinks.map(({ label, to, action }) => (
          <ListItem
            key={label}
            button
            component={to !== '#' ? Link : 'div'}
            to={to !== '#' ? to : undefined}
            onClick={() => handleItemClick(action, label)}
            sx={{
              borderRadius: 999,
              px: { xs: 1, sm: 1.25 },
              py: { xs: 0.35, sm: 0.45 },
              mb: { xs: 0.5, sm: 0.75 },
              border: '1px solid #333',
              color: '#fff',
              bgcolor: 'transparent',
              fontWeight: 500,
              textAlign: 'center',
              fontSize: { xs: '0.72rem', sm: '0.78rem' },
              transition: 'all 0.22s ease',
              '&:hover': {
                borderColor: '#f0a500',
                bgcolor: '#2a2a2a',
                color: '#f0a500',
                transform: 'scale(1.02)',
                boxShadow: '0 0 6px rgba(240,165,0,0.25)'
              },
              '&:active': { bgcolor: '#222' }
            }}
          >
            <ListItemText
              primary={label}
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default MobileDrawer