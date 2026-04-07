import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_V1_URL } from '../config/apiConfig';
import BloodRequestForm from '../components/Forms/BloodRequestForm';

const BloodBank = () => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBloodBanks, setFilteredBloodBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchBloodBanks = async () => {
      try {
        const response = await axios.get(`${API_V1_URL}/bloodbank`);
        if (response.data.success) {
          setBloodBanks(response.data.data);
          setFilteredBloodBanks(response.data.data);
        } else {
          setError('Failed to fetch blood banks');
        }
      } catch (err) {
        setError('Error fetching blood banks');
      } finally {
        setLoading(false);
      }
    };
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    const filtered = bloodBanks.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.address?.city && b.address.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBloodBanks(filtered);
  }, [searchTerm, bloodBanks]);

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    const { street, city, state } = address;
    return `${street}, ${city}, ${state}`;
  };

  return (
    <div className='bloodbank-page-modern'>
      <section className="service-hero-header" style={{ backgroundColor: '#022c57' }}>
        <h1>Blood Bank Network</h1>
        <p>Find nearby blood banks, check real-time stock availability, and connect with donors in Kathmandu.</p>
        
        <div className="search-filter-controls">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by center name or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '30px' }}
            />
          </div>
          <button className="btn btn-primary prominent" style={{ borderRadius: '30px', background: '#e74c3c' }} onClick={() => setIsRequestModalOpen(true)}>
            <i className="fas fa-tint"></i> Request Blood
          </button>
        </div>
      </section>

      {loading ? (
        <div className='bloodbank-loading' style={{ textAlign: 'center', padding: '50px' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#e74c3c' }}></i>
          <p>Scanning blood bank availability...</p>
        </div>
      ) : error ? (
        <div className='bloodbank-error' style={{ textAlign: 'center', padding: '50px', color: 'var(--color-error)' }}>{error}</div>
      ) : (
        <div className='medical-grid'>
          {filteredBloodBanks.map(bloodBank => (
            <div className="medical-card" key={bloodBank._id}>
              <div className="card-header">
                <div className="card-title">
                  <span className="hospital-type" style={{ color: '#e74c3c' }}>Verified Center</span>
                  <h3>{bloodBank.name}</h3>
                </div>
                <div className="card-badges">
                   <span className={`clinical-badge ${bloodBank.available ? 'badge-open' : 'badge-closed'}`}>
                      {bloodBank.available ? 'Open' : 'Closed'}
                   </span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-info-row">
                  <i className="fas fa-map-pin"></i>
                  <span>{formatAddress(bloodBank.address)}</span>
                </div>
                <div className="card-info-row">
                  <i className="fas fa-phone-alt"></i>
                  <span>{bloodBank.phone} | {bloodBank.hotline}</span>
                </div>

                <div className="blood-chips-grid">
                  {bloodBank.bloodTypes?.map((type, idx) => (
                    <div className="blood-chip" key={idx}>
                      <span className="chip-group">{type.group}</span>
                      <span className="chip-units">{type.available} Units</span>
                    </div>
                  ))}
                  {(!bloodBank.bloodTypes || bloodBank.bloodTypes.length === 0) && (
                    <p style={{ gridColumn: 'span 4', fontSize: '0.8rem', color: '#999' }}>Stock uncalculated</p>
                  )}
                </div>
              </div>

              <div className="card-footer" style={{ borderTop: 'none', paddingTop: '0' }}>
                <button
                   className='btn-card-action btn-full-map'
                   style={{ background: '#022c57', color: 'white' }}
                   onClick={() =>
                     navigate('/Map', {
                       state: {
                         focusBloodBank: {
                           id: bloodBank._id,
                           name: bloodBank.name,
                           lat: bloodBank.position?.lat,
                           lng: bloodBank.position?.lng
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

      {filteredBloodBanks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <i className="fas fa-search-minus fa-3x" style={{ color: '#ccc', marginBottom: '20px' }}></i>
            <h3>No Blood Banks Found</h3>
            <p>Try searching for a different name or location.</p>
        </div>
      )}

      <BloodRequestForm isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
    </div>
  );
};

export default BloodBank;