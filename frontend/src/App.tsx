import { CSSProperties } from 'react';
import MapView from './Map';
import './App.css';

const mainContainerProperties: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
};

const App = () => {

  return (
    <div style={{...mainContainerProperties}}>
      <h1>Itinerary Clustering</h1>
      <MapView />
    </div>
  );
};

export default App;
