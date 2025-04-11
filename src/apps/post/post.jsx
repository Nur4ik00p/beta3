import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../axios';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import EyeIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteFilledIcon from '@mui/icons-material/Favorite';
import ThumbDownIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownFilledIcon from '@mui/icons-material/ThumbDown';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import styles from '../../style/post/post.scss';
import { UserInfo } from '../../account/UserInfo';

export const Post = ({
  _id,
  title = '',
  createdAt = '',
  imageUrl = '',
  user = {},
  viewsCount = 0,
  commentsCount = 0,
  tags = [],
  children,
  isFullPost = false,
  isLoading = false,
  isEditable = false,
  likesCount = 0,
  dislikesCount = 0,
  userReaction = null,
  isFavorite = false
}) => {
  const userData = useSelector(state => state.auth.data);
  const navigate = useNavigate();
  
  const currentUserId = userData?._id || userData?.user?._id || userData?.user;
  const postAuthorId = user?._id || user;
  const isAuthor = currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId);

  const [reactionData, setReactionData] = React.useState({
    likesCount,
    dislikesCount,
    userReaction
  });
  const [favorite, setFavorite] = React.useState(isFavorite);
  const [isReacting, setIsReacting] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setReactionData({
      likesCount,
      dislikesCount,
      userReaction
    });
    setFavorite(isFavorite);
    setImageLoaded(false);
    setImageError(false);
  }, [likesCount, dislikesCount, userReaction, imageUrl, isFavorite]);

  const onClickRemove = async (e) => {
    e.stopPropagation();
    if (window.confirm('Вы действительно хотите удалить этот пост?')) {
      try {
        await axios.delete(`/posts/${_id}`);
        alert("Пост успешно удален");
        window.location.reload();
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Не удалось удалить пост');
      }
    }
  };

  const fetchReactionData = async () => {
    try {
      const { data } = await axios.get(`/posts/${_id}`);
      setReactionData({
        likesCount: data.likesCount || 0,
        dislikesCount: data.dislikesCount || 0,
        userReaction: data.userReaction || null
      });
    } catch (err) {
      console.error('Error fetching reaction data:', err);
    }
  };

  const handleReaction = async (type, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      alert('Для этого действия нужно авторизоваться');
      return;
    }

    if (isReacting) return;
    setIsReacting(true);

    try {
      const currentReaction = reactionData.userReaction;
      const currentLikes = reactionData.likesCount;
      const currentDislikes = reactionData.dislikesCount;

      let newReaction = currentReaction;
      let newLikes = currentLikes;
      let newDislikes = currentDislikes;

      if (currentReaction === type) {
        await axios.delete(`/posts/reaction/${_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        newReaction = null;
        if (type === 'like') newLikes--;
        else newDislikes--;
      } else {
        if (currentReaction) {
          await axios.delete(`/posts/reaction/${_id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (currentReaction === 'like') newLikes--;
          else newDislikes--;
        }

        await axios.post(`/posts/${type}/${_id}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        newReaction = type;
        if (type === 'like') newLikes++;
        else newDislikes++;
      }

      setReactionData({
        likesCount: newLikes,
        dislikesCount: newDislikes,
        userReaction: newReaction
      });

      await fetchReactionData();
    } catch (err) {
      console.error('Error updating reaction:', err);
      alert('Не удалось обновить реакцию. Пожалуйста, попробуйте снова.');
      await fetchReactionData();
    } finally {
      setIsReacting(false);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUserId) {
      alert('Для этого действия нужно авторизоваться');
      return;
    }

    try {
      if (favorite) {
        await axios.delete(`/users/favorites/${_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post('/users/favorites', { postId: _id }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setFavorite(!favorite);
    } catch (err) {
      console.error('Error updating favorites:', err);
      alert('Не удалось обновить избранное');
    }
  };

  const handlePostClick = () => {
    navigate(`/posts/${_id}`);
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (user && user._id) {
      navigate(`/account/profile/${user._id}`);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('https') ? url : `https://atomglidedev.ru${url}`;
  };

  const fullImageUrl = getFullImageUrl(imageUrl);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const renderTags = () => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return null;
    }

    return (
      <ul className='tags-GHJ'>
        {tags.map((name, index) => (
          <li key={index}>
            <Link 
              className='title-tags-GHJ' 
              to={`/tag/${name}`} 
              onClick={(e) => e.stopPropagation()}
            >
              #{name}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className='post-ad'>
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className='post-ad' onClick={handlePostClick} style={{ cursor: 'pointer' }}>
      <div className='post-GHJ'>
        <div onClick={handleUserClick} style={{ cursor: 'pointer' }}>
          <UserInfo 
            {...user} 
            additionalText={createdAt}
            avatarUrl={user?.avatarUrl ? getFullImageUrl(user.avatarUrl) : ''}
          />
        </div>
        
        {fullImageUrl && !imageError && (
          <div className="J_HJKe">
            {!imageLoaded && (
              <div className="image-loading-placeholder">
                Загрузка изображения...
              </div>
            )}
            <div 
              className="blurred-background"
              style={{ 
                backgroundImage: `url(${fullImageUrl})`,
                display: imageLoaded ? 'block' : 'none'
              }}
            />
            <img
              className='img-IKLS'
              src={fullImageUrl}
              alt={title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />         
          </div>
        )}

        {imageError && (
          <div className="image-error-placeholder">
            Не удалось загрузить изображение
          </div>
        )}

        <div>
          <div>
            <h2 className='title-GHJ'>{title}</h2>
            {renderTags()}
          </div>
          
          <div className="post-actions">
            <div className="post-action">
              <EyeIcon fontSize="small" />
              <span>{viewsCount}</span>
            </div>
            
            <div 
              className={`post-action ${reactionData.userReaction === 'like' ? 'active' : ''}`}
              onClick={(e) => handleReaction('like', e)}
              style={{ opacity: isReacting ? 0.5 : 1 }}
            >
              {reactionData.userReaction === 'like' ? (
                <FavoriteFilledIcon fontSize="small" color="error" />
              ) : (
                <FavoriteIcon fontSize="small" />
              )}
              <span>{reactionData.likesCount}</span>
            </div>

            <div 
              className={`post-action ${reactionData.userReaction === 'dislike' ? 'active' : ''}`}
              onClick={(e) => handleReaction('dislike', e)}
              style={{ opacity: isReacting ? 0.5 : 1 }}
            >
              {reactionData.userReaction === 'dislike' ? (
                <ThumbDownFilledIcon fontSize="small" color="primary" />
              ) : (
                <ThumbDownIcon fontSize="small" />
              )}
              <span>{reactionData.dislikesCount}</span>
            </div>

            <div 
              className={`post-action ${favorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              {favorite ? (
                <BookmarkIcon fontSize="small" color="primary" />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
            </div>
          </div>

          {isEditable && isAuthor && (
            <div className={styles.editButtons} onClick={(e) => e.stopPropagation()}>
              <Link to={`/posts/${_id}/edit`}>
                <IconButton color="primary">
                  <EditIcon />
                </IconButton>
              </Link>
              <IconButton onClick={onClickRemove} color="secondary">
                <DeleteIcon />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};