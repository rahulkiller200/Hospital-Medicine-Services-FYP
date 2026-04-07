import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaHistory, FaEdit, FaSignOutAlt, FaHome, FaHeartbeat, FaRunning, FaCalendarAlt, FaFileMedical, FaUserMd } from "react-icons/fa";

function UpdateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    height: "",
    weight: "",
    address: "",
    phoneNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: ""
    },
    allergies: "",
    currentMedications: "",
    pastSurgeries: "",
    chronicConditions: "",
    familyHistory: "",
    lifestyle: {
      smoking: "",
      alcohol: "",
      exercise: "",
      diet: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.withCredentials = true;
        }

        const [profileResponse, historyResponse] = await Promise.all([
          axios.get("http://localhost:3001/api/v1/patient-history/profile"),
          axios.get("http://localhost:3001/api/v1/patient-history/history")
        ]);

        if (profileResponse.data.success && historyResponse.data.success) {
          const profileData = profileResponse.data.data;
          const historyData = historyResponse.data.data;
          
          setFormData({
            fullName: historyData.fullName || "",
            dateOfBirth: historyData.dateOfBirth ? new Date(historyData.dateOfBirth).toISOString().split('T')[0] : "",
            gender: historyData.gender || "",
            bloodGroup: historyData.bloodGroup || "",
            height: historyData.height || "",
            weight: historyData.weight || "",
            address: historyData.address || "",
            phoneNumber: historyData.phoneNumber || "",
            emergencyContact: {
              name: historyData.emergencyContact?.name || "",
              relationship: historyData.emergencyContact?.relationship || "",
              phoneNumber: historyData.emergencyContact?.phoneNumber || ""
            },
            allergies: historyData.allergies?.join("\n") || "",
            currentMedications: historyData.currentMedications?.join("\n") || "",
            pastSurgeries: historyData.pastSurgeries?.join("\n") || "",
            chronicConditions: historyData.chronicConditions?.join("\n") || "",
            familyHistory: historyData.familyHistory?.join("\n") || "",
            lifestyle: {
              smoking: historyData.lifestyle?.smoking || "",
              alcohol: historyData.lifestyle?.alcohol || "",
              exercise: historyData.lifestyle?.exercise || "",
              diet: historyData.lifestyle?.diet || ""
            }
          });
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setError(error.response?.data?.message || "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Prepare the data in the correct format
      const submitData = {
        fullName: formData.fullName.trim(),
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        emergencyContact: {
          name: formData.emergencyContact.name.trim(),
          relationship: formData.emergencyContact.relationship.trim(),
          phoneNumber: formData.emergencyContact.phoneNumber.trim()
        },
        allergies: formData.allergies.split('\n').filter(Boolean).map(a => a.trim()),
        currentMedications: formData.currentMedications.split('\n').filter(Boolean).map(m => m.trim()),
        pastSurgeries: formData.pastSurgeries.split('\n').filter(Boolean).map(s => s.trim()),
        chronicConditions: formData.chronicConditions.split('\n').filter(Boolean).map(c => c.trim()),
        familyHistory: formData.familyHistory.split('\n').filter(Boolean).map(f => f.trim()),
        lifestyle: {
          smoking: formData.lifestyle.smoking,
          alcohol: formData.lifestyle.alcohol,
          exercise: formData.lifestyle.exercise,
          diet: formData.lifestyle.diet
        }
      };

      const response = await axios.post(
        "http://localhost:3001/api/v1/patient-history",
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="update-profile-container">
      <div className="update-profile-header">
        <h2>Update Profile</h2>
        <p>Please update your information below</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="update-profile-form" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h3>Emergency Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="emergencyContact.phoneNumber"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="form-section">
          <h3>Medical History</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Allergies (one per line)</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Current Medications (one per line)</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Past Surgeries (one per line)</label>
              <textarea
                name="pastSurgeries"
                value={formData.pastSurgeries}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Chronic Conditions (one per line)</label>
              <textarea
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Family History (one per line)</label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="form-section">
          <h3>Lifestyle</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Smoking Status</label>
              <select
                name="lifestyle.smoking"
                value={formData.lifestyle.smoking}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alcohol Consumption</label>
              <select
                name="lifestyle.alcohol"
                value={formData.lifestyle.alcohol}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="never">Never</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <div className="form-group">
              <label>Exercise Frequency</label>
              <select
                name="lifestyle.exercise"
                value={formData.lifestyle.exercise}
                onChange={handleChange}
              >
                <option value="">Select Frequency</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-group">
              <label>Diet Type</label>
              <input
                type="text"
                name="lifestyle.diet"
                value={formData.lifestyle.diet}
                onChange={handleChange}
                placeholder="e.g., Vegetarian, Vegan, etc."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={() => navigate("/profile")}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProfile; 