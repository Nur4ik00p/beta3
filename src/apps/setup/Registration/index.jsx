import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from '../../../axios';
import image from './giga.png';
import './reg.scss';
import { fetchAuth } from '../../../redux/slices/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

const RegistrationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    about: '',
    theme: 'dark',
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: '',
      telegram: '',
      vk: '',
      website: '',
      github: ''
    }
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Валидация в реальном времени
    if (name === 'fullName' && value.trim().length === 0) {
      setErrors({...errors, fullName: 'Введите имя'});
    } else if (name === 'email') {
      validateEmail(value);
    } else if (name === 'password') {
      validatePassword(value);
      if (formData.confirmPassword) {
        validatePasswords(value, formData.confirmPassword);
      }
    } else if (name === 'confirmPassword') {
      validatePasswords(formData.password, value);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setErrors({...errors, email: 'Введите корректный email'});
    } else {
      setErrors({...errors, email: ''});
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setErrors({...errors, password: 'Пароль должен содержать минимум 6 символов'});
    } else {
      setErrors({...errors, password: ''});
    }
  };

  const validatePasswords = (password, confirmPassword) => {
    let error = '';
    if (password !== confirmPassword) {
      error = 'Пароли не совпадают';
    } else if (password.length < 6) {
      error = 'Пароль должен содержать минимум 6 символов';
    }
    setErrors({...errors, confirmPassword: error});
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Финальная валидация
    if (formData.fullName.trim().length === 0) {
      return setErrors({...errors, fullName: 'Введите имя'});
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setErrors({...errors, email: 'Введите корректный email'});
    }
    
    if (formData.password.length < 6) {
      return setErrors({...errors, password: 'Пароль должен содержать минимум 6 символов'});
    }
    
    if (formData.password !== formData.confirmPassword) {
      return setErrors({...errors, confirmPassword: 'Пароли не совпадают'});
    }

    setIsSubmitting(true);
    setErrors({...errors, general: ''});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('about', formData.about);
      formDataToSend.append('theme', formData.theme);
      formDataToSend.append('socialMedia', JSON.stringify(formData.socialMedia));

      // Добавляем файлы только если они есть
      if (avatarInputRef.current.files[0]) {
        formDataToSend.append('avatar', avatarInputRef.current.files[0]);
      }
      if (coverInputRef.current.files[0]) {
        formDataToSend.append('cover', coverInputRef.current.files[0]);
      }

      // 1. Регистрация
      await axios.post('/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 2. Автоматический вход
      const authResult = await dispatch(fetchAuth({
        email: formData.email,
        password: formData.password
      }));

      if (authResult.payload?.token) {
        navigate('/');
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Ошибка при регистрации';
      if (error.response?.data?.message?.includes('email')) {
        errorMessage = 'Email уже занят';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setErrors({...errors, general: errorMessage});
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSocialIcon = (platform) => {
    switch (platform) {
      case 'twitter': return <TwitterIcon />;
      case 'instagram': return <InstagramIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'telegram': return <TelegramIcon />;
      case 'vk': return <LanguageIcon />;
      case 'website': return <LanguageIcon />;
      case 'github': return <GitHubIcon />;
      default: return <LanguageIcon />;
    }
  };

  return (
    <div className='honky-all'>
      <div className="honky-1">
        <img src={image} alt='' className='honky-photo' />
      </div>
      <div className="honky-2">
        <div className="cs">
          <h1 className="title-h">Регистрация</h1>
          <h4 className='subtitle-h'>Есть аккаунт?</h4>
          <Link to="/login" className='subtitle-ho'>нажми чтобы войти</Link>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="tabs">
            <button 
              type="button" 
              className={`tab ${activeTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveTab('main')}
            >
              Основное
            </button>
 
          </div>

          {activeTab === 'main' && (
            <>
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Полное имя</h4>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder='Введите ваше имя' 
                  className='input-h' 
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Email</h4>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder='Введите ваш email' 
                  className='input-h' 
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Пароль</h4>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder='Введите пароль (мин. 6 символов)' 
                    className='input-h' 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Подтвердите пароль</h4>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder='Повторите пароль' 
                    className='input-h' 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Аватар</h4>
                <div className="avatar-section">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">Нет аватара</div>
                  )}
                  <input 
                    type="file" 
                    ref={avatarInputRef}
                    onChange={handleAvatarChange} 
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button"
                    onClick={() => triggerFileInput(avatarInputRef)} 
                    className="avatar-upload-btn"
                  >
                    {avatarPreview ? 'Изменить аватар' : 'Загрузить аватар'}
                  </button>
                </div>
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Обложка профиля</h4>
                <div className="cover-section">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="cover-preview" />
                  ) : (
                    <div className="cover-placeholder">Нет обложки</div>
                  )}
                  <input 
                    type="file" 
                    ref={coverInputRef}
                    onChange={handleCoverChange} 
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button"
                    onClick={() => triggerFileInput(coverInputRef)} 
                    className="cover-upload-btn"
                  >
                    {coverPreview ? 'Изменить обложку' : 'Загрузить обложку'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'social' && (
            <>
              <div className='h-cat'>
                <h4 className='subtitle-hi'>О себе</h4>
                <textarea 
                  name="about" 
                  value={formData.about} 
                  onChange={handleChange} 
                  placeholder='Расскажите о себе...' 
                  className='input-h textarea-h'
                  rows="3"
                />
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Тема профиля</h4>
                <div className="theme-options">
                  {['light', 'dark', 'blue', 'green', 'purple'].map(theme => (
                    <label key={theme} className="theme-option">
                      <input 
                        type="radio" 
                        name="theme" 
                        value={theme} 
                        checked={formData.theme === theme}
                        onChange={handleChange}
                      />
                      <span className={`theme-badge theme-${theme}`}></span>
                      {theme === 'light' && 'Светлая'}
                      {theme === 'dark' && 'Темная'}
                      {theme === 'blue' && 'Синяя'}
                      {theme === 'green' && 'Зеленая'}
                      {theme === 'purple' && 'Фиолетовая'}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className='h-cat'>
                <h4 className='subtitle-hi'>Социальные сети</h4>
                <div className="social-inputs">
                  {Object.entries(formData.socialMedia).map(([platform, value]) => (
                    <div key={platform} className="social-input-container">
                      <div className="social-icon">
                        {renderSocialIcon(platform)}
                      </div>
                      <input
                        type="text"
                        name={`socialMedia.${platform}`}
                        value={value}
                        onChange={handleChange}
                        placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                        className='input-h social-input'
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="trademarks">
            <p>© 2023 DK Studio. Все права защищены.</p>
            <p>AtomGlide и логотип AtomWiki являются товарными знаками DK Stduio 2025.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;