import React from 'react';
import { FaClipboardCheck, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './OrderTracker.css';

const OrderProgress = ({ status }) => {
  const steps = [
    { label: 'Pending', icon: <FaClipboardCheck />, statuses: ['Pending', 'Approved', 'Packing', 'Out for Delivery', 'Delivered'] },
    { label: 'Packing', icon: <FaBoxOpen />, statuses: ['Packing', 'Out for Delivery', 'Delivered'] },
    { label: 'Out for Delivery', icon: <FaTruck />, statuses: ['Out for Delivery', 'Delivered'] },
    { label: 'Delivered', icon: <FaCheckCircle />, statuses: ['Delivered'] }
  ];

  if (status === 'Cancelled' || status === 'Rejected') {
    return (
      <div className="order-progress-cancelled">
        <FaTimesCircle className="error-icon" />
        <span>Order {status}</span>
      </div>
    );
  }

  return (
    <div className="order-tracker-container">
      <div className="progress-track">
        {steps.map((step, index) => {
          const isActive = step.statuses.includes(status);
          const isCompleted = status !== step.label && isActive;
          
          return (
            <div key={index} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-icon">
                {step.icon}
                {isCompleted && <div className="check-badge">✓</div>}
              </div>
              <div className="step-label">{step.label}</div>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;
