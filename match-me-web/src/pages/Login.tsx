import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useModal } from '../contexts/ModalContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser, error, isLoading, user } = useUserStore();
  const { openAddPetModal } = useModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [shouldPromptAddPet, setShouldPromptAddPet] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true);
    }
    
    if (searchParams.get('addPet') === 'true') {
      setShouldPromptAddPet(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (shouldPromptAddPet) {
        navigate('/', { replace: true });
        
        setTimeout(() => {
          openAddPetModal();
        }, 500);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, shouldPromptAddPet, openAddPetModal]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    await loginUser({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl bg-white rounded-3xl shadow-soft overflow-hidden">
         <div className="hidden md:block relative bg-gradient-to-br from-softpink to-lavender">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80" 
                  alt="Happy Pets" 
                  className="w-60 h-60 object-cover rounded-full border-8 border-white shadow-lg mx-auto mb-6"
                />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                <p className="text-white text-opacity-90 mb-6">Log in to reconnect with your furry friends and the community.</p>
              </div>
            </div>
         </div>

        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
            <img 
              src="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" 
              alt="Match-Me Logo" 
              className="w-20 h-20 rounded-full border-4 border-skyblue shadow-md inline-block"
            />
          </div>
                
          <h1 className="text-3xl font-bold text-purple-700 mb-2">Sign In</h1>
          <p className="text-gray-600 mb-6">Enter your credentials to access your account.</p>

          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
              <span className="block sm:inline">Registration successful! Please log in.</span>
            </div>
          )}

          {(error || localError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
              <span className="block sm:inline">{error || localError}</span>
            </div>
          )}
                
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
              <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${localError && !email ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                  <span className="text-gray-400 mr-3 text-lg">📧</span>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLocalError(null); useUserStore.setState({ error: null }); }}
                    required
                    className="bg-transparent w-full focus:outline-none text-sm"
                  />
              </div>
            </div>
                    
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <div className={`bg-gray-50 rounded-full px-4 py-2.5 flex items-center border ${localError && !password ? 'border-red-400' : 'border-mintgreen'} shadow-sm focus-within:ring-2 focus-within:ring-softpink focus-within:border-softpink`}>
                  <span className="text-gray-400 mr-3 text-lg">🔒</span>
                  <input 
                    type="password" 
                    placeholder="Your password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalError(null); useUserStore.setState({ error: null }); }}
                    required
                    className="bg-transparent w-full focus:outline-none text-sm"
                  />
              </div>
               <div className="text-right mt-1">
                 <Link to="/forgot-password" className="text-xs text-skyblue hover:underline">
                   Forgot Password?
                 </Link>
               </div>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="paw-btn w-full bg-softpink hover:bg-pink-400 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
               {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
               ) : null}
               {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
                
          <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-skyblue hover:underline font-semibold">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 