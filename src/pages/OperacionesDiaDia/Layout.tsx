import React from 'react';
import styles from './layout.module.css';
import Page from './Page';
import CustomHeader from './CustomHeader';

const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <CustomHeader />
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;