import React from 'react';
import { Slider, Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  adsrContainer: {
    padding: theme.spacing(2),
    border: '1px solid #333',
    borderRadius: '8px',
    marginBottom: theme.spacing(2),
  },
  sliderContainer: {
    marginBottom: theme.spacing(2),
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
}));

export default function AdsrControl({ values, onChange }) {
  const classes = useStyles();

  // Paramètres configurables
  const ADSR_PARAMS = [
    { id: 'attack', label: 'Attack', min: 0, max: 5000, unit: 'ms', step: 10 },
    { id: 'decay', label: 'Decay', min: 0, max: 3000, unit: 'ms', step: 10 },
    { id: 'sustain', label: 'Sustain', min: 0, max: 1, unit: '', step: 0.01 },
    { id: 'release', label: 'Release', min: 0, max: 5000, unit: 'ms', step: 10 },
  ];

  const handleChange = (param, newValue) => {
    onChange(param, newValue);
  };

  // Fonction de formatage pour l'affichage
  const formatValue = (param, value) => {
    const paramConfig = ADSR_PARAMS.find(p => p.id === param);
    return `${value}${paramConfig.unit}`;
  };

  return (
    <Box className={classes.adsrContainer}>
      <Typography variant="subtitle1" gutterBottom>
        ADSR Envelope
      </Typography>
      
      {ADSR_PARAMS.map((param) => (
        <Box key={param.id} className={classes.sliderContainer}>
          <Box className={classes.sliderLabel}>
            <Typography variant="body2">{param.label}</Typography>
            <Typography variant="body2">
              {formatValue(param.id, values[param.id])}
            </Typography>
          </Box>
          <Slider
            value={values[param.id]}
            min={param.min}
            max={param.max}
            step={param.step}
            onChange={(e, newValue) => handleChange(param.id, newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => formatValue(param.id, v)}
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: '#fff',
                border: '2px solid currentColor',
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}