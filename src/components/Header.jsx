import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="app-header">
            <Link to="/" className="header-link">
                <h1>Aerolínea</h1>
            </Link>
        </header>
    );
}

export default Header;