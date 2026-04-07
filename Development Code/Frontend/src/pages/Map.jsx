import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { API_V1_URL } from '../config/apiConfig';

// Kathmandu coordinates
const KATHMANDU_CENTER = {
  lat: 27.7172,
  lng: 85.3240
};

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bloodBankIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pharmacyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function Map() {
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filter, setFilter] = useState(location.state?.filter || 'all');
  const [locations, setLocations] = useState([]);
  const [visibleLocations, setVisibleLocations] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const focusHospital = location.state?.focusHospital;

  // Fetch ALL providers (Hospitals + Pharmacies) from the unified endpoint
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(`${API_V1_URL}/map/providers`);
        if (response.data.success) {
          setLocations(response.data.data);
        } else {
          toast.error('Failed to fetch provider locations');
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast.error('Error fetching healthcare providers.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Fetch blood banks from backend
  useEffect(() => {
    const fetchBloodBanks = async () => {
      try {
        const response = await axios.get(`${API_V1_URL}/bloodbank`);
        if (response.data.success) {
          setBloodBanks(response.data.data);
        } else {
          toast.error('Failed to fetch blood banks');
        }
      } catch (error) {
        console.error('Error fetching blood banks:', error);
        toast.error('Error fetching blood banks. Please try again later.');
      }
    };

    fetchBloodBanks();
  }, []);

  // Initialize map and handle geolocation
  useEffect(() => {
    if (isLoading) return; // Wait until loading is done
    if (!mapRef.current) return;

    const checkAndInit = () => {
      const height = mapRef.current.offsetHeight;
      if (height && !mapInstanceRef.current) {
        
        // Define bounding box covering Kathmandu Valley region
        const southWest = L.latLng(27.5000, 85.1000);
        const northEast = L.latLng(27.9000, 85.6000);
        const kathmanduBounds = L.latLngBounds(southWest, northEast);

        const map = L.map(mapRef.current, {
          maxBounds: kathmanduBounds, // Restrict panning outside
          maxBoundsViscosity: 1.0,    // Hard bounce when dragging outside
          minZoom: 11                 // Prevent zooming too far out
        }).setView([KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        // Attempt Geolocation pinpointing, clamping to Kathmandu bounds
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
             const userLat = position.coords.latitude;
             const userLng = position.coords.longitude;
             
             // Create LatLng object to check bounds
             const userLatLng = L.latLng(userLat, userLng);
             
             if (kathmanduBounds.contains(userLatLng)) {
               map.setView([userLat, userLng], 14);
               // Add User Marker
               L.circleMarker([userLat, userLng], {
                 color: '#e74c3c',
                 fillColor: '#f03',
                 fillOpacity: 0.5,
                 radius: 10
               }).addTo(map).bindPopup('You are here!').openPopup();
             } else {
               toast.warning("Your current location is outside the Kathmandu coverage area.");
             }

          }, () => {
             toast.warning("Could not automatically determine your location.");
          });
        }

        setTimeout(() => map.invalidateSize(), 0);
      } else if (!height) {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoading]);

  // Dynamic Open/Closed logic for Pharmacies (9 AM - 10 PM) vs Hospitals (24/7)
  const isLocationOpen = (loc) => {
    // If manually deactivated in DB, always Closed
    if (loc.available === false) return false;
    
    // Hospitals and Blood Banks are 24/7
    if (loc.providerType !== 'Pharmacy') return true;
    
    // Pharmacies are 9:00 AM to 10:00 PM (22:00)
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 9 && currentHour < 22;
  };

  // Update markers when locations or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let filteredLocations = locations;
    if (focusHospital) {
      filteredLocations = locations.filter(
        loc => loc._id === focusHospital.id || (loc.position?.lat === focusHospital.lat && loc.position?.lng === focusHospital.lng)
      );
      if (filteredLocations.length && mapInstanceRef.current) {
        mapInstanceRef.current.setView([focusHospital.lat, focusHospital.lng], 16);
      }
    }

    // Filter locations based on the selected filter
    if (filter === 'hospital') {
      filteredLocations = locations.filter(loc => loc.providerType === 'Hospital');
    } else if (filter === 'pharmacy') {
      filteredLocations = locations.filter(loc => loc.providerType === 'Pharmacy');
    } else if (filter === 'bloodbank') {
      filteredLocations = [];
    }

    const formatAddr = (addr) => {
      if (!addr) return 'Address not available';
      if (typeof addr === 'string') return addr;
      return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}`;
    };

    let newVisibleLocations = [];

    filteredLocations.forEach(location => {
      const formattedAddress = formatAddr(location.address);
      newVisibleLocations.push(location);

      const marker = L.marker([location.position.lat, location.position.lng], {
        icon: location.providerType === 'Hospital' ? hospitalIcon : pharmacyIcon
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="info-window" style="min-width: 200px; padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
              ${location.name || 'Unnamed Location'}
            </h3>
            <div style="font-size: 14px; line-height: 1.4;">
              <p style="margin: 5px 0;"><strong style="color: #34495e;">Type:</strong> ${location.providerType || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong style="color: #34495e;">Address:</strong> ${formattedAddress}</p>
              <p style="margin: 5px 0;"><strong style="color: #34495e;">Contact:</strong> ${location.phone || location.contact || 'Not available'}</p>
              <p style="margin: 5px 0;">
                <strong style="color: #34495e;">Status:</strong> 
                <span style="color: ${isLocationOpen(location) ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                  ${isLocationOpen(location) ? 'Open' : 'Closed'}
                </span>
              </p>
              ${location.emergencyServices ? 
                `<p style="margin: 5px 0;">
                  <strong style="color: #34495e;">Emergency Services:</strong> 
                  <span style="color: #27ae60; font-weight: bold;">Available</span>
                </p>` : ''}
              ${location.hotline ? 
                `<p style="margin: 5px 0;">
                  <strong style="color: #34495e;">Hotline:</strong> ${location.hotline}
                </p>` : ''}
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });

      marker.on('click', () => {
        setSelectedLocation(location);
      });

      markersRef.current.push(marker);
    });

    // Add blood bank markers
    if (filter === 'all' || filter === 'bloodbank') {
      bloodBanks.forEach(bank => {
        // Format address
        let formattedAddress = 'Address not available';
        if (bank.address) {
          if (typeof bank.address === 'object') {
            const { street, city, state } = bank.address;
            formattedAddress = [street, city, state].filter(Boolean).join(', ');
          } else {
            formattedAddress = bank.address;
          }
        }
        
        bank.providerType = 'Blood Bank'; // Ensure type is set for sidebar
        newVisibleLocations.push(bank);

        // Format contact
        let formattedContact = 'Not available';
        if (bank.phone || bank.hotline) {
          formattedContact = [
            bank.phone && `Phone: ${bank.phone}`,
            bank.hotline && `Hotline: ${bank.hotline}`
          ].filter(Boolean).join(' | ');
        }
        // Format blood types
        let formattedBloodTypes = 'No blood info';
        if (Array.isArray(bank.bloodTypes) && bank.bloodTypes.length > 0) {
          formattedBloodTypes = bank.bloodTypes.map(
            t => `${t.group}: ${t.available} units`
          ).join('<br/>');
        }
        const marker = L.marker([bank.position.lat, bank.position.lng], {
          icon: bloodBankIcon
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="info-window" style="min-width: 200px; padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
                ${bank.name || 'Unnamed Blood Bank'}
              </h3>
              <div style="font-size: 14px; line-height: 1.4;">
                <p style="margin: 5px 0;"><strong style="color: #34495e;">Type:</strong> Blood Bank</p>
                <p style="margin: 5px 0;"><strong style="color: #34495e;">Address:</strong> ${formattedAddress}</p>
                <p style="margin: 5px 0;"><strong style="color: #34495e;">Contact:</strong> ${formattedContact}</p>
                <p style="margin: 5px 0;"><strong style="color: #34495e;">Blood Types:</strong> ${formattedBloodTypes}</p>
                <p style="margin: 5px 0;">
                  <strong style="color: #34495e;">Status:</strong> 
                  <span style="color: ${isLocationOpen(bank) ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                    ${isLocationOpen(bank) ? 'Open' : 'Closed'}
                  </span>
                </p>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-popup'
          });

        marker.on('click', () => {
          setSelectedLocation(bank);
        });

        markersRef.current.push(marker);
      });
    }
    
    setVisibleLocations(newVisibleLocations);
  }, [locations, bloodBanks, filter, focusHospital]);

  if (isLoading) {
    return (
      <div className="map-container">
        <div className="loading">Loading map data...</div>
      </div>
    );
  }

  // Helper for Sidebar Address
  const getDisplayAddress = (addr) => {
    if (!addr) return 'Address not available';
    if (typeof addr === 'string') return addr;
    return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
  };

  const panToLocation = (loc) => {
    if (mapInstanceRef.current && loc.position) {
      mapInstanceRef.current.setView([loc.position.lat, loc.position.lng], 16);
      
      // Find the marker and open popup
      const targetMarker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return pos.lat === loc.position.lat && pos.lng === loc.position.lng;
      });
      if (targetMarker) {
         targetMarker.openPopup();
      }
    }
  };

  return (
    <div className="map-page-layout">
      <div className="map-sidebar">
        <div className="sidebar-header">
          <h2>Locations in Kathmandu</h2>
          <div className="filter-chips">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'hospital' ? 'active' : ''} onClick={() => setFilter('hospital')}>Hospitals</button>
            <button className={filter === 'pharmacy' ? 'active' : ''} onClick={() => setFilter('pharmacy')}>Pharmacies</button>
            <button className={filter === 'bloodbank' ? 'active' : ''} onClick={() => setFilter('bloodbank')}>Blood Banks</button>
          </div>
          <div className="results-count">Showing {visibleLocations.length} results</div>
        </div>
        
        <div className="sidebar-list">
          {visibleLocations.length === 0 ? (
            <div className="no-results">No locations found.</div>
          ) : (
            visibleLocations.map((loc, index) => (
              <div key={loc._id || index} className="sidebar-card" onClick={() => panToLocation(loc)}>
                <h4>{loc.name || 'Unnamed Location'}</h4>
                <div className="card-details">
                  <span className={`type-badge type-${(loc.providerType || 'unknown').toLowerCase().replace(/\s/g, '')}`}>
                    {loc.providerType || 'Unknown'}
                  </span>
                  <span className={`status-badge ${isLocationOpen(loc) ? 'open' : 'closed'}`}>
                    {isLocationOpen(loc) ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="card-info"><i className="fas fa-map-marker-alt"></i> {getDisplayAddress(loc.address)}</p>
                <p className="card-info"><i className="fas fa-phone"></i> {loc.phone || loc.hotline || 'Not Available'}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="map-view-area">
        <div ref={mapRef} className="leaflet-full-map"></div>
      </div>
    </div>
  );
}

export default Map;