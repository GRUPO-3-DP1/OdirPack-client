import React from 'react';
import styles from './InformationPanel.module.css';
import SearchBar from '../SearchBar/SearchBar';

const SearchView: React.FC = () => {
  return (
    <div className={styles.timeDisplayContainer}>
      <SearchBar />
    </div>
  );
};

export default SearchView;