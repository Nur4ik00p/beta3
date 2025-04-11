import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import './root/index.scss';
import image from '../../img/forms-app-icon.png';
import image2 from '../../img/code-app-icon.png';
import image3 from '../../img/mark-app-icon.png';
import image4 from '../../img/jet-app-icon.png';

const MiniApps = () => {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    // Анимация появления элементов один за другим
    const timer = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= 8) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 100); // Интервал между появлениями элементов в миллисекундах

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mini-apps-container">
      <div className='m-header'>
        <h1 className='m-title'>
          Мини-приложения
        </h1>
        <input type="text" className="m-inm" placeholder='Короче это поиск'/>
      </div>

      <div className="m-box">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index}
            className={`m-b ${index < visibleItems ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            {index === 0 && (
            
              <Link to={"/apps/atomform"}>
                <div className='C'>          
                  <img src={image} className='icon-apps'></img>
                </div>
                <h4 className='title-apps'>AtomForms</h4>
                <h5 className='subtitle-apps'>Заполняй формы или создавай их</h5>
              </Link>
              
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniApps;