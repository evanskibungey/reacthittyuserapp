import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  
  // Form states
  const [formData, setFormData] = useState({
    // Personal Details
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    
    // Business Details
    business_name: '',
    business_phone: '',
    business_email: '',
    business_address: '',
    
    // Location & Zone Details
    zone_id: '',
    latitude: '',
    longitude: '',
    
    // Document Details
    id_number: '',
    business_registration_number: '',
    
    // Account Details
    password: '',
    password_confirmation: '',
    
    // Agreement
    terms_agreed: false
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Available zones for selection
  const [availableZones, setAvailableZones] = useState([]);
  
  // Fetch available zones when component mounts
  React.useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await api.get('/zones');
        if (response.data && response.data.success) {
          setAvailableZones(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error);
        // Use sample data if API fails
        setAvailableZones([
          { id: 1, name: 'Nairobi Central' },
          { id: 2, name: 'Westlands' },
          { id: 3, name: 'Eastleigh' },
          { id: 4, name: 'Karen' }
        ]);
      }
    };
    
    fetchZones();
  }, []);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear the error for this field when user edits it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Location detection
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          
          toast.success('Location detected successfully!');
        },
        (error) => {
          console.error('Error detecting location:', error);
          toast.error('Failed to detect location. Please enter coordinates manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };
  
  // Move to next step
  const nextStep = () => {
    // Validate current step before proceeding
    const currentStepValid = validateStep(step);
    
    if (currentStepValid) {
      setStep(step + 1);
      window.scrollTo(0, 0); // Scroll to top for better UX
    }
  };
  
  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0); // Scroll to top for better UX
  };
  
  // Validate form step
  const validateStep = (currentStep) => {
    let stepErrors = {};
    let isValid = true;
    
    if (currentStep === 1) {
      // Personal Details validation
      if (!formData.first_name.trim()) {
        stepErrors.first_name = 'First name is required';
        isValid = false;
      }
      
      if (!formData.last_name.trim()) {
        stepErrors.last_name = 'Last name is required';
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        stepErrors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = 'Email is invalid';
        isValid = false;
      }
      
      if (!formData.phone.trim()) {
        stepErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        stepErrors.phone = 'Phone number is invalid';
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Business Details validation
      if (!formData.business_name.trim()) {
        stepErrors.business_name = 'Business name is required';
        isValid = false;
      }
      
      if (!formData.business_phone.trim()) {
        stepErrors.business_phone = 'Business phone number is required';
        isValid = false;
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.business_phone.replace(/[\s-]/g, ''))) {
        stepErrors.business_phone = 'Business phone number is invalid';
        isValid = false;
      }
      
      if (formData.business_email && !/\S+@\S+\.\S+/.test(formData.business_email)) {
        stepErrors.business_email = 'Business email is invalid';
        isValid = false;
      }
      
      if (!formData.business_address.trim()) {
        stepErrors.business_address = 'Business address is required';
        isValid = false;
      }
    } else if (currentStep === 3) {
      // Location & Zone validation
      if (!formData.zone_id) {
        stepErrors.zone_id = 'Zone selection is required';
        isValid = false;
      }
      
      if (!formData.latitude || !formData.longitude) {
        stepErrors.location = 'Location coordinates are required';
        isValid = false;
      }
    } else if (currentStep === 4) {
      // Document Details validation
      if (!formData.id_number.trim()) {
        stepErrors.id_number = 'ID number is required';
        isValid = false;
      }
      
      if (!formData.business_registration_number.trim()) {
        stepErrors.business_registration_number = 'Business registration number is required';
        isValid = false;
      }
    } else if (currentStep === 5) {
      // Account validation
      if (!formData.password) {
        stepErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 4) {
        stepErrors.password = 'Password must be at least 4 characters';
        isValid = false;
      }
      
      if (!formData.password_confirmation) {
        stepErrors.password_confirmation = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.password_confirmation) {
        stepErrors.password_confirmation = 'Passwords do not match';
        isValid = false;
      }
      
      if (!formData.terms_agreed) {
        stepErrors.terms_agreed = 'You must agree to the terms and conditions';
        isValid = false;
      }
    }
    
    setErrors(stepErrors);
    return isValid;
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the final step before submission
    const isValid = validateStep(step);
    
    if (!isValid) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the data for the API
      const vendorData = {
        ...formData,
        role: 'vendor', // Set role to vendor
      };
      
      // Send registration request
      const response = await api.post('/vendors/register', vendorData);
      
      if (response.data && response.data.success) {
        toast.success('Vendor registration successful! Your application is under review.');
        
        // Redirect to success page or login page
        setTimeout(() => {
          navigate('/vendor-registration-success');
        }, 2000);
      } else {
        toast.error(response.data?.message || 'Registration failed. Please try again.');
        
        // Set specific error messages from the API response
        if (response.data?.errors) {
          setErrors(response.data.errors);
        }
      }
    } catch (error) {
      console.error('Vendor registration error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      
      toast.error(error.response?.data?.message || 'Registration failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render progress steps
  const renderProgress = () => {
    const steps = [
      { number: 1, label: 'Personal Details' },
      { number: 2, label: 'Business Info' },
      { number: 3, label: 'Location' },
      { number: 4, label: 'Documents' },
      { number: 5, label: 'Account' }
    ];
    
    return (
      <div className="w-full py-6">
        <div className="flex items-center">
          {steps.map((stepItem, i) => (
            <React.Fragment key={stepItem.number}>
              {/* Step circle */}
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold ${
                  step >= stepItem.number ? 'bg-purple-700' : 'bg-gray-300'
                } ${step === stepItem.number ? 'ring-4 ring-purple-100' : ''}`}
              >
                {stepItem.number}
              </div>
              
              {/* Step label */}
              <div className={`ml-2 text-sm hidden sm:block ${step >= stepItem.number ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
                {stepItem.label}
              </div>
              
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div 
                  className={`flex-1 h-1 mx-4 ${
                    step > stepItem.number ? 'bg-purple-700' : 'bg-gray-300'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // Render form steps
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-red-500 text-sm">{errors.first_name}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-red-500 text-sm">{errors.last_name}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="business_name">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.business_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your business name"
                  />
                </div>
                {errors.business_name && (
                  <p className="mt-1 text-red-500 text-sm">{errors.business_name}</p>
                )}
              </div>
              
              {/* Business Phone */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="business_phone">
                  Business Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="business_phone"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.business_phone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter business phone number"
                  />
                </div>
                {errors.business_phone && (
                  <p className="mt-1 text-red-500 text-sm">{errors.business_phone}</p>
                )}
              </div>
              
              {/* Business Email */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="business_email">
                  Business Email (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="business_email"
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.business_email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter business email address"
                  />
                </div>
                {errors.business_email && (
                  <p className="mt-1 text-red-500 text-sm">{errors.business_email}</p>
                )}
              </div>
              
              {/* Business Address */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="business_address">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <textarea
                    id="business_address"
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.business_address ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter detailed business address"
                  ></textarea>
                </div>
                {errors.business_address && (
                  <p className="mt-1 text-red-500 text-sm">{errors.business_address}</p>
                )}
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Location and Zone</h2>
            
            <div className="space-y-6">
              {/* Zone Selection */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="zone_id">
                  Select Zone <span className="text-red-500">*</span>
                </label>
                <select
                  id="zone_id"
                  name="zone_id"
                  value={formData.zone_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.zone_id ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">-- Select a Zone --</option>
                  {availableZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
                {errors.zone_id && (
                  <p className="mt-1 text-red-500 text-sm">{errors.zone_id}</p>
                )}
              </div>
              
              {/* Location Coordinates */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-gray-700">
                    Location Coordinates <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="text-sm text-purple-700 hover:text-purple-900 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Detect My Location
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="Longitude"
                    />
                  </div>
                </div>
                {errors.location && (
                  <p className="mt-1 text-red-500 text-sm">{errors.location}</p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Your exact location helps us assign you to the correct zone and enables customers to find you more easily.
                </p>
              </div>
              
              {/* Google Maps Preview (placeholder) */}
              <div className="mt-4">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-300">
                  <div className="text-center text-gray-500">
                    <FaMapMarkerAlt className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p>Location map preview will appear here after coordinates are entered.</p>
                    <p className="text-sm mt-2">Note: Actual map integration will be implemented in final version.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Document Information</h2>
            
            <div className="space-y-6">
              {/* ID Number */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="id_number">
                  National ID Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="id_number"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.id_number ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your ID number"
                  />
                </div>
                {errors.id_number && (
                  <p className="mt-1 text-red-500 text-sm">{errors.id_number}</p>
                )}
              </div>
              
              {/* Business Registration Number */}
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="business_registration_number">
                  Business Registration Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="business_registration_number"
                    name="business_registration_number"
                    value={formData.business_registration_number}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border ${
                      errors.business_registration_number ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter business registration number"
                  />
                </div>
                {errors.business_registration_number && (
                  <p className="mt-1 text-red-500 text-sm">{errors.business_registration_number}</p>
                )}
              </div>
              
              {/* Document Upload - This will be implemented with file upload functionality in the final version */}
              <div className="space-y-4">
                <label className="block text-gray-700 font-medium">Document Uploads</label>
                <p className="text-sm text-gray-600 mb-4">
                  Please note: In the complete implementation, you will be required to upload the following documents:
                </p>
                
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinej