const { Hospital } = require('../models/HospitalModel');
const { validationResult } = require('express-validator');

// Get all hospitals
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .select('-__v')
      .sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single hospital
exports.getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('-__v');
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }
    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid hospital ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add new hospital
exports.addHospital = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      userId, 
      name, 
      type, 
      address, 
      contact,  
      position,
      available, 
      hotline, 
      beds, 
      doctors,
      email,
      website,
      description 
    } = req.body;

    // Check if hospital with same name exists
    const existingHospital = await Hospital.findOne({ name });
    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: 'Hospital with this name already exists'
      });
    }


    const [street, city, state] = address.split(',').map(s => s.trim());

    const hospital = new Hospital({
      userId,
      name,
      type,
      address: {
        street,
        city,
        state
      },
      phone: contact,
      position,
      available,
      hotline,
      beds,
      doctors,
      email,
      website,
      description
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, type, position, address, contact, available } = req.body;

    // Check if hospital exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Check if new name conflicts with existing hospital
    if (name !== hospital.name) {
      const existingHospital = await Hospital.findOne({ name });
      if (existingHospital) {
        return res.status(409).json({
          success: false,
          message: 'Hospital with this name already exists'
        });
      }
    }

    // Update hospital
    hospital.name = name || hospital.name;
    hospital.type = type || hospital.type;
    hospital.position = position || hospital.position;
    hospital.address = address || hospital.address;
    hospital.contact = contact || hospital.contact;
    hospital.available = available !== undefined ? available : hospital.available;

    // Enable bed and doctor updates through this route
    if (req.body.beds) hospital.beds = req.body.beds;
    if (req.body.doctors) hospital.doctors = req.body.doctors;
    if (req.body.hotline) hospital.hotline = req.body.hotline;

    await hospital.save();

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid hospital ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    await hospital.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid hospital ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get hospital for logged-in user
exports.getHospitalByUser = async (req, res) => {
  try {
    const username = req.user.username;
    const hospital = await Hospital.findOne({ username });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, data: hospital });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get hospital profile for logged-in hospital
exports.getHospitalProfile = async (req, res) => {
  try {
    console.log('getHospitalProfile: req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // First try to find hospital by userId
    let hospital = await Hospital.findOne({ userId: req.user.id });
    
    // If not found, try to find by name (for backward compatibility)
    if (!hospital) {
      hospital = await Hospital.findOne({ name: req.user.username });
      
      // If found by name, update it with userId
      if (hospital) {
        hospital.userId = req.user.id;
        await hospital.save();
        console.log('Updated hospital with userId:', hospital);
      }
    }
    
    console.log('getHospitalProfile: found hospital:', hospital);
    
    if (!hospital) {
      // Create a new hospital record for the user
      const newHospital = new Hospital({
        userId: req.user.id,
        name: req.user.username,
        type: 'hospital',
        address: 'Please update address',
        contact: '+977 9800000000',
        position: {
          lat: 0,
          lng: 0
        },
        available: true,
        hotline: '+977 9800000000',
        beds: [],
        doctors: []
      });

      await newHospital.save();
      console.log('Created new hospital:', newHospital);

      return res.status(200).json({
        success: true,
        data: newHospital,
        message: 'New hospital profile created'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('getHospitalProfile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching hospital profile' 
    });
  }
};

// Update hospital profile for logged-in hospital
exports.updateHospitalProfile = async (req, res) => {
  try {
    console.log('updateHospitalProfile: req.user:', req.user);
    console.log('updateHospitalProfile: req.body:', req.body);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    let hospital = await Hospital.findOne({ userId: req.user.id });
    console.log('updateHospitalProfile: found hospital:', hospital);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        error: 'Hospital not found' 
      });
    }

    // Handle general information updates
    const updateableFields = [
      'name', 'type', 'phone', 'hotline', 'email', 'website', 
      'description', 'available', 'emergencyServices'
    ];

    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        hospital[field] = req.body[field];
      }
    });

    // Handle contact/phone field
    if (req.body.contact) {
      hospital.phone = req.body.contact;
    }

    // Handle address update
    if (req.body.address) {
      if (typeof req.body.address === 'string') {
        const [street, city, state] = req.body.address.split(',').map(s => s.trim());
        hospital.address = { street, city, state };
      } else if (typeof req.body.address === 'object') {
        hospital.address = req.body.address;
      }
    }

    // Handle position update
    if (req.body.position) {
      hospital.position = req.body.position;
    }

    // Handle beds update
    if (req.body.beds) {
      // Validate bed data
      const validBeds = req.body.beds.every(bed => {
        return (
          bed.type && 
          typeof bed.total === 'number' && 
          typeof bed.available === 'number' &&
          bed.available <= bed.total
        );
      });

      if (!validBeds) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bed data format'
        });
      }
      hospital.beds = req.body.beds;
    }

    // Handle doctors update
    if (req.body.doctors) {
      // Validate doctor data
      const validDoctors = req.body.doctors.every(doctor => {
        return (
          doctor.name &&
          doctor.specialization &&
          typeof doctor.available === 'boolean'
        );
      });

      if (!validDoctors) {
        return res.status(400).json({
          success: false,
          error: 'Invalid doctor data format'
        });
      }
      hospital.doctors = req.body.doctors;
    }

    // Save the updated hospital
    try {
      await hospital.save();
      
      // Real-time broadcast
      if (req.io) {
        req.io.emit('hospital_updated', { message: `${hospital.name} has just updated their profile information in real-time!` });
      }

      res.status(200).json({
        success: true,
        data: hospital
      });
    } catch (saveError) {
      console.error('Error saving hospital:', saveError);
      return res.status(400).json({
        success: false,
        error: saveError.message || 'Error saving hospital data'
      });
    }
  } catch (error) {
    console.error('updateHospitalProfile error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error while updating hospital profile'
    });
  }
};

// Update hospital availability
exports.updateAvailability = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }

    // Real-time broadcast
    if (req.io) {
      req.io.emit('hospital_updated', { message: `${hospital.name} just marked itself as ${hospital.available ? 'Available' : 'Closed'}!` });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid hospital ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 