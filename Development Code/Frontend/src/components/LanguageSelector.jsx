import React, { useEffect, useState, useRef } from "react";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
];

const LanguageSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('English');
    const dropdownRef = useRef(null);

    useEffect(() => {
        // 1. Initial Google Translate Script Injection
        const addScript = document.createElement("script");
        addScript.setAttribute(
            "src",
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        );
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "ne,hi,fr,de,zh-CN,ja,ko,es,ar,en",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        // 2. Click Outside Handler
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLanguage = (langCode, langName) => {
        const selectEl = document.querySelector(".goog-te-combo");
        if (selectEl) {
            selectEl.value = langCode;
            selectEl.dispatchEvent(new Event("change"));
            setCurrentLang(langName);
            setIsOpen(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            {/* Hidden Google Original Element */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            <div 
                onClick={() => setIsOpen(!isOpen)} 
                style={{ 
                    cursor: 'pointer', 
                    padding: '4px 10px', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: '0.3s',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                className="lang-trigger"
            >
                <i className="fas fa-globe" style={{ fontSize: '0.8rem' }}></i>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentLang}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem' }}></i>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '35px',
                    right: '0',
                    width: '180px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    zIndex: 100000,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    animation: 'fadeInUp 0.2s ease-out'
                }}>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {languages.map(lang => (
                            <div 
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code, lang.name)}
                                style={{
                                    padding: '10px 15px',
                                    fontSize: '0.9rem',
                                    color: '#333',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    transition: '0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f5f7fa'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
