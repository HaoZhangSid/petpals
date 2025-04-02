import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore'; // To potentially log in after registration
import { api } from '../services/api'; // To call the registration endpoint

const Register = () => {
  const navigate = useNavigate();
  // We might not need the login function directly here if the API returns a token we can use
  // const login = useUserStore(state => state.login);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Loading and Error State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // --- Validation Logic --- 
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) { // Example minimum length
      errors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!location.trim()) errors.location = 'Location is required.';
    if (!termsAccepted) errors.terms = 'You must accept the terms and conditions.';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Form Submission Handler --- 
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setFieldErrors({});

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);

    try {
      // Prepare data for API (adjust structure based on backend needs)
      const registrationData = {
        firstName,
        lastName,
        email,
        password,
        location
      };

      // Make API call to registration endpoint
      const response = await api.post('/api/auth/register', registrationData);

      // Handle success - e.g., show message, redirect to login, or auto-login
      console.log('Registration successful:', response.data);
      // Redirect to login with success message
      navigate('/login?registered=true&addPet=true'); 
      // The addPet parameter will be used to show a prompt to add pet after login

    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl bg-white rounded-3xl shadow-soft overflow-hidden">
        {/* Left Column - Image and Info */}
        <div className="hidden md:block relative bg-gradient-to-r from-skyblue to-mintgreen">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 register-animation">
              <img 
                src="https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80" 
                alt="Cute Dog" 
                className="w-60 h-60 object-cover rounded-full border-8 border-white shadow-lg mx-auto mb-6"
              />
              <h2 className="text-2xl font-bold text-white mb-2">Join Our Pawsome Community!</h2>
              <p className="text-white text-opacity-90 mb-6">Create an account to connect with pet lovers, find playdates, and share beautiful moments with your furry friends.</p>
              <div className="flex justify-center space-x-2">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                  <span className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></span>
                  <span className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-mintgreen to-transparent"></div>
          <div className="absolute top-6 right-6">
              <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-full px-4 py-2 text-white shadow-sm">
                  <span className="mr-2">💖</span> Join 50,000+ pet parents
              </div>
          </div>
        </div>
            
        {/* Right Column - Registration Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
              <img 
                src="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Match-Me Logo" 
                className="w-20 h-20 rounded-full border-4 border-skyblue shadow-md inline-block"
              />
          </div>
                
          <h1 className="text-3xl font-bold text-purple-700 mb-2">Create Your Account</h1>
          <p className="text-gray-600 mb-8">Fill in your details to join our pet-loving community.</p>

          {/* General Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
                
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
                  <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.firstName ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                      <span className="text-gray-400 mr-3 text-lg">👤</span>
                      <input 
                          type="text" 
                          placeholder="Your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required 
                          className="bg-transparent w-full focus:outline-none text-sm"
                      />
                  </div>
                  {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.firstName}</p>}
              </div>
                        
              <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                  <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.lastName ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                      <span className="text-gray-400 mr-3 text-lg">👤</span>
                      <input 
                          type="text" 
                          placeholder="Your last name" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="bg-transparent w-full focus:outline-none text-sm"
                       />
                  </div>
                  {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.lastName}</p>}
              </div>
            </div>
                    
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
              <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.email ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                  <span className="text-gray-400 mr-3 text-lg">📧</span>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent w-full focus:outline-none text-sm"
                  />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.email}</p>}
            </div>
                    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                  <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.password ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                      <span className="text-gray-400 mr-3 text-lg">🔒</span>
                      <input 
                        type="password" 
                        placeholder="Create password (min. 6 chars)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-transparent w-full focus:outline-none text-sm"
                      />
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.password}</p>}
              </div>
                        
              <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                  <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                      <span className="text-gray-400 mr-3 text-lg">🔒</span>
                      <input 
                        type="password" 
                        placeholder="Confirm password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-transparent w-full focus:outline-none text-sm"
                      />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>
                    
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Your Location</label>
              <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${fieldErrors.location ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                  <span className="text-gray-400 mr-3 text-lg">📍</span>
                  <input 
                    type="text" 
                    placeholder="City, State" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-transparent w-full focus:outline-none text-sm"
                  />
              </div>
               {fieldErrors.location && <p className="text-red-500 text-xs mt-1 ml-4">{fieldErrors.location}</p>}
            </div>
                    
            <div className={`pt-2 ${fieldErrors.terms ? 'rounded-md border border-red-400 p-2' : ''}`}> 
              <div className="flex items-center">
                  <input 
                      type="checkbox" 
                      id="terms" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-softpink focus:ring-softpink"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <Link to="/terms" className="text-skyblue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-skyblue hover:underline">Privacy Policy</Link>
                  </label>
              </div>
               {fieldErrors.terms && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.terms}</p>}
            </div>
                    
            <button 
                type="submit"
                disabled={isLoading}
                className="paw-btn w-full bg-softpink hover:bg-pink-400 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
               {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
               ) : null}
               {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="pt-4 text-center">
                <p className="text-sm text-gray-600">After registration, you'll be able to add your pet's information.</p>
            </div>
          </form>
                
          <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-skyblue hover:underline font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 