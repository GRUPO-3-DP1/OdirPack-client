import { LinearProgress } from '@mui/material';
import React from 'react';
import styles from './LoadingBar.module.css';

type LoadingBarProps = {
  disabled?: boolean;
};

const LoadingBar: React.FC<LoadingBarProps> = ({ disabled = false }) => {
  return (
    <>
      {
        disabled ?
          null
          :
          <LinearProgress className={styles.bar} />
      }
    </>
  );
};

export default LoadingBar;