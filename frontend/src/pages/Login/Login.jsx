import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'Fleet Manager'
    }
  });

  const roles = [
    { name: 'Fleet Manager', email: 'admin@transitops.com', password: 'admin123' },
    { name: 'Dispatcher', email: 'dispatcher@transitops.com', password: 'dispatcher123' },
    { name: 'Safety Officer', email: 'safety@transitops.com', password: 'safety123' },
    { name: 'Financial Analyst', email: 'finance@transitops.com', password: 'finance123' }
  ];

  const handleRoleFill = (roleObj) => {
    setValue('email', roleObj.email);
    setValue('password', roleObj.password);
    setValue('role', roleObj.name);
    setErrorMsg(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password credentials. Account locked after 5 failed attempts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
      
      {/* Left panel: Illustration and info */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-slate-950 border-r border-brand-border text-center relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        
        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-accent flex items-center justify-center font-black text-brand-dark text-3xl shadow-xl shadow-brand-accent/20 mb-6">
            T
          </div>
          <h1 className="text-3xl font-black tracking-wider text-slate-100 uppercase">
            TransitOps
          </h1>
          <p className="text-xs uppercase font-extrabold text-brand-accent tracking-widest mt-1">
            Smart Transport Operations Platform
          </p>

          {/* Role selector panel matching mockups */}
          <div className="mt-12 w-full text-left">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3.5 text-center">
              Authorized Access Roles (Auto-fill)
            </h4>
            <div className="grid grid-cols-2 gap-3.5">
              {roles.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => handleRoleFill(r)}
                  className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-850 border border-brand-border/60 hover:border-slate-700 rounded-xl p-3 text-left transition-all active:scale-95"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-accent shrink-0" />
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-wide truncate">
                    {r.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-slate-600 font-bold">
          System Status: <span className="text-emerald-500">Optimal</span> | v4.2.0-stable
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-brand-dark relative">
        <div className="w-full max-w-md space-y-7.5">
          <div>
            <h2 className="text-2xl font-black text-brand-title uppercase tracking-wide">
              System Login
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
              Enter your credentials to access mission control.
            </p>
          </div>

          {/* Validation/Credential Error Display matching mockups */}
          {errorMsg && (
            <div className="bg-red-950/45 border border-red-500/25 rounded-lg p-3.5 flex items-start space-x-3">
              <FiAlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 font-semibold leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <Input
              label="Email Address"
              placeholder="name@transitops.com"
              icon={FiMail}
              type="email"
              error={errors.email}
              required
              {...register('email', { 
                required: 'Email address is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address.'
                }
              })}
            />

            {/* Password field */}
            <div className="relative">
              <Input
                label="Password"
                placeholder="••••••••"
                icon={FiLock}
                type={showPassword ? 'text' : 'password'}
                error={errors.password}
                required
                {...register('password', { 
                  required: 'Password is required.',
                  minLength: { value: 6, message: 'Password must be at least 6 characters.' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 bottom-3 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Operational Role Selector */}
            <Select
              label="Operational Role"
              options={roles.map(r => r.name)}
              placeholder=""
              {...register('role')}
            />

            {/* Remember Me and Forgot Password block */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-border bg-slate-900 text-brand-accent focus:ring-0 cursor-pointer"
                />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Remember this device for 30 days
                </span>
              </label>
              
              <button
                type="button"
                className="text-[10px] font-black uppercase tracking-wider text-brand-accent hover:text-brand-hover transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 text-xs uppercase tracking-widest font-black"
            >
              Sign In →
            </Button>
          </form>

          {/* Support links */}
          <div className="pt-6 border-t border-brand-border/40 flex items-center justify-center space-x-8 text-[9px] uppercase tracking-widest text-slate-600 font-extrabold">
            <a href="#support" className="hover:text-slate-400">Support</a>
            <a href="#compliance" className="hover:text-slate-400">Compliance</a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
