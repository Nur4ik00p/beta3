import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from '../axios';
import { logout } from '../redux/slices/auth';
import { Post } from '../apps/post/post';
import { 
  Avatar, Button, Typography, Grid, CircularProgress,
  Badge, IconButton, Tooltip
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Store as StoreIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Telegram as TelegramIcon,
  Public as PublicIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { NotificationContext } from '../apps/tools/ui-menu/pushbar/pushbar';
import '../style/profile/profile.scss';

const Profile = () => {
  const { toggleNotifications } = useContext(NotificationContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.data);
  
  const [state, setState] = useState({
    user: null,
    posts: [],
    isSubscribed: false,
    followersCount: 0,
    subscriptionsCount: 0,
    isLoading: true,
    error: null
  });

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/default-avatar.jpg';
    const cleanPath = avatarPath.replace(/^\/uploads\//, '');
    const baseUrl = 'https://node.soon-night.lol';
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const getCoverUrl = (coverPath) => {
    if (!coverPath) return null;
    const cleanPath = coverPath.replace(/^\/uploads\//, '');
    const baseUrl = 'https://node.soon-night.lol';
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const getThemeColor = () => {
    if (!state.user?.theme) return '#080a0c';
    switch(state.user.theme) {
      case 'light': return '#f5f5f5';
      case 'dark': return '#121212';
      case 'blue': return '#1e88e5';
      case 'green': return '#43a047';
      case 'purple': return '#8e24aa';
      default: return '#080a0c';
    }
  };

  useEffect(() => {
    if (!id || !currentUser) return;
    
    const savedSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    if (savedSubscriptions[id] !== undefined) {
      setState(prev => ({
        ...prev,
        isSubscribed: savedSubscriptions[id]
      }));
    }
  }, [id, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [profileRes, postsRes] = await Promise.all([
          axios.get(`/users/${id}`),
          axios.get(`/posts/user/${id}`)
        ]);

        const savedSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
        const initialIsSubscribed = savedSubscriptions[id] || profileRes.data.isSubscribed || false;

        setState({
          user: profileRes.data.user,
          posts: postsRes.data || [],
          isSubscribed: initialIsSubscribed,
          followersCount: profileRes.data.followersCount,
          subscriptionsCount: profileRes.data.subscriptionsCount,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setState({
          user: null,
          posts: [],
          isSubscribed: false,
          followersCount: 0,
          subscriptionsCount: 0,
          isLoading: false,
          error: err.response?.data?.message || 'Ошибка загрузки профиля'
        });
      }
    };

    fetchData();
  }, [id]);

  const handleSubscribe = async () => {
    try {
      const newIsSubscribed = !state.isSubscribed;
      
      setState(prev => ({
        ...prev,
        isSubscribed: newIsSubscribed,
        followersCount: newIsSubscribed 
          ? prev.followersCount + 1 
          : Math.max(0, prev.followersCount - 1)
      }));

      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
      subscriptions[id] = newIsSubscribed;
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

      await (newIsSubscribed 
        ? axios.post(`/users/subscribe/${id}`, {}, {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
          })
        : axios.delete(`/users/unsubscribe/${id}`, {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
          }));

    } catch (err) {
      console.error('Ошибка подписки:', err);
      setState(prev => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        followersCount: prev.isSubscribed 
          ? prev.followersCount - 1 
          : prev.followersCount + 1
      }));
      
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
      delete subscriptions[id];
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      dispatch(logout());
      window.localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const renderSocialIcon = (platform, url) => {
    if (!url) return null;
    
    const icons = {
      twitter: <TwitterIcon />,
      instagram: <InstagramIcon />,
      facebook: <FacebookIcon />,
      telegram: <TelegramIcon />,
      vk: <PublicIcon />,
      website: <PublicIcon />,
      github: <GitHubIcon />,
      linkedin: <LinkedInIcon />
    };

    const platformKey = platform.toLowerCase();
    const icon = icons[platformKey] || <PublicIcon />;

    return (
      <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
        <IconButton 
          href={url.startsWith('http') ? url : `https://${url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-icon"
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  if (state.isLoading) {
    return (
      <div className="profile-loading">
        <CircularProgress />
      </div>
    );
  }

  if (state.error || !state.user) {
    return (
      <div className="profile-error">
        <Typography variant="h6">{state.error || 'Пользователь не найден'}</Typography>
      </div>
    );
  }

  const isCurrentUser = currentUser?._id === state.user._id;
  const hasPosts = state.posts.length > 0;
  const accountType = state.user.accountType || 'user';
  const showVerifiedBadge = accountType === 'verified_user';
  const showVerifiedBadg = accountType === 'admin';

  const showShopBadge = accountType === 'shop';
  const coverUrl = getCoverUrl(state.user.coverUrl);
  const themeColor = getThemeColor();
  const socialMedia = state.user.socialMedia || {};
  const hasSocialMedia = Object.values(socialMedia).some(val => val);

  return (
    <div className="profile-container" style={{ backgroundColor: themeColor }}>
      <div className="profile-banner">
        {coverUrl ? (
          <img src={coverUrl} className="banner-image" alt="Profile banner" />
        ) : (
          <div className="default-banner" style={{ backgroundColor: themeColor }} />
        )}
      </div>

      <div className="profile-info-section">
        <div className="profile-avatar-container">
          <Avatar 
            alt={state.user.fullName} 
            src={getAvatarUrl(state.user.avatarUrl)} 
            sx={{ 
              width: 150, 
              height: 150,
              border: '5px solid white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }} 
            className="profile-avatar" 
          />
        </div>

        <div className="profile-text-info">
          <div className='profile-name-container'>
            <h1 className='profile-name'>{state.user.fullName}</h1>
            {showVerifiedBadge && (
              <VerifiedIcon className='verified-badge' color="primary" />
            )}
            {showVerifiedBadg && (
              <VerifiedIcon className='verified-badge' color="primary" />
            )}
            {showShopBadge && (
              <StoreIcon className='shop-badge' color="primary" />
            )}
          </div>
          <p className="profile-email">{state.user.email}</p>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{state.followersCount}</span>
              <span className="stat-label">Подписчиков</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{state.subscriptionsCount}</span>
              <span className="stat-label">Подписок</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{state.posts.length}</span>
              <span className="stat-label">Постов</span>
            </div>
          </div>

          {hasSocialMedia && (
  <div className="profile-social-links">
    {Object.entries(socialMedia).map(([platform, url]) => (
      url && renderSocialIcon(platform, url)
    ))}
  </div>
)}

          
        </div>
      </div>
      <div className="profile-actions">
            {isCurrentUser ? (
              <>
                <Tooltip title="Редактировать профиль">
  <Button
    variant="outlined"
    startIcon={<EditIcon />}
    onClick={() => navigate(`/edit-profile/${state.user._id}`)}
    className="action-btn"
  >
    Редактировать
  </Button>
</Tooltip>
                
                <Tooltip title="Уведомления">
                  <Button
                    variant="outlined"
                    startIcon={
                      <Badge badgeContent={4} color="error">
                        <NotificationsIcon />
                      </Badge>
                    }
                    onClick={toggleNotifications}
                    className="action-btn"
                  >
                    Уведомления
                  </Button>
                </Tooltip>
                
                <Tooltip title="Выйти из аккаунта">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    className="action-btn"
                  >
                    Выйти
                  </Button>
                </Tooltip>
              </>
            ) : (
              <Button
                variant={state.isSubscribed ? "outlined" : "contained"}
                startIcon={
                  state.isSubscribed ? <PersonRemoveIcon /> : <PersonAddIcon />
                }
                onClick={handleSubscribe}
                className="subscribe-btn"
              >
                {state.isSubscribed ? 'Отписаться' : 'Подписаться'}
              </Button>
            )}
          </div>
      {state.user.about && (
        <div className="profile-about">
          <h3>О себе</h3>
          <p>{state.user.about}</p>
        </div>
      )}
      

      <div className="posts-section">
        <h2 className="posts-title">{isCurrentUser ? 'Мои публикации' : 'Публикации'}</h2>
        
        {hasPosts ? (
          <Grid container spacing={3}>
            {state.posts.map(post => (
              <Grid item xs={12} md={6} lg={4} key={post._id}>
                <Post
  _id={post._id}  // Используем _id вместо id
  title={post.title}
  text={post.text}
  imageUrl={post.imageUrl}
  tags={post.tags}
  viewsCount={post.viewsCount}
  user={state.user}
  createdAt={post.createdAt}
  isEditable={isCurrentUser}
  // Добавляем ключевые пропсы, которые ожидает компонент Post
  likesCount={post.likes?.count || 0}
  dislikesCount={post.dislikes?.count || 0}
  userReaction={post.userReaction}
/>
              </Grid>
            ))}
          </Grid>
        ) : (
          <div className="no-posts">
            <Typography variant="h5" color="textSecondary">
              Нет статей для отображения
            </Typography>
            {isCurrentUser && (
              <Typography variant="body1">
                Создайте свою первую публикацию!
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
