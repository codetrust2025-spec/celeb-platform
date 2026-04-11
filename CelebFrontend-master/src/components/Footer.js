import React from 'react';
import { Typography, IconButton, Box, Container } from '@mui/material';
import { WhatsApp as WhatsAppIcon, Instagram as InstagramIcon, YouTube as YouTubeIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import { showToast } from '../utils/toastUtility';

const StyledFooter = styled('footer')({
  backgroundColor: '#111111',
  color: '#fff',
  padding: '40px 0',
  textAlign: 'center',
});

const FooterContainer = styled(Container)({
  maxWidth: 'lg',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const SocialMediaButton = styled(IconButton)(({ color }) => ({
  backgroundColor: color,
  color: '#fff',
  padding: '12px',
  borderRadius: '50%',
  marginTop: '20px',
  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const Footer = () => {
  const socialLinks = {
    whatsapp: 'https://wa.me/918639074573?text=Hello,%20I%20need%20help%20with%20booking!',
    instagram: 'https://www.instagram.com/',
    twitter: 'https://twitter.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://www.youtube.com/',
  };

  const handleSocialMediaClick = (platform) => {
    showToast(`Redirecting to ${platform}`, 'success');
  };

  return (
    <StyledFooter>
      <FooterContainer>
        <Typography variant="h6" fontWeight="bold">
          © {new Date().getFullYear()} Celebrity Event. All rights reserved.
        </Typography>
        <Box display="flex" justifyContent="center" gap="15px" mt={2} flexWrap="wrap">
          {Object.entries(socialLinks).map(([platform, url]) => {
            const iconProps = {
              whatsapp: { icon: <WhatsAppIcon />, color: '#25d366' },
              instagram: { icon: <InstagramIcon />, color: '#E1306C' },
              youtube: { icon: <YouTubeIcon />, color: '#FF0000' },
              facebook: { icon: <FacebookIcon />, color: '#1877F2' },
              twitter: { icon: <TwitterIcon />, color: '#1DA1F2' },
            };

            return (
              <SocialMediaButton
                key={platform}
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                color={iconProps[platform].color}
                onClick={() => handleSocialMediaClick(platform)}
                aria-label={platform}
              >
                {iconProps[platform].icon}
              </SocialMediaButton>
            );
          })}
        </Box>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
