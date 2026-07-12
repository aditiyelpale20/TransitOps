import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiAlertCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { name: 'Fleet Manager', email: 'admin@transitops.com', password: 'admin123' },
    { name: 'Dispatcher', email: 'dispatcher@transitops.com', password: 'dispatcher123' },
    { name: 'Safety Officer', email: 'safety@transitops.com', password: 'safety123' },
    { name: 'Financial Analyst', email: 'finance@transitops.com', password: 'finance123' }
  ];

  const [selectedRole, setSelectedRole] = useState('Fleet Manager');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@transitops.com',
      password: ''
    }
  });

  // When selected role changes, pre-fill email and clear password/errors
  useEffect(() => {
    const matched = roles.find(r => r.name === selectedRole);
    if (matched) {
      setValue('email', matched.email);
      setValue('password', '');
      setErrorMsg(null);
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Invalid password. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordHint = () => {
    const matched = roles.find(r => r.name === selectedRole);
    return matched ? matched.password : 'Password';
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle grid accent background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
      
      <div className="w-full max-w-md bg-slate-950 border border-brand-border/60 rounded-2xl p-8 shadow-2xl relative z-10 space-y-7">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-accent flex items-center justify-center font-black text-brand-dark text-2xl shadow-xl shadow-brand-accent/20 mb-4">
            T
          </div>
          <h1 className="text-xl font-black tracking-wider text-slate-100 uppercase">
            TransitOps
          </h1>
          <p className="text-[9px] uppercase font-black text-brand-accent tracking-widest mt-0.5">
            Mission Control Center
          </p>
        </div>

        <div>
          <h2 className="text-base font-black text-brand-title uppercase tracking-wide text-center">
            System Sign In
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-wider text-center">
            Choose a dashboard role, enter password, and sign in.
          </p>
        </div>

        {/* Error message block */}
        {errorMsg && (
          <div className="bg-red-950/45 border border-red-500/25 rounded-lg p-3 flex items-start space-x-2.5">
            <FiAlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 font-semibold leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
          {/* Target Dashboard Role Selection */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">
              Target Dashboard
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-900 border border-brand-border/60 focus:border-brand-accent text-slate-250 rounded-lg p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-accent/50"
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email input field (Pre-filled for convenience) */}
          <Input
            label="Email Address"
            placeholder="name@transitops.com"
            icon={FiMail}
            type="email"
            readOnly
            className="opacity-75 bg-slate-900 cursor-not-allowed text-xs font-semibold text-slate-400"
            error={errors.email}
            required
            {...register('email', { required: true })}
          />

          {/* Password Input field */}
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
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 bottom-3.5 text-slate-500 hover:text-slate-350 text-[9px] font-black uppercase tracking-wider"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3 text-xs uppercase tracking-widest font-black mt-2"
          >
            Enter Dashboard →
          </Button>
        </form>

        <div className="text-center pt-2 text-[8px] uppercase tracking-widest text-slate-600 font-bold">
          Database Synced: <span className="text-emerald-500">Live SQLite fallback</span> | v4.2.0-stable
        </div>

      </div>
    </div>
  );
};

export default Login;
