import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_V1_URL, API_BASE_URL } from "../../config/apiConfig";
import { toast } from 'react-toastify';
import { 
  FaShoppingBasket, 
  FaBoxes, 
  FaPlus, 
  FaCapsules, 
  FaExclamationTriangle, 
  FaSearch, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFilePrescription,
  FaSignOutAlt,
  FaWarehouse
} from "react-icons/fa";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Autocomplete,
  CircularProgress,
  IconButton
} from "@mui/material";
import "./HospitalDashboard.css"; // Reuse the professional styles

const Categories = ["Pain Relief", "Antibiotics", "Fever", "Cough & Cold", "First Aid", "Chronic Diseases", "Others"];

const DashboardPharmacy = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [pharmacy, setPharmacy] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  
  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    category: "Others",
    genericSalt: "",
    price: "",
    stock: "",
    prescriptionRequired: false
  });

  useEffect(() => {
    fetchData();
    fetchAllMedicines();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [profileRes, ordersRes] = await Promise.all([
        axios.get(`${API_V1_URL}/pharmacies/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_V1_URL}/pharmacies/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setPharmacy(profileRes.data.data);
      setInventory(profileRes.data.data.inventory || []);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      toast.error("Error connecting to Pharmacy Node");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMedicines = async () => {
    try {
      const res = await axios.get(`${API_V1_URL}/medicine/all`);
      setAllMedicines(res.data.data || []);
    } catch (e) { console.error("Could not fetch global catalog"); }
  };

  const handleAddMedicine = async () => {
    if (!formData.stock || (!formData.medicineId && !formData.name)) {
      toast.warning("Please fill required fields");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = {
        medicineId: formData.medicineId,
        stock: parseInt(formData.stock),
        medicineData: formData.medicineId ? null : {
          name: formData.name,
          category: formData.category,
          genericSalt: formData.genericSalt,
          price: parseFloat(formData.price),
          prescriptionRequired: formData.prescriptionRequired
        }
      };

      const res = await axios.post(`${API_V1_URL}/pharmacies/inventory`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Inventory Updated Successfully");
        setOpenAddDialog(false);
        fetchData();
        setFormData({ medicineId: "", name: "", category: "Others", genericSalt: "", price: "", stock: "", prescriptionRequired: false });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation Failed");
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/pharmacies/order/${orderId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order ${status}`);
      fetchData();
    } catch (e) { toast.error("Status update failed"); }
  };

  const lowStockCount = inventory.filter(item => item.stock < 10).length;

  if (loading) return (
    <div className="loader-container" style={{ height: '100vh', background: '#0a192f', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <CircularProgress sx={{ color: '#ff6b35' }} />
    </div>
  );

  return (
    <div className="hospital-dashboard-root">
      {/* Sidebar - Reusing styles */}
      <aside className="hospital-sidebar">
        <div className="sidebar-brand">
          <FaWarehouse size={32} style={{ color: '#ff6b35' }} />
          <div>
            <h2>PHARMACY PRO</h2>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>INVENTORY CONTROL</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <FaBoxes /> Medicine Stock
          </button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <FaShoppingBasket /> Patient Orders {orders.length > 0 && <span className="order-dot"></span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => navigate('/login')}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="hospital-main">
        <header className="hospital-header">
          <div className="welcome-text">
            <h1>{pharmacy?.name || "Pharmacy Portal"}</h1>
            <p>Status: <span style={{ color: '#059669', fontWeight: 600 }}>Connected to Database</span> • Local Time: {new Date().toLocaleTimeString()}</p>
          </div>
          <button className="btn-primary-hms" onClick={() => setOpenAddDialog(true)}>
            <FaPlus /> Add New Medicine
          </button>
        </header>

        <section className="hospital-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: '#ebf8ff', color: '#2b6cb0' }}><FaCapsules /></div>
            <div className="stat-info">
              <h3>{inventory.length}</h3>
              <p>Medicines Tracked</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: '#f0fff4', color: '#2f855a' }}><FaShoppingBasket /></div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === 'Pending').length}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: '#fff5f5', color: '#e53e3e' }}><FaExclamationTriangle /></div>
            <div className="stat-info">
              <h3>{lowStockCount}</h3>
              <p>Low Stock Alerts</p>
            </div>
          </div>
        </section>

        <div className="glass-panel">
          {activeTab === 'inventory' ? (
            <div className="inventory-view">
              <div className="section-title"><FaBoxes /> Current Medicine Inventory</div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Stock Count</th>
                    <th>Price (NPR)</th>
                    <th>Prescription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600 }}>{item.medicineId?.name}</td>
                      <td><span className="badge badge-blue">{item.medicineId?.category}</span></td>
                      <td style={{ color: item.stock < 10 ? '#e53e3e' : 'inherit' }}>
                        {item.stock} Units {item.stock < 10 && <FaExclamationTriangle title="Low Stock!" />}
                      </td>
                      <td>Rs. {item.medicineId?.price}</td>
                      <td>{item.medicineId?.prescriptionRequired ? "Required" : "Not Required"}</td>
                      <td>
                        <button className="btn-primary-hms" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => {
                          setFormData({ ...formData, medicineId: item.medicineId?._id, name: item.medicineId?.name, stock: item.stock });
                          setOpenAddDialog(true);
                        }}>Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="orders-view">
              <div className="section-title"><FaShoppingBasket /> Patient Medicine Requests</div>
              <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {orders.length === 0 ? <p>No active orders found.</p> : orders.map(order => (
                  <div key={order._id} className="order-card-premium" style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{order.medicineId?.name}</h4>
                      <span className={`badge ${order.status === 'Pending' ? 'badge-blue' : 'badge-green'}`}>{order.status}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      <p><strong>Patient:</strong> {order.patientId?.firstName} {order.patientId?.lastName}</p>
                      <p><strong>Quantity:</strong> {order.quantity} Units</p>
                    </div>
                    {order.prescriptionImageUrl && (
                      <div style={{ margin: '15px 0' }}>
                        <a href={`${API_BASE_URL}${order.prescriptionImageUrl}`} target="_blank" rel="noreferrer" style={{ color: '#ff6b35', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                          <FaFilePrescription /> View Prescription
                        </a>
                      </div>
                    )}
                    {order.status === "Pending" && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <Button variant="contained" color="success" size="small" fullWidth onClick={() => updateOrderStatus(order._id, "Approved")}>Approve</Button>
                        <Button variant="outlined" color="error" size="small" fullWidth onClick={() => updateOrderStatus(order._id, "Rejected")}>Reject</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Medicine Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: '#0a192f' }}>Update Inventory Stock</DialogTitle>
        <DialogContent dividers>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            <Autocomplete
              options={allMedicines}
              getOptionLabel={(option) => option.name}
              onChange={(e, val) => {
                if (val) setFormData({ ...formData, medicineId: val._id, name: val.name, category: val.category, genericSalt: val.genericSalt, price: val.price, prescriptionRequired: val.prescriptionRequired });
                else setFormData({ ...formData, medicineId: "", name: "" });
              }}
              renderInput={(params) => <TextField {...params} label="Search Existing Medicine" placeholder="Type name..." fullWidth />}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>OR ADD NEW</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            <TextField label="Medicine Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} fullWidth disabled={!!formData.medicineId} />
            
            {!formData.medicineId && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <TextField select label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} fullWidth>
                    {Categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                  <TextField label="Price (NPR)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} fullWidth />
                </div>
                <TextField label="Generic Salt/Composition" value={formData.genericSalt} onChange={e => setFormData({ ...formData, genericSalt: e.target.value })} fullWidth />
              </>
            )}
            
            <TextField label="Stock Quantity to Add/Update" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} fullWidth color="primary" />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddMedicine} disabled={saving} sx={{ background: '#ff6b35', '&:hover': { background: '#e85a28' } }}>
            {saving ? <CircularProgress size={24} /> : "Save to Inventory"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DashboardPharmacy;
