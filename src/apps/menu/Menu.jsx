import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, fetchTags } from '../../redux/slices/posts';
import Avatar from '@mui/material/Avatar';
import { fetchUser, selectUser } from '../../redux/slices/getme';
import image from '../../img/user-logo6.jpg';
import '../../style/menu/menu.scss';
import { selectIsAuth } from '../../redux/slices/auth';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import axios from '../../axios';
import CircularProgress from '@mui/material/CircularProgress';
import { Post } from '../post/post';
import { keyframes, styled } from '@mui/system';
import { UserInfo } from '../../account/UserInfo';

import { 
  BsHouseDoor, 
  BsPerson, 
  BsConeStriped,
  BsCollectionPlayFill,
  BsCodeSlash,
  BsCommand,
  BsChat,
  BsFillHeartFill,
} from 'react-icons/bs';

// Анимация появления модального окна
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Анимация появления постов
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Стилизованный компонент для модального окна
const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(3px)',
  animation: `${fadeIn} 0.3s ease-out forwards`,
});

// Стилизованный компонент для поста
const AnimatedPost = styled('div')(({ delay }) => ({
  animation: `${slideIn} 0.3s ease-out ${delay * 0.1}s forwards`,
  opacity: 0,
  position: 'relative',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '16px',
  backgroundColor: '#161b22',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

const Menu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const [openFavoritesModal, setOpenFavoritesModal] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchPosts());
    dispatch(fetchTags());
  }, [dispatch]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/users/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavoritePosts(data.favorites || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFavorites = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      alert('Для просмотра избранного нужно авторизоваться');
      return;
    }
    await fetchFavorites();
    setOpenFavoritesModal(true);
  };

  const handleCloseFavorites = () => {
    setOpenFavoritesModal(false);
  };

  const removeFromFavorites = async (postId) => {
    try {
      await axios.delete(`/users/favorites/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavoritePosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Не удалось удалить из избранного');
    }
  };

  if (!user) {
    return <div className='de'>Загрузка... Если долгая загрузка войди в аккаунт или прочти доку</div>;
  }
  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/login" />;
  }

  return (
    <div className='TV'>
      <main className='menu-profile'>
        <Avatar 
          alt='' 
          src={user.avatarUrl ? `https://atomglidedev.ru${user.avatarUrl}` : image} 
          sx={{ width: 60, height: 60 }} 
          className='pro-avtr-o' 
        />
        <h1 className='name-pre'>{user.fullName || 'Пользователь'}</h1>
      </main>
      <main className='menu'>
        <div className="JKL">
          <div className='menu-item'>
            <Link to="/">
              <BsHouseDoor className="menu-icon" />
              <span>Главная</span>
            </Link>  
          </div>
          <div className='menu-item'>
          <Link to="/mini-apps">
    <BsCommand className="menu-icon" />
    <span>Mini Apps</span>
  </Link>
          </div>
          <div className='menu-item'>
            <Link onClick={handleOpenFavorites}>
              <BsFillHeartFill className="menu-icon" />
              <span>Избранное</span>
            </Link>
          </div>
          <div className='menu-item'>
            <Link to='/chat'>
              <BsChat className="menu-icon" />
              <span>Live Чаты</span>
            </Link>
          </div>
          <div className='menu-item'>
            <Link to={`/account/profile/${user._id}`}>
              <BsPerson className="menu-icon" />
              <span>Профиль</span>
            </Link>
          </div>
          <div className='menu-item'>
                      <Link to={'/register'}>
                        <BsConeStriped className="menu-icon" />
                        <span>регистрация</span>
                </Link>
            </div>
        </div>
      </main>

      <StyledModal
        open={openFavoritesModal}
        onClose={handleCloseFavorites}
        aria-labelledby="favorites-modal-title"
      >
        <Box sx={{
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          bgcolor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '6px',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          color: '#c9d1d9',
          outline: 'none'
        }}>
          <h2 id="favorites-modal-title" style={{ 
            color: '#f0f6fc', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <BookmarkIcon fontSize="large" />
            Мои сохраненные посты
          </h2>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : favoritePosts.length > 0 ? (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {favoritePosts.map((post) => (
                <div 
                  key={post._id} 
                  style={{
                    position: 'relative',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '16px',
                    backgroundColor: '#161b22',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <div onClick={() => navigate(`/posts/${post._id}`)} style={{ cursor: 'pointer' }}>
                    <UserInfo 
                      {...post.user} 
                      additionalText={new Date(post.createdAt).toLocaleDateString()}
                      avatarUrl={post.user?.avatarUrl ? `https://atomglidedev.ru${post.user.avatarUrl}` : ''}
                    />
                    
                    <h3 style={{ color: '#f0f6fc', margin: '10px 0' }}>{post.title}</h3>
                    
                    {post.imageUrl && (
                      <img 
                        src={`https://atomglidedev.ru${post.imageUrl}`} 
                        alt={post.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '10px'
                        }}
                      />
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e' }}>
                      <span>{post.viewsCount} просмотров</span>
                    </div>
                  </div>
                  
                  <IconButton
                    onClick={() => removeFromFavorites(post._id)}
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      color: '#f85149',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '200px',
              color: '#8b949e',
              animation: `${fadeIn} 0.3s ease-out`
            }}>
              <BookmarkIcon sx={{ fontSize: '48px', mb: 2 }} />
              <p style={{ textAlign: 'center' }}>
                У вас пока нет сохраненных постов.<br />
                Нажмите на значок закладки в постах, чтобы сохранить понравившиеся.
              </p>
            </Box>
          )}
        </Box>
      </StyledModal>
    </div>
  );
};

export default Menu;
