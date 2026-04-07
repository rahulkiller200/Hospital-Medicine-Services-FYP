import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_V1_URL } from '../config/apiConfig';

const Hospital = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${API_V1_URL}/hospitals`);
        if (response.data.success) {
          setHospitals(response.data.data);
          setFilteredHospitals(response.data.data);
        } else {
          setError('Failed to fetch hospitals');
        }
      } catch (err) {
        setError('Error fetching hospitals');
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    const filtered = hospitals.filter(h => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.address?.city && h.address.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredHospitals(filtered);
  }, [searchTerm, hospitals]);

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    const { street, city, state } = address;
    return `${street}, ${city}, ${state}`;
  };

  const getBedCount = (beds, type) => {
    const bed = beds?.find(b => b.type === type);
    return bed ? `${bed.available}/${bed.total}` : 'N/A';
  };

  return (
    <div className='hospital-page-modern'>
      <section className="service-hero-header">
        <h1>Medical Directory</h1>
        <p>Find nearby hospitals, check real-time bed availability, and connect with emergency services in Kathmandu.</p>
        
        <div className="search-filter-controls">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by hospital name or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ borderRadius: '30px' }} onClick={() => navigate('/Map')}>
            <i className="fas fa-map-marker-alt"></i> View Map
          </button>
        </div>
      </section>

      {loading ? (
        <div className='hospital-loading' style={{ textAlign: 'center', padding: '50px' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--color-navy)' }}></i>
          <p>Loading medical facilities...</p>
        </div>
      ) : error ? (
        <div className='hospital-error' style={{ textAlign: 'center', padding: '50px', color: 'var(--color-error)' }}>{error}</div>
      ) : (
        <div className='medical-grid'>
          {filteredHospitals.map(hospital => (
            <div className="medical-card" key={hospital._id}>
              <div className="card-header">
                <div className="card-title">
                  <span className="hospital-type">{hospital.type}</span>
                  <h3>{hospital.name}</h3>
                </div>
                <div className="card-badges">
                   <span className={`clinical-badge ${hospital.available ? 'badge-open' : 'badge-closed'}`}>
                      {hospital.available ? 'Open' : 'Closed'}
                   </span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-info-row">
                  <i className="fas fa-map-pin"></i>
                  <span>{formatAddress(hospital.address)}</span>
                </div>
                <div className="card-info-row">
                  <i className="fas fa-phone-alt"></i>
                  <span>{hospital.phone} | {hospital.hotline}</span>
                </div>

                <div className="card-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">ICU Beds</span>
                    <span className="stat-value">{getBedCount(hospital.beds, 'ICU')}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Ventilators</span>
                    <span className="stat-value">{getBedCount(hospital.beds, 'Ventilator')}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Wards</span>
                    <span className="stat-value">{getBedCount(hospital.beds, 'Ward')}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Doctors</span>
                    <span className="stat-value">
                      {hospital.doctors?.filter(d => d.available).length || 0} / {hospital.doctors?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="card-badges">
                  {hospital.emergencyServices ? (
                    <span className="clinical-badge badge-emergency"><i className="fas fa-ambulance"></i> Emergency 24/7</span>
                  ) : (
                    <span className="clinical-badge badge-no-emergency">No Emergency Unit</span>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <button
                   className='btn-card-action btn-full-map'
                   onClick={() =>
                     navigate('/Map', {
                       state: {
                         focusHospital: {
                           id: hospital._id,
                           name: hospital.name,
                           lat: hospital.position?.lat,
                           lng: hospital.position?.lng
                         }
                       }
                     })
                   }
                >
                  <i className="fas fa-directions"></i> Show on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {filteredHospitals.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <i className="fas fa-search-minus fa-3x" style={{ color: '#ccc', marginBottom: '20px' }}></i>
            <h3>No Hospitals Found</h3>
            <p>Try searching for a different name or location.</p>
        </div>
      )}
    </div>
  );
};

export default Hospital;