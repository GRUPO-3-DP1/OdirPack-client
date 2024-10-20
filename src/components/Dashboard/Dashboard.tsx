import React from 'react';
import styles from './Dashboard.module.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Main from '../Main/Main';

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <Main />
      </div>
    </div>
  );
};

export default Dashboard;