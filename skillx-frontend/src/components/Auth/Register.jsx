import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    bio: '',
    skills_have: '',
    skills_want: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register/', formData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different types of errors
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.username) {
          setError(err.response.data.username[0]);
        } else if (err.response.data.email) {
          setError(err.response.data.email[0]);
        } else if (err.response.data.password) {
          setError(err.response.data.password[0]);
        } else {
          setError('Registration failed. Please check all fields.');
        }
      } else if (err.request) {
        setError('Network error. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Join SkillX
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
          
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          
          <textarea
            placeholder="Bio (optional)"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
          
          <input
            type="text"
            placeholder="Skills you have (comma-separated)"
            value={formData.skills_have}
            onChange={(e) => setFormData({...formData, skills_have: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
          
          <input
            type="text"
            placeholder="Skills you want (comma-separated)"
            value={formData.skills_want}
            onChange={(e) => setFormData({...formData, skills_want: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Register
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;