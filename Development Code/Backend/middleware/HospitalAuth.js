const { body } = require('express-validator');
const { BedTypes, Specializations } = require('../models/HospitalModel');

exports.validateUserUpdate = [
  // Name validation
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  // Email validation
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Password validation
  body('currentPassword')
    .if(body('newPassword').exists())
    .notEmpty()
    .withMessage('Current password is required to update password'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
]; 

exports.validateHospital = [
  // Basic Information
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Hospital name is required'),

  // Contact Information - allow both contact and phone fields
  body(['contact', 'phone'])
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Please enter a valid Nepali phone number (10 digits)'),

  body('hotline')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Please enter a valid Nepali hotline number (10 digits)'),

  body('email')
    .optional()
    .trim()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Please enter a valid email address'),

  // Location Information - handle both string and object formats
  body('address')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const parts = value.split(',').map(s => s.trim());
        if (parts.length !== 3) {
          throw new Error('Address string must be in format: street, city, state');
        }
        if (!parts[0]) throw new Error('Street address is required');
        if (!parts[1]) throw new Error('City is required');
        if (!parts[2]) throw new Error('State is required');
      } else if (typeof value === 'object') {
        if (!value.street) throw new Error('Street address is required');
        if (!value.city) throw new Error('City is required');
        if (!value.state) throw new Error('State is required');
      } else {
        throw new Error('Address must be either a string or an object');
      }
      return true;
    }),

  body('position')
    .optional()
    .custom((position) => {
      if (!position || !position.lat || !position.lng) {
        throw new Error('Position must contain latitude and longitude');
      }
      const { lat, lng } = position;
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),

  // Hospital Status
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean value'),

  body('emergencyServices')
    .optional()
    .isBoolean()
    .withMessage('Emergency services must be a boolean value'),

  // Bed Information
  body('beds')
    .optional()
    .isArray()
    .withMessage('Beds must be an array')
    .custom((beds) => {
      if (!Array.isArray(beds)) return false;
      return beds.every(bed => {
        if (!bed.type || !Object.values(BedTypes).includes(bed.type)) {
          throw new Error('Invalid bed type');
        }
        if (typeof bed.total !== 'number' || bed.total < 0) {
          throw new Error('Total beds must be a non-negative number');
        }
        if (typeof bed.available !== 'number' || bed.available < 0 || bed.available > bed.total) {
          throw new Error('Available beds must be a non-negative number and cannot exceed total beds');
        }
        return true;
      });
    }),

  // Doctor Information
  body('doctors')
    .optional()
    .isArray()
    .withMessage('Doctors must be an array')
    .custom((doctors) => {
      if (!Array.isArray(doctors)) return false;
      return doctors.every(doctor => {
        if (!doctor.name || typeof doctor.name !== 'string') {
          throw new Error('Doctor name is required and must be a string');
        }
        if (!doctor.specialization || !Object.values(Specializations).includes(doctor.specialization)) {
          throw new Error('Invalid doctor specialization');
        }
        if (typeof doctor.available !== 'boolean') {
          throw new Error('Doctor availability must be a boolean');
        }
        return true;
      });
    }),

  // Optional Information
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
]; 