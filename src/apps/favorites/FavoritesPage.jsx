import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../axios';
import { Post } from '../post/post';
import { Box, CircularProgress, Typography } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const FavoritesPage = () => {
  const userData = useSelector(state => state.auth.data);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    if (userData) {
      fetchFavorites();
    }
  }, [userData]);

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
    }
  };

  if (!userData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 'calc(100vh - 200px)',
        color: '#c9d1d9'
      }}>
        <Typography variant="h6" gutterBottom>
          Для просмотра избранного необходимо авторизоваться
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: 'calc(100vh - 200px)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: '20px',
      backgroundColor: '#0d1117',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#f0f6fc', 
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <BookmarkIcon fontSize="large" />
        Мои сохраненные посты
      </Typography>

      {favoritePosts.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {favoritePosts.map(post => (
            <Box 
              key={post._id} 
              sx={{
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <Post 
                {...post}
                isFavorite={true}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100vh - 300px)',
          color: '#8b949e'
        }}>
          <BookmarkIcon sx={{ fontSize: '60px', marginBottom: '20px' }} />
          <Typography variant="h6" align="center">
            У вас пока нет сохраненных постов<br />
            Нажмите на значок закладки, чтобы сохранить понравившиеся посты
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FavoritesPage;
