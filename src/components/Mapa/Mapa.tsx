import { APIProvider, ColorScheme, Map } from '@vis.gl/react-google-maps';
import React from 'react';

const Mapa: React.FC = () => {
  return (
    <APIProvider apiKey="AIzaSyAf4vRvjVvt-AuStWjrfbA-tJNYouHBpb4">
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={{ lat: -12.066435, lng: -77.044072 }}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        colorScheme={ColorScheme.LIGHT}
      />
    </APIProvider>
  );
};

export default Mapa;