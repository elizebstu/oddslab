import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-midnight-950">
      {/* Background Ambience Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/5 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-9 h-9 bg-neon-green flex items-center justify-center skew-x-[-6deg] group-hover:shadow-neon-green transition-all">
              <span className="text-midnight-950 font-black text-xl skew-x-[6deg]">O</span>
            </div>
            <span className="text-xl font-display font-black tracking-tighter text-white">ODDS<span className="text-white/40">LAB</span></span>
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic text-white flex justify-center gap-3">
            SIGN <span className="text-neon-purple glow-text-purple">UP</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Start Tracking Smart Money</p>
        </div>

        <Card variant="neon-purple" className="p-8 md:p-10 border-white/10 backdrop-blur-xl bg-midnight-900/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-neon-red/10 border border-neon-red/50 p-4 skew-x-[-6deg]">
                <div className="skew-x-[6deg] flex items-center gap-3 text-neon-red">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              className="w-full h-12 !bg-neon-purple !border-neon-purple"
              isLoading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-neon-purple font-black hover:text-white transition-colors">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
