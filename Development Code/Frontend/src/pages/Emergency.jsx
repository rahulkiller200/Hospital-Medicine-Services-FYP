import React from "react";
import { useNavigate } from "react-router-dom";

function Emergency() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffecec 0%, #ffcdd2 100%)', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '50px' }}>
            {/* Minimal Navigation Bar */}
            <nav style={{ padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 15px rgba(229, 57, 53, 0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
                <h2 style={{ color: '#c62828', margin: 0, fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/home')}>
                    <i className="fas fa-ambulance"></i> Emergency Matrix
                </h2>
                <div>
                    <button onClick={() => navigate(-1)} style={{ background: '#c62828', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fas fa-arrow-left"></i> Go Back
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '0 20px', textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(211, 47, 47, 0.15)', border: '2px solid #ffcdd2' }}>
                    
                    <div style={{ width: '100px', height: '100px', background: '#ffebee', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 30px auto', border: '3px solid #ef5350' }}>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#c62828' }}></i>
                    </div>

                    <h1 style={{ color: '#b71c1c', fontSize: '3.5rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Emergency Protocol
                    </h1>
                    <p style={{ color: '#b71c1c', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '40px' }}>
                        If this is a life-threatening medical emergency, step away from this application and dial your national emergency hotline immediately!
                    </p>

                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        
                        {/* Direct Call Card */}
                        <div style={{ flex: '1', minWidth: '250px', background: '#c62828', padding: '30px', borderRadius: '15px', color: 'white', transform: 'translateY(0)', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <i className="fas fa-phone-volume" style={{ fontSize: '2.5rem', marginBottom: '15px' }}></i>
                            <h2 style={{ margin: '0 0 10px 0' }}>Call 102</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: '0.9' }}>National Ambulance Service</p>
                        </div>

                        {/* Map Locator Card */}
                        <div onClick={() => navigate('/map')} style={{ flex: '1', minWidth: '250px', background: '#1565c0', padding: '30px', borderRadius: '15px', color: 'white', transform: 'translateY(0)', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <i className="fas fa-map-marked-alt" style={{ fontSize: '2.5rem', marginBottom: '15px' }}></i>
                            <h2 style={{ margin: '0 0 10px 0' }}>Locate Hospital</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: '0.9' }}>Find the nearest ER instantly</p>
                        </div>

                        {/* AI Quick Triage Card */}
                        <div style={{ flex: '1', minWidth: '250px', background: '#e65100', padding: '30px', borderRadius: '15px', color: 'white', transform: 'translateY(0)', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <i className="fas fa-robot" style={{ fontSize: '2.5rem', marginBottom: '15px' }}></i>
                            <h2 style={{ margin: '0 0 10px 0' }}>AI First-Aid</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: '0.9' }}>Click the chatbot icon below for rapid triage</p>
                        </div>

                    </div>
                    
                    <div style={{ marginTop: '40px', padding: '20px', background: '#fff3e0', borderRadius: '10px', borderLeft: '5px solid #ff9800', textAlign: 'left' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e65100' }}><i className="fas fa-info-circle"></i> Instructions</h3>
                        <p style={{ margin: 0, color: '#5d4037', lineHeight: '1.6' }}>
                            Ensure the patient's airway is clear. Do not move someone who may have a neck or spinal injury unless they are in immediate danger. Keep the patient warm and stay on the line with the emergency operator until instructed otherwise.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Emergency;
