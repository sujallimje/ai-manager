"use client";
import { useState } from "react";

const PersonalDetailsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl text-blue-600 font-bold mb-2">
          Personal Details
        </h3>
        <p className="text-gray-600">
          Please provide your personal information to continue with your loan application.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your 10-digit phone number"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
              Current Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your current address"
            ></textarea>
            {errors.address && (
              <p className="mt-1 text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.dateOfBirth ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-red-500 text-sm">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsForm;