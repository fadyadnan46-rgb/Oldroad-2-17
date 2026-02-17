import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupRequested = searchParams.get('signup') === 'true';

  const [mode, setMode] = useState<AuthMode>(signupRequested ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (signupRequested) {
      setMode('signup');
    } else {
      setMode('login');
    }
    setResetSent(false);
  }, [signupRequested]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setResetSent(true);
      }, 1200);
      return;
    }
    onLogin(email);
    navigate('/dashboard');
  };

  const handleToggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-slate-200 p-8 transition-all">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black font-bold mb-2 text-slate-800 uppercase">
            {resetSent ? 'Check Your Inbox' : mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-slate-600 text-sm">
            {resetSent 
              ? `We've sent recovery instructions to ${email}.`
              : mode === 'login' 
                ? 'Access your dashboard and favorites.' 
                : mode === 'signup' 
                  ? 'Join the OldRoad Auto community.' 
                  : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {resetSent ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-paper-plane text-2xl"></i>
            </div>
            <button 
              onClick={() => handleToggleMode('login')}
              className="w-full bg-red-600 text-white py-4 rounded-sm font-bold text-lg hover:bg-red-700 transition-all shadow-md"
            >
              Return to Login
            </button>
            <p className="text-sm text-slate-500">
              Didn't receive an email? <button onClick={() => setResetSent(false)} className="text-red-600 font-bold hover:underline">Try again</button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">First Name</label>
                  <input type="text" required className="w-full p-3 bg-white border border-slate-300 rounded-sm outline-none focus:border-red-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Last Name</label>
                  <input type="text" required className="w-full p-3 bg-white border border-slate-300 rounded-sm outline-none focus:border-red-600" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full p-3 bg-white border border-slate-300 rounded-sm outline-none focus:border-red-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@oldroad.auto"
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Password</label>
                <input type="password" required className="w-full p-3 bg-white border border-slate-300 rounded-sm outline-none focus:border-red-600" />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => handleToggleMode('reset')}
                  className="text-sm text-red-600 font-bold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="marketing" className="w-4 h-4 rounded text-red-600" />
                <label htmlFor="marketing" className="text-sm text-slate-600 cursor-pointer">I agree to receive marketing updates.</label>
              </div>
            )}

            <button 
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-4 rounded-sm font-bold text-lg hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-red-600 uppercase text-xs"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Register Now' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!resetSent && (
          <div className="mt-8 text-center pt-8 border-t border-slate-200">
            {mode === 'reset' ? (
              <button 
                onClick={() => handleToggleMode('login')}
                className="text-slate-600 font-bold hover:text-red-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i> Back to Login
              </button>
            ) : (
              <p className="text-slate-600 text-sm">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => handleToggleMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 font-bold text-red-600 hover:underline"
                >
                  {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-sm text-center text-xs border border-slate-200">
        <p className="text-slate-700">
          <i className="fa-solid fa-circle-info mr-2"></i>
          Test credentials: <b>admin@oldroad.auto</b>, <b>sales@oldroad.auto</b>, or <b>customer@gmail.com</b>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;