import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PatientHistoryForm() {
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
    smoking: "",
    alcohol: "",
    exercise: "",
    diet: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Configure axios defaults
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
    }

    // Load stored user data
    const storedData = localStorage.getItem("patientFormData");
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || userData.fullName || userData.username || ""
        }));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation
    if (name === "phoneNumber" || name === "emergencyContact.phoneNumber") {
      // Only allow digits and limit to 10 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: phoneValue
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: phoneValue
        }));
      }
      return;
    }

    // Date of birth validation
    if (name === "dateOfBirth") {
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 3);

      if (selectedDate > minDate) {
        setError('Age must be at least 3 years old');
        return;
      } else {
        setError(''); // Clear error if date is valid
      }
    }

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
    setIsLoading(true);
    setError("");

    // Get and validate token
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setIsLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'bloodGroup',
      'height',
      'weight',
      'address',
      'phoneNumber',
      'emergencyContact.name',
      'emergencyContact.relationship',
      'emergencyContact.phoneNumber'
    ];

    const missingFields = requiredFields.filter(field => {
      const [parent, child] = field.split('.');
      if (child) {
        return !formData[parent]?.[child];
      }
      return !formData[field];
    });

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    // Validate date of birth
    const selectedDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 3);

    if (selectedDate > minDate) {
      setError('Age must be at least 3 years old');
      setIsLoading(false);
      return;
    }

    // Validate phone numbers
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number (10 digits)');
      setIsLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.emergencyContact.phoneNumber)) {
      setError('Please enter a valid emergency contact phone number (10 digits)');
      setIsLoading(false);
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(formData.height)) || isNaN(parseFloat(formData.weight))) {
      setError('Height and weight must be valid numbers');
      setIsLoading(false);
      return;
    }

    try {
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
          smoking: formData.smoking,
          alcohol: formData.alcohol,
          exercise: formData.exercise,
          diet: formData.diet
        },
        username: localStorage.getItem('username'),
        userId: localStorage.getItem('userId')
      };
      
      const response = await axios.post(
        "http://localhost:3001/api/v1/patient-history",
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Clear the stored form data
        localStorage.removeItem("patientFormData");
        // Store patient history ID
        localStorage.setItem("patientHistoryId", response.data.data._id);
        // Redirect to home
        navigate("/home");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      console.error("Error response:", error.response?.data);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to save patient history. Please check your input and try again.";
      
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Patient-Form">
      <div className="PatientForm">
        <h1>Patient History Form</h1>
        <p className="small-text">Please fill in your medical information</p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="Patient__Field">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
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
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0]}
                title="Must be at least 3 years old"
                required
              />
              <small className="form-text text-muted">Must be at least 3 years old</small>
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
                placeholder="Enter your height in cm"
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
                placeholder="Enter your weight in kg"
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
                placeholder="Enter your address"
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
                placeholder="Enter your phone number (10 digits)"
                pattern="\d{10}"
                title="Please enter a valid phone number (10 digits)"
                required
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="Patient__Field">
            <h2>Emergency Contact</h2>
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
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
                placeholder="Enter relationship"
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
                placeholder="Enter emergency contact phone number (10 digits)"
                pattern="\d{10}"
                title="Please enter a valid phone number (10 digits)"
                required
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="Patient__Field">
            <h2>Medical History</h2>
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies (one per line)"
              />
            </div>
            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                placeholder="List current medications (one per line)"
              />
            </div>
            <div className="form-group">
              <label>Past Surgeries</label>
              <textarea
                name="pastSurgeries"
                value={formData.pastSurgeries}
                onChange={handleChange}
                placeholder="List past surgeries (one per line)"
              />
            </div>
            <div className="form-group">
              <label>Chronic Conditions</label>
              <textarea
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                placeholder="List chronic conditions (one per line)"
              />
            </div>
            <div className="form-group">
              <label>Family History</label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                placeholder="List family medical history (one per line)"
              />
            </div>
          </div>

          {/* Lifestyle */}
          <div className="Patient__Field">
            <h2>Lifestyle</h2>
            <div className="form-group">
              <label>Smoking</label>
              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                required
              >
                <option value="">Select Smoking Status</option>
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div className="form-group">
              <label>Alcohol</label>
              <select
                name="alcohol"
                value={formData.alcohol}
                onChange={handleChange}
                required
              >
                <option value="">Select Alcohol Consumption</option>
                <option value="never">Never</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <div className="form-group">
              <label>Exercise</label>
              <select
                name="exercise"
                value={formData.exercise}
                onChange={handleChange}
                required
              >
                <option value="">Select Exercise Frequency</option>
                <option value="never">Never</option>
                <option value="rarely">Rarely</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-group">
              <label>Diet</label>
              <textarea
                name="diet"
                value={formData.diet}
                onChange={handleChange}
                placeholder="Describe your diet"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="Patient__Button">
            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientHistoryForm;
