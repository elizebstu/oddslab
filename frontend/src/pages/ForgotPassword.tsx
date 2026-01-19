import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { otpService } from '../services/otpService';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendOtp = async () => {
    setError('');
    if (!email) {
      setError(t('auth.otp.email_required'));
      return;
    }

    setLoading(true);
    try {
      await otpService.sendResetOtp(email);
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      const errorMessage = (err as any)?.response?.data?.error;
      setError(errorMessage || t('auth.otp.send_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !code || !newPassword) {
      setError(t('auth.reset.all_fields_required'));
      return;
    }

    if (code.length !== 6) {
      setError(t('auth.otp.invalid_code_format'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.reset.password_too_short'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.reset.passwords_not_match'));
      return;
    }

    setLoading(true);
    try {
      await otpService.resetPassword(email, code, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = (err as any)?.response?.data?.error;
      setError(errorMessage || t('auth.reset.failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown === 0) {
      handleSendOtp();
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
            {t('auth.reset.title')}<span className="text-neon-purple glow-text-purple">{t('auth.reset.title_highlight')}</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">{t('auth.reset.subtitle')}</p>
        </div>

        <Card variant="neon-purple" className="p-8 md:p-10 border-white/10 backdrop-blur-xl bg-midnight-900/40">
          {!otpSent ? (
            <div className="space-y-6">
              <Input
                label={t('auth.otp.email_label')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.otp.email_placeholder')}
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
                type="button"
                variant="secondary"
                className="w-full h-12 !bg-neon-purple !border-neon-purple"
                isLoading={loading}
                disabled={loading}
                onClick={handleSendOtp}
              >
                {t('auth.otp.send_code')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-white/60">{t('auth.otp.code_sent_to')}</p>
                <p className="text-sm font-bold text-white">{email}</p>
              </div>

              <Input
                label={t('auth.otp.code_label')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={t('auth.otp.code_placeholder')}
                required
              />

              <Input
                label={t('auth.reset.new_password_label')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.reset.password_placeholder')}
                required
                minLength={6}
              />

              <Input
                label={t('auth.reset.confirm_password_label')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.reset.confirm_password_placeholder')}
                required
                minLength={6}
              />

              {error && (
                <div className="bg-neon-red/10 border border-neon-red/50 p-4 skew-x-[-6deg]">
                  <div className="skew-x-[6deg] flex items-center gap-3 text-neon-red">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-neon-green/10 border border-neon-green/50 p-4 skew-x-[-6deg]">
                  <div className="skew-x-[6deg] flex items-center gap-3 text-neon-green">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('auth.reset.success')}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                className="w-full h-12 !bg-neon-purple !border-neon-purple"
                isLoading={loading}
                disabled={loading || success}
              >
                {t('auth.reset.reset_button')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className="text-xs font-bold text-neon-purple hover:text-white transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? t('auth.otp.resend_countdown', { seconds: countdown })
                    : t('auth.otp.resend_code')
                  }
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setCode('');
                    setError('');
                  }}
                  className="text-xs font-bold text-white/50 hover:text-white transition-colors"
                >
                  {t('auth.otp.change_email')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              {t('auth.otp.remember_password')}{' '}
              <Link to="/login" className="text-neon-purple font-black hover:text-white transition-colors">
                {t('auth.otp.back_to_login')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
