import { useState } from 'react';
import '../node_modules/bulma/css/bulma.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faBook } from '@fortawesome/free-solid-svg-icons'
import ThemeToggle from './ThemeToggle'

const Header = () => {
    const [navBurgerState, setNavBurgerState] = useState(false);
    const navBurgerToggle = () => {
        if (navBurgerState) setNavBurgerState(false) 
        else setNavBurgerState(true)
    }
    return (
        <header className="bd-header mb-3">
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                <a
                    className="navbar-item has-text-weight-bold has-text-white-bis has-background-link m-3 p-2 button"
                    href="/"
                >
                    James Young
                </a>

                <a
                    role="button"
                    className={navBurgerState ? "navbar-burger is-active" : "navbar-burger"}
                    aria-label="menu"
                    aria-expanded="false"
                    data-target="navbarBasicExample"
                    onClick={() => {navBurgerToggle(true)}}
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
                </div>

                <div id="navbarBasicExample" className={navBurgerState ? "navbar-menu is-active" : "navbar-menu"}>
                <div className="navbar-start"></div>
                <div className="navbar-end">
                    <a className="navbar-item" href="/">
                    <span className="icon has-text-success">
                        <FontAwesomeIcon icon={faHome} />
                    </span>
                    <span className="has-text-weight-semibold">Home</span>
                    </a>

                    <a className="navbar-item" href="/about" target="">
                        <span className="icon has-text-info">
                            <FontAwesomeIcon icon={faBook} />
                        </span>
                        <span className="has-text-weight-semibold">About</span>
                    </a>
                    <div className="navbar-item bd-nav-themes">
                    <ThemeToggle/>
                    </div>
                    {/* <div className="navbar-item">
                        <div className="buttons">
                            <a className="button is-info" href="./signup.html"><strong>Sign up</strong></a>
                            <a className="button is-light" href="./login.html">Log in </a>
                        </div>
                    </div> */}
                </div>
                </div>
            </nav>
        </header>
    )
}

export default Header;