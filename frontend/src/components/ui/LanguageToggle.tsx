import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'zh' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="relative flex items-center justify-center w-10 h-10 bg-card border border-border hover:border-neon-cyan/50 hover:bg-muted transition-all group overflow-hidden skew-x-[-6deg]"
            title={i18n.language === 'en' ? 'Switch to Chinese' : '切换为英文'}
        >
            <div className="skew-x-[6deg] flex flex-col items-center justify-center w-8 h-8">
                <span className="text-[10px] font-black uppercase tracking-tighter text-foreground/50 group-hover:text-neon-cyan transition-colors">
                    {i18n.language.startsWith('zh') ? 'ZH' : 'EN'}
                </span>
                {/* Accent line */}
                <div className="absolute bottom-1 w-4 h-[1px] bg-neon-cyan/30 group-hover:w-6 transition-all" />
            </div>

            {/* Interactive Shine */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-foreground/5 to-transparent skew-x-[25deg]" />
        </button>
    );
}
