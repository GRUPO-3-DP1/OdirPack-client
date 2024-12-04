import React, { useEffect } from 'react';
import styles from './page.module.css';
import BaseMap from '../../components/Mapa/components/Mapa/MapaGeneral/BaseMap';
import { useData } from '../../context/useData';

type OperationType = 'semanal' | 'colapso' | 'diaadia';

const Page: React.FC = () => {

  const { state } = useData(); 
  const operationType = state.operationType as OperationType;

  // Usar useEffect para loggear solo cuando operationType cambie
  useEffect(() => {
    //console.log('MSJ: en Page llega state.operationType', state.operationType);
  }, [ state.operationType ]);  

  return (
    <div className={styles.contenedor}>
      <BaseMap operationType={operationType} />
    </div>
  );
};

export default Page;