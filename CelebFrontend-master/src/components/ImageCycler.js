import React, { useState, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { buildFileURL } from '../utils/fileUrl'

/**
 * Shared CSS cross-fade image cycler.
 * All images are position:absolute so they always fill the parent.
 * No react-slick, no JS layout measurement.
 */
const ImageCycler = ({ images, alt, interval = 2500, height, sx = {} }) => {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (images.length <= 1) return
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [images.length, interval])

  const wrapper = height
    ? { position: 'relative', width: '100%', height, borderRadius: '8px', overflow: 'hidden', ...sx }
    : sx

  return (
    <Box sx={wrapper}>
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
            transition: 'opacity 0.7s ease',
          }}
        />
      ))}
    </Box>
  )
}

export default ImageCycler
