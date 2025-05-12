import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, fetchTags } from '../../redux/slices/posts';
import { selectIsAuth } from '../../redux/slices/auth';
import axios from '../../axios';
import ReactMarkdown from 'react-markdown';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Fullscreen from '@mui/icons-material/Fullscreen';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import Send from '@mui/icons-material/Send';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import FormatQuote from '@mui/icons-material/FormatQuote';
import FormatHeader1 from '@mui/icons-material/LooksOne';
import FormatHeader2 from '@mui/icons-material/LooksTwo';
import { Box, CircularProgress, Typography } from "@mui/material";
import { Post } from '../post/post';
import '../../style/work/work.scss';

const Work = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  useEffect(() => {
    setModalMessage('Это бета тест 2 до вторика ');
    setOpenModal(true);
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const { posts, tags } = useSelector(state => state.posts);
  const userData = useSelector(state => state.auth.data);
  
  const [activeTab, setActiveTab] = useState('home');
  const [isMounted, setIsMounted] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  const [isLoading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [postTags, setPostTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputFileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchTags());
    setIsMounted(true);
  }, [dispatch]);

  const isPostsLoading = posts.status === 'loading';
  const isTagsLoading = tags.status === 'loading';

  // Markdown formatting functions
  const insertMarkdown = (prefix, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    let newText;
    let newCursorPos;

    if (selectedText) {
      newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      newText = `${beforeText}${prefix}${placeholder}${suffix}${afterText}`;
      newCursorPos = start + prefix.length + (placeholder ? placeholder.length : 0);
    }

    setText(newText);
    
    setTimeout(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const formatBold = () => insertMarkdown('**', '**', 'жирный текст');
  const formatItalic = () => insertMarkdown('_', '_', 'курсив');
  const formatLink = () => insertMarkdown('[', '](https://)', 'текст ссылки');
  const formatImage = () => insertMarkdown('![', '](https://)', 'alt текст');
  const formatCode = () => insertMarkdown('`', '`', 'код');
  const formatCodeBlock = () => insertMarkdown('```\n', '\n```', 'код');
  const formatQuote = () => insertMarkdown('> ', '', 'цитата');
  const formatList = () => insertMarkdown('- ', '', 'элемент списка');
  const formatNumberedList = () => insertMarkdown('1. ', '', 'элемент списка');
  const formatHeader1 = () => insertMarkdown('# ', '', 'Заголовок 1');
  const formatHeader2 = () => insertMarkdown('## ', '', 'Заголовок 2');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowTextArea(false);
    setShowTagsInput(false);
    setShowImageUpload(false);
  };

  const handleFileClick = () => {
    setShowTextArea(!showTextArea);
    setShowTagsInput(false);
    setShowImageUpload(false);
  };

  const handlePhotoClick = () => {
    setShowImageUpload(!showImageUpload);
    setShowTextArea(false);
    setShowTagsInput(false);
  };

  const handleTagsClick = () => {
    setShowTagsInput(!showTagsInput);
    setShowTextArea(!showTextArea);
    setShowImageUpload(false);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Допустимые форматы: JPG, PNG, GIF, WebP');
      }

      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Файл слишком большой (макс. ${maxSize/1024/1024}MB)`);
      }

      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (!data.url) throw new Error('URL изображения не получен от сервера');
      setImageUrl(data.url);
    } catch (err) {
      console.error('Ошибка при загрузке файла:', err);
      setModalMessage(err.message || 'Ошибка при загрузке файла!');
      setOpenModal(true);
      setImageUrl('');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChangeFile = async (event) => {
    if (event.target.files && event.target.files[0]) {
      await handleFileUpload(event.target.files[0]);
    }
  };

  const onClickRemoveImage = () => {
    setImageUrl('');
  };

  const onChangeText = (e) => {
    setText(e.target.value);
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      setModalMessage('Пожалуйста, введите заголовок поста');
      setOpenModal(true);
      return;
    }
  
    try {
      setLoading(true);
  
      const postText = text.trim() || 'AtomGlide Post';
      const postTagsValue = postTags.trim() || 'нет текста';
  
      const fields = {
        title,
        imageUrl,
        tags: postTagsValue ? postTagsValue.split(',').map(tag => tag.trim()) : [],
        text: postText,
      };
  
      await axios.post('/posts', fields);
      
      setTitle('');
      setText('');
      setPostTags('');
      setImageUrl('');
      setShowTextArea(false);
      setShowTagsInput(false);
      setShowImageUpload(false);
      
      dispatch(fetchPosts());
    } catch (err) {
      console.warn(err);
      setModalMessage('Ошибка при создании поста!');
      setOpenModal(true);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const postsWithImages = posts.items.filter(post => post.imageUrl);
  const shuffledPosts = shuffleArray(postsWithImages);

  const getPostAnimationStyle = (index) => ({
    animationDelay: `${index * 0.1}s`
  });

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="work-panel">
      {userData ? (
        <div className='panel-created'>
          <div className="posts-container">
            <div className={`DS1 animate-fade-in ${isMounted ? 'delay-1' : ''} ${(showTextArea || showTagsInput || showImageUpload) ? 'expanded' : ''}`}>
              <h1 className='YHN'>Добавить пост</h1>
              <input
                type="text"
                className="post-title-input"
                placeholder="Напиши заголовок поста"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {showTagsInput && (
                <input
                  type="text"
                  className="tags-input"
                  placeholder="Сюда один тэг"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                />
              )}
              {showTextArea && (
                <div className="markdown-editor">
                  <div className="markdown-toolbar">
                    <button onClick={formatBold} title="Жирный"><FormatBold /></button>
                    <button onClick={formatItalic} title="Курсив"><FormatItalic /></button>
                    <button onClick={formatHeader1} title="Заголовок 1"><FormatHeader1 /></button>
                    <button onClick={formatHeader2} title="Заголовок 2"><FormatHeader2 /></button>
                    <button onClick={formatList} title="Маркированный список"><FormatListBulleted /></button>
                    <button onClick={formatNumberedList} title="Нумерованный список"><FormatListNumbered /></button>
                    <button onClick={formatCode} title="Код"><CodeIcon /></button>
                    <button onClick={formatCodeBlock} title="Блок кода"><CodeIcon /></button>
                    <button onClick={formatQuote} title="Цитата"><FormatQuote /></button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    className="post-textarea"
                    placeholder="Сюда текст поста (поддерживается Markdown)..."
                    value={text}
                    onChange={onChangeText}
                    rows={8}
                  />
                  <div className="markdown-preview">
                    <h4>Предпросмотр:</h4>
                    <ReactMarkdown>{text || '*Начните вводить текст...*'}</ReactMarkdown>
                  </div>
                </div>
              )}
              
              
              
              {showImageUpload && (
                <div 
                  className={`image-upload ${isDragging ? 'dragging' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !imageUrl && inputFileRef.current.click()}
                >
                  {!imageUrl ? (
                    <div className="upload-area">
                      <PhotoCamera style={{ 
                        fontSize: 50, 
                        color: isDragging ? '#4a96f3' : '#a0a0a0',
                        transition: 'color 0.3s ease'
                      }} />
                      <p className="upload-text">
                        {isDragging ? 'Отпустите для загрузки' : 'Перетащите изображение сюда или нажмите для выбора'}
                      </p>
                      {uploadProgress > 0 && (
                        <div className="upload-progress">
                          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                          <span>{uploadProgress}%</span>
                        </div>
                      )}
                      <input 
                        ref={inputFileRef} 
                        type="file" 
                        onChange={handleChangeFile} 
                        hidden 
                        accept="image/*,.png,.jpg,.jpeg,.gif,.webp" 
                      />
                    </div>
                  ) : (
                    <div className="image-preview-container">
                      <button 
                        className="remove-image-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickRemoveImage();
                        }}
                      >
                        Удалить
                      </button>
                      <img 
                        src={`http://demo.soon-night.lol${imageUrl}`} 
                        alt="Uploaded preview" 
                        className="preview-image"
                        onClick={(e) => e.stopPropagation()}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-image.png';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="tab-s">
                <div className="icon-buttons">
                  <button 
                    className={`icon-button ${showImageUpload ? 'active' : ''}`} 
                    title="Фото"
                    onClick={handlePhotoClick}
                  >
                    <PhotoCamera />
                  </button>
            
                  <button 
                    className={`icon-button ${showTagsInput ? 'active' : ''}`} 
                    title="Теги"
                    onClick={handleTagsClick}
                  >
                    <Fullscreen />
                  </button>
                </div>
                <button 
                  className="icon-button send-button" 
                  title="Отправить"
                  onClick={onSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : <Send />}
                </button>
              </div>
            </div>
            
            {/* Остальная часть кода остается без изменений */}
            <div className={`DS2 animate-fade-in ${isMounted ? 'delay-2' : ''}`}>
              <div className="tab-slider">
                <div className="tab-slider-container">
                  <button
                    className={`tab-slider-button ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleTabChange('home')}
                  >
                    Home
                  </button>
                  <button
                    className={`tab-slider-button ${activeTab === 'photo' ? 'active' : ''}`}
                    onClick={() => handleTabChange('photo')}
                  >
                    Photo
                  </button>
                  <button
                    className={`tab-slider-button ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => handleTabChange('news')}
                  >
                    News
                  </button>
                  <div 
                    className="tab-slider-indicator"
                    style={{
                      width: 'calc(33.33% - 10px)',
                      left: activeTab === 'home' ? '5px' : 
                            activeTab === 'photo' ? 'calc(33.33% + 5px)' : 
                            'calc(66.66% + 5px)'
                    }}
                  />
                </div>
              </div>
            </div>

            {isPostsLoading ? (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(34, 34, 73, 0.2)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "white",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6" sx={{ color: "white", marginBottom: "10px" }}>
                  AtomGlide
                </Typography>
              </Box>
            ) : activeTab === 'photo' ? (
              <div className="pinterest-grid">
                {shuffledPosts.length > 0 ? (
                  shuffledPosts.map((post, index) => (
                    <div 
                      key={post._id} 
                      className="pinterest-item post-animate"
                      style={getPostAnimationStyle(index)}
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      {post.imageUrl && (
                        <>
                          <img
                            src={`http://demo.soon-night.lol${post.imageUrl}`}
                            alt={post.title}
                            className="pinterest-image"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-image.png';
                            }}
                          />
                          {post.title && (
                            <div className="image-overlay">
                              <p className="image-title">{post.title}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`load-text animate-fade-in ${isMounted ? 'delay-3' : ''}`}>
                    Нет фото для отображения
                  </div>
                )}
              </div>
            ) : activeTab === 'news' ? (
              <div className="news-container">
                <h2 className="news-title">Последние новости</h2>
                <div className="news-updates">
                  <div className="update-item">
                    <span className="update-date">04.04.2025</span>
                    <p className="update-text">Запуск бета теста 2 до вторника</p>
                  </div>
                  <div className="update-item">
                    <span className="update-date">03.04.2025</span>
                    <p className="update-text">Чаты теперь раб но не раб</p>
                  </div>
                </div>

                <h2 className="news-title">Важные объявления</h2>
                {posts.items.filter(post => post.tags && post.tags.includes('alert')).length > 0 ? (
                  posts.items
                    .filter(post => post.tags && post.tags.includes('alert'))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((post, index) => (
                      <div 
                        key={post._id} 
                        className="alert-post post-animate"
                        style={getPostAnimationStyle(index)}
                      >
                        <Post
                          _id={post._id}
                          imageUrl={post.imageUrl}
                          title={post.title}
                          text={post.text}
                          tags={post.tags}
                          viewsCount={post.viewsCount}
                          user={post.user || {}}
                          createdAt={post.createdAt}
                          isEditable={userData?._id === (post.user?._id || null)}
                        />
                      </div>
                    ))
                ) : (
                  <div className="no-alerts">
                    На данный момент нет важных объявлений
                  </div>
                )}
              </div>
            ) : posts.items.length > 0 ? (
              [...posts.items]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post, index) => (
                  <div 
                    key={post._id} 
                    className="post-animate"
                    style={getPostAnimationStyle(index)}
                  >
                    <Post
                      _id={post._id}
                      imageUrl={post.imageUrl}
                      title={post.title}
                      text={post.text}
                      tags={post.tags}
                      viewsCount={post.viewsCount}
                      user={post.user || {}}
                      createdAt={post.createdAt}
                      isEditable={userData?._id === (post.user?._id || null)}
                      likesCount={post.likes?.count || 0}
                      dislikesCount={post.dislikes?.count || 0}
                      userReaction={post.userReaction}
                    />
                  </div>
                ))
            ) : (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(34, 34, 73, 0.2)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "white",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6" sx={{ color: "white", marginBottom: "10px" }}>
                  AtomGlide
                </Typography>
              </Box>
            )}
          </div>
        </div>
      ) : (
        <div className='panel-created'>
          <div className="posts-container">
            <div className={`DS2 animate-fade-in ${isMounted ? 'delay-2' : ''}`}>
              <div className="tab-slider">
                <div className="tab-slider-container">
                  <button
                    className={`tab-slider-button ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleTabChange('home')}
                  >
                    Home
                  </button>
                  <button
                    className={`tab-slider-button ${activeTab === 'photo' ? 'active' : ''}`}
                    onClick={() => handleTabChange('photo')}
                  >
                    Photo
                  </button>
                  <button
                    className={`tab-slider-button ${activeTab === 'news' ? 'active' : ''}`}
                    onClick={() => handleTabChange('news')}
                  >
                    News
                  </button>
                  <div 
                    className="tab-slider-indicator"
                    style={{
                      width: 'calc(33.33% - 10px)',
                      left: activeTab === 'home' ? '5px' : 
                            activeTab === 'photo' ? 'calc(33.33% + 5px)' : 
                            'calc(66.66% + 5px)'
                    }}
                  />
                </div>
              </div>
            </div>

            {isPostsLoading ? (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(34, 34, 73, 0.2)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "white",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6" sx={{ color: "white", marginBottom: "10px" }}>
                  AtomGlide
                </Typography>
              </Box>
            ) : activeTab === 'photo' ? (
              <div className="pinterest-grid">
                {shuffledPosts.length > 0 ? (
                  shuffledPosts.map((post, index) => (
                    <div 
                      key={post._id} 
                      className="pinterest-item post-animate"
                      style={getPostAnimationStyle(index)}
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      {post.imageUrl && (
                        <>
                          <img
                            src={`http://demo.soon-night.lol${post.imageUrl}`}
                            alt={post.title}
                            className="pinterest-image"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-image.png';
                            }}
                          />
                          {post.title && (
                            <div className="image-overlay">
                              <p className="image-title">{post.title}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`load-text animate-fade-in ${isMounted ? 'delay-3' : ''}`}>
                    Нет фото для отображения
                  </div>
                )}
              </div>
            ) : activeTab === 'news' ? (
              <div className="news-container">
                <h2 className="news-title">Последние обновления</h2>
                <div className="news-updates">
                  <div className="update-item">
                    <span className="update-date">11.04.2025</span>
                    <p className="update-text">Бета тест 3</p>
                  </div>
                </div>

                <h2 className="news-title">Важные объявления</h2>
                {posts.items.filter(post => post.tags && post.tags.includes('alert')).length > 0 ? (
                  posts.items
                    .filter(post => post.tags && post.tags.includes('alert'))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((post, index) => (
                      <div 
                        key={post._id} 
                        className="alert-post post-animate"
                        style={getPostAnimationStyle(index)}
                      >
                        <Post
                          _id={post._id}
                          imageUrl={post.imageUrl}
                          title={post.title}
                          text={post.text}
                          tags={post.tags}
                          viewsCount={post.viewsCount}
                          user={post.user || {}}
                          createdAt={post.createdAt}
                          isEditable={userData?._id === (post.user?._id || null)}
                        />
                      </div>
                    ))
                ) : (
                  <div className="no-alerts">
                    На данный момент нет важных объявлений
                  </div>
                )}
              </div>
            ) : posts.items.length > 0 ? (
              [...posts.items]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post, index) => (
                  <div 
                    key={post._id} 
                    className="post-animate"
                    style={getPostAnimationStyle(index)}
                  >
                    <Post
                      _id={post._id}
                      imageUrl={post.imageUrl}
                      title={post.title}
                      text={post.text}
                      tags={post.tags}
                      viewsCount={post.viewsCount}
                      user={post.user || {}}
                      createdAt={post.createdAt}
                      isEditable={userData?._id === (post.user?._id || null)}
                    />
                  </div>
                ))
            ) : (
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(34, 34, 73, 0.2)",
                  zIndex: 9999,
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "white",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="h6" sx={{ color: "white", marginBottom: "10px" }}>
                  AtomGlide
                </Typography>
              </Box>
            )}
          </div>
        </div>
      )}

      <div className={`panel-ch animate-fade-right ${isMounted ? 'delay-2' : ''}`}>
        <div className="ch1">
          <h1 className='K-LOP'>Ваши подписки</h1>
          
          {userData?.subscriptions?.length > 0 ? (
            <div className="following-list">
              {userData.subscriptions.map(user => (
                <div 
                  key={user._id} 
                  className="following-user"
                  onClick={() => navigate(user.profileUrl || `/users/${user._id}`)}
                >
                  <img 
                    src={user.avatarUrl ? `http://demo.soon-night.lol${user.avatarUrl}` : '/default-avatar.png'} 
                    alt={user.fullName} 
                    className="following-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="following-info">
                    <span className="following-name">
                      {user.fullName}
                    </span>
                    {user.verified === 'verified' && (
                      <span className="verified-badge">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-following-message">
              {userData ? 'Вы пока ни на кого не подписаны' : 'Загрузка...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Work;
