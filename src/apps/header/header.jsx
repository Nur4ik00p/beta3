import React from 'react';
import '../../style/header/style.css'; // Предполагаю, что у вас есть такой файл
import { Link } from 'react-router-dom';
const Header = () => {
  return (
    <header className="panel-center">
      <div className="panel">
        <Link to="/" className="panel-text">AtomGlide</Link>  
      </div>
    </header>
  );
};

export default Header;