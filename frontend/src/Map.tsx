import React, { CSSProperties, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const COLORS = ['red', 'blue', 'green', 'gold', 'orange', 'violet', 'grey', 'black'];

const buttonContainerProperties: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  };

const MapView = () => {
    const [markers, setMarkers] = useState<[[number, number], string][]>([]);
    const [k, setK] = useState<number>(2);

    const changeK = (e: React.ChangeEvent<HTMLInputElement>) => {
        setK(parseInt(e.target.value));
    }

    const MapClick = () => {
        const map = useMap();
        map.on('click', (e) => {
            setMarkers([...markers, [[e.latlng.lat, e.latlng.lng], COLORS[0]]]);
        });
        return null;
    };

    const MarkerClick = (index: number) => {
        const updatedMarkers = [...markers];
        updatedMarkers.splice(index, 1);
        setMarkers(updatedMarkers);
    };

    const customIcon = (color: string) => new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
    });

    const createClusters = () => {
        fetch(`http://localhost:5000/cluster?k=${k}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markers: markers.map(marker => [marker[0][0], marker[0][1]]) }),
        })
            .then(response => response.json())
            .then(data => {
                const updatedMarkers = data.map((cluster: { lat: any; lng: any; group: number }) => {
                    return [[cluster.lat, cluster.lng], COLORS[cluster.group % COLORS.length]];
                });
                setMarkers(updatedMarkers);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <React.Fragment>
            <div style={buttonContainerProperties}>
                <input type="number" placeholder="Number of clusters" max={COLORS.length} min={1} defaultValue={k} onChange={(e)=> changeK(e)}/>
                <button onClick={() => createClusters()}>Cluster</button>
                <button onClick={() => setMarkers([])}>Clear</button>
            </div>
            <MapContainer style={{ height: '100vh', width: '1000px', cursor: "default" }} center={[51.505, -0.09]} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClick />
                {
                    markers.map((marker, idx) => (
                        <div key={`marker-${idx}`} style={{ padding: '5px' }}>
                            <Marker position={marker[0]} icon={customIcon(marker[1])} eventHandlers={{ click: () => MarkerClick(idx) }} />
                        </div>
                    ))
                }
            </MapContainer>
        </React.Fragment>
    );
};

export default MapView;
