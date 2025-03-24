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
    const [metroMarkers, setMetroMarkers] = useState<[[number, number], string, string, string][]>([]);
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

    const nearestMetroStations = () => {
        if (markers.length === 0) {
            alert("Please add at least one marker.");
            return;
        }

        const clusters = markers.reduce((acc, marker) => {
            const color = marker[1];
            if (!acc[color]) {
                acc[color] = [];
            }
            acc[color].push(marker);
            return acc;
        }, {} as { [key: string]: [[number, number], string][] });

        const centroids = Object.values(clusters).map(cluster => {
            const lat = cluster.reduce((acc, marker) => acc + marker[0][0], 0) / cluster.length;
            const lng = cluster.reduce((acc, marker) => acc + marker[0][1], 0) / cluster.length;
            const color = cluster[0][1];
            return [lat, lng, color];
        });

        const fetchNearestMetroStations = async () => {
            try {
                const updatedMarkers = await Promise.all(
                    centroids.map(async ([lat, lng, color]) => {
                        const query = `
        [out:json];
        node["railway"="station"](around:1000, ${lat}, ${lng});
        out body;
    `;
                        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                        const data = await response.json();
                        if (data.elements && data.elements.length > 0) {
                            const nearestStation = data.elements[0];
                            return [[nearestStation.lat, nearestStation.lon], 'black', nearestStation.tags.name || 'Unknown Station', color];
                        }
                        return null;
                    })
                );

                const filteredMarkers = updatedMarkers.filter((marker): marker is [[number, number], string, string, string] => marker !== null);
                setMetroMarkers(filteredMarkers);
            } catch (error) {
                console.error('Error fetching metro stations:', error);
            }
        };

        fetchNearestMetroStations();
    }

    const clearPanel = () => {
        setMarkers([]);
        setMetroMarkers([]);
    }

    return (
        <React.Fragment>
            <div style={buttonContainerProperties}>
                <input type="number" placeholder="Number of clusters" max={COLORS.length} min={1} defaultValue={k} onChange={(e) => changeK(e)} />
                <button onClick={() => createClusters()}>Cluster</button>
                <button onClick={() => clearPanel()}>Clear</button>
                <button onClick={() => nearestMetroStations()}>Metro</button>
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
                {
                    metroMarkers.map((marker, idx) => (
                        <div key={`metro-marker-${idx}`} style={{ padding: '5px' }}>
                            <Marker
                                position={marker[0]}
                                icon={customIcon(marker[1])}
                                eventHandlers={{
                                    click: () => alert(`Station Name: ${marker[2]}`)
                                }}
                            />
                        </div>
                    ))
                }
            </MapContainer>
            <div>
                {metroMarkers.length > 0 &&
                    <div>
                        <h3>Nearest Metro Stations</h3>
                        <ul>
                            {metroMarkers.map((marker, idx) => (
                                <li key={`metro-marker-${idx}`}>
                                    <a 
                                        href={`https://www.google.com/maps?q=${marker[0][0]},${marker[0][1]}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        {marker[2]} - {marker[3]} cluster
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div>
        </React.Fragment>
    );
};

export default MapView;
