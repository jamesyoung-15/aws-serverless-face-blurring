import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (isDarkTheme) {
      htmlElement.classList.add('theme-dark');
      htmlElement.classList.remove('theme-light');
    } else {
      htmlElement.classList.add('theme-light');
      htmlElement.classList.remove('theme-dark');
    }
  }, [isDarkTheme]);

  const handleToggle = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <button id="theme-toggle" onClick={handleToggle} className="button has-text-weight-semibold">
        <span className='icon has-text-link'>
            <FontAwesomeIcon
                icon={isDarkTheme ? faMoon : faSun}
                id={isDarkTheme ? 'dark-icon' : 'light-icon'}
                className={isDarkTheme ? 'has-text-link' : 'has-text-warning'}
            />
        </span>
        <span>Theme</span>
    </button>
  );
};


export default ThemeToggle;