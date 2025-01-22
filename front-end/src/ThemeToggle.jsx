import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Get the saved theme from localStorage or default to true
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? false : true;
  });

  // toggle theme by adding and removing theme class in HTML attribute
  useEffect(() => {
    const htmlElement = document.querySelector('html');
    if (isDarkTheme) {
      htmlElement.classList.add('theme-dark');
      htmlElement.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark'); // Save the theme in localStorage
    } else {
      htmlElement.classList.add('theme-light');
      htmlElement.classList.remove('theme-dark');
      localStorage.setItem('theme', 'light'); // Save the theme in localStorage
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