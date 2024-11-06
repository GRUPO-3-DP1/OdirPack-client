// InformationPanel.tsx
import React from 'react';
import styles from './InformationPanel.module.css';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { ExpandMore, Close } from '@mui/icons-material';

interface InformationPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  visible?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const InformationPanel: React.FC<InformationPanelProps> = ({
  title,
  icon,
  children,
  collapsible = true,
  visible = true,
  onClose,
  className = '',
  style = {},
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={`${styles.panel} ${className}`} style={style}>
      <Box
        className={styles.header}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="subtitle1" color="textPrimary">
          <b>{title}</b>
        </Typography>
        <Box display="flex" alignItems="center">
          {icon}
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>
      {collapsible ? (
        <Accordion
          defaultExpanded
          disableGutters
          className={styles.collapsibleContent}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel-content"
            id="panel-header"
            className={styles.accordionSummary}
          >
            <Typography variant="subtitle2" color="textPrimary">
              <b>Detalles</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            {children}
          </AccordionDetails>
        </Accordion>
      ) : (
        <div className={styles.content}>{children}</div>
      )}
    </div>
  );
};

export default InformationPanel;