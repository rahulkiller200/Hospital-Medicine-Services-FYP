import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { getAuthToken } from "../../utils/auth";

const DashboardPharmacy = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        axios.get("http://localhost:3001/api/v1/pharmacies/orders", {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true
        }),
        axios.get("http://localhost:3001/api/v1/pharmacies/profile", {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true
        })
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (profileRes.data.success) setInventory(profileRes.data.data.inventory || []);
    } catch (error) {
      toast.error("Error fetching pharmacy data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/v1/pharmacies/order/${orderId}`, 
        { status },
        { 
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true 
        }
      );
      if (response.data.success) {
        toast.success(`Order ${status.toLowerCase()}ed!`);
        fetchData();
      }
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Pharmacy Portal</h3>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          <i className="fas fa-shopping-basket"></i> Pending Orders
        </button>
        <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>
          <i className="fas fa-boxes"></i> Inventory
        </button>
      </div>

      <div className="main-content">
        {loading ? (
          <div className="spinner"></div>
        ) : activeTab === "orders" ? (
          <div className="orders-section">
            <h2>Incoming Medicine Requests</h2>
            <div className="orders-grid">
              {orders.length === 0 ? <p>No pending orders</p> : orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h4>{order.medicineId?.name}</h4>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div className="order-body">
                    <p><strong>Patient:</strong> {order.patientId?.firstName} {order.patientId?.lastName}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    {order.prescriptionImageUrl && (
                      <div className="prescription-view">
                        <p><strong>Prescription:</strong></p>
                        <a href={`http://localhost:3001${order.prescriptionImageUrl}`} target="_blank" rel="noreferrer" className="view-link">
                          <i className="fas fa-image"></i> View Prescription Photo
                        </a>
                      </div>
                    )}
                  </div>
                  {order.status === "Pending" && (
                    <div className="order-actions">
                      <button className="approve-btn" onClick={() => updateStatus(order._id, "Approved")}>Approve & Notify</button>
                      <button className="reject-btn" onClick={() => updateStatus(order._id, "Rejected")}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="inventory-section">
            <h2>Current Stock Levels</h2>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Stock Count</th>
                  <th>Prescription?</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item._id}>
                    <td>{item.medicineId?.name}</td>
                    <td>{item.medicineId?.category}</td>
                    <td>{item.stock} units</td>
                    <td>{item.medicineId?.prescriptionRequired ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPharmacy;
