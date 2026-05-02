import { useTranslation } from 'react-i18next';
import { setDefaultLocale } from 'react-datepicker';
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setDefaultLocale(lng);
  };

  return (
    <div className="flex bg-dark-bg/50 p-1 rounded-xl border border-white/5 w-full">
      <button
        onClick={() => changeLanguage('id')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          i18n.language === 'id'
            ? 'bg-white/10 text-white shadow-md'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
      >
        IDN
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          i18n.language === 'en'
            ? 'bg-white/10 text-white shadow-md'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
      >
        ENG
      </button>
    </div>
  );
};

export default LanguageSwitcher;
