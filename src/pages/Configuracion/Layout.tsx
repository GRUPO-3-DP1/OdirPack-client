import React from 'react';
import styles from './layout.module.css';
import Header from '../../components/Header/Header';
import Page from './Page';

const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
};

export default Layout;