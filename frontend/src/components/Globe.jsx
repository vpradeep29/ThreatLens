import React, { useEffect, useRef, useContext } from 'react';
import createGlobe from 'cobe';
import { ThemeContext } from '../context/ThemeContext';

export default function Globe() {
  const canvasRef = useRef();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    let phi = 0;
    
    // Hacker green for dark theme, light blue for light theme
    const baseColor = theme === 'dark' ? [0.1, 0.8, 0.3] : [0.3, 0.5, 0.9];
    const markerColor = theme === 'dark' ? [0.2, 1, 0.4] : [0.1, 0.3, 0.8];
    const glowColor = theme === 'dark' ? [0, 0.2, 0] : [1, 1, 1];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1200,
      height: 1200,
      phi: 0,
      theta: 0.3,
      dark: theme === 'dark' ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: baseColor,
      markerColor: markerColor,
      glowColor: glowColor,
      markers: [
        { location: [37.7595, -122.4367], size: 0.05 },
        { location: [40.7128, -74.006], size: 0.05 },
        { location: [51.5074, -0.1278], size: 0.05 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, [theme]);

  return (
    <div style={{
      width: '1200px',
      height: '1200px',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 0,
      opacity: theme === 'dark' ? 0.6 : 0.4,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size'
        }}
      />
    </div>
  );
}
