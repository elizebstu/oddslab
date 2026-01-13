import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-midnight-950 border-t-2 border-white/5 py-12 mt-20 relative overflow-hidden">
            {/* Background Grid Polish */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-4 space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-neon-green flex items-center justify-center skew-x-[-12deg]">
                                <span className="text-midnight-950 font-black text-xl skew-x-[12deg]">O</span>
                            </div>
                            <span className="text-xl font-display font-black tracking-tighter uppercase">Oddslab</span>
                        </Link>
                        <p className="text-xs text-white/40 leading-relaxed font-medium uppercase tracking-wider">
                            {t('footer.desc')}
                        </p>
                    </div>

                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] mb-4">{t('footer.ops.title')}</h4>
                            <ul className="space-y-3">
                                <li><Link to="/explore" className="text-xs text-white/50 hover:text-neon-cyan transition-colors uppercase font-bold">{t('footer.ops.terminal')}</Link></li>
                                <li><Link to="/dashboard" className="text-xs text-white/50 hover:text-neon-cyan transition-colors uppercase font-bold">{t('footer.ops.intel')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-neon-purple uppercase tracking-[0.2em] mb-4">{t('footer.protocol.title')}</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-xs text-white/50 hover:text-neon-purple transition-colors uppercase font-bold">{t('footer.protocol.api')}</a></li>
                                <li><a href="#" className="text-xs text-white/50 hover:text-neon-purple transition-colors uppercase font-bold">{t('footer.protocol.whitepaper')}</a></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] mb-4">{t('footer.status.title')}</h4>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-neon-green" />
                                <span className="text-[10px] font-bold text-neon-green uppercase tracking-widest">{t('footer.status.live')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                        © 2026 ODDSLAB PROTOCOL v2.0.4.5A
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-white/20 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
                        <a href="#" className="text-white/20 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.805.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
