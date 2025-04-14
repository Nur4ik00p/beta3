import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Post } from "../post/post";
import axios from "../../axios";
import styles from '../../style/post-fullview/FULLPOST.scss';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { themes } from 'prism-react-renderer'; // Add this import
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export const FullPost = () => {
  const [post, setPost] = React.useState(null);
  const [isLoading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector(state => state.auth.data);

  const processImageUrl = (url) => {
    if (!url) return null;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const baseUrl = 'https://atomglidedev.ru';
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const handleDownload = () => {
    if (!post) return;
    
    const element = document.createElement("a");
    const file = new Blob([post.text], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${post.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (!post) return;
    
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.text.substring(0, 100) + '...',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      });
    }
  };

  React.useEffect(() => {
    document.body.classList.add(styles.bodyScroll);
    return () => {
      document.body.classList.remove(styles.bodyScroll);
    };
  }, []);

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const postResponse = await axios.get(`/posts/${id}`);
        if (!postResponse.data) {
          throw new Error('Пост не найден');
        }
        
        const processedPost = {
          ...postResponse.data,
          imageUrl: processImageUrl(postResponse.data.imageUrl),
          user: {
            ...postResponse.data.user,
            avatarUrl: processImageUrl(postResponse.data.user?.avatarUrl)
          }
        };
        
        setPost(processedPost);
      } catch (err) {
        console.error("Ошибка загрузки поста:", err);
        setError(err.response?.data?.message || err.message || "Не удалось загрузить пост");
        
        if (err.response?.status === 404) {
          setPost(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>Ошибка загрузки поста</h3>
        <p style={{ marginBottom: '30px', maxWidth: '500px' }}>{error}</p>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            textTransform: 'none',
            fontSize: '16px'
          }}
        >
          Вернуться на главную
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Пост не найден</h3>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            textTransform: 'none',
            fontSize: '16px'
          }}
        >
          Вернуться на главную
        </Button>
      </div>
    );
  }

  return (
    <div className='full-post-container'>
      <Post
        _id={post._id}
        imageUrl={post.imageUrl}
        title={post.title}
        text={post.text}
        tags={post.tags}
        viewsCount={post.viewsCount}
        user={post.user}
        createdAt={post.createdAt}
        isEditable={userData?._id === post.user._id}
        likesCount={post.likes?.count || 0}
        dislikesCount={post.dislikes?.count || 0}
        userReaction={post.userReaction}
        isFullPost={true}
        isFavorite={post.isFavorite || false}
      />
      
      <div className='post-text-content' style={{
        margin: '20px',
        padding: '20px',
        backgroundColor: '#0D1116',
        borderRadius: '8px',
        border: '1px solid #31373F',
        color: '#e1e1e1',
        lineHeight: '1.6',
        fontFamily: "'SF Pro Text', Arial, sans-serif"
      }}>
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  style={themes.vscDarkPlus} // Use the imported theme
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({node, ...props}) => <h1 style={{ 
              color: '#fff', 
              fontSize: '2em',
              margin: '24px 0 16px 0',
              fontWeight: '600'
            }} {...props} />,
            h2: ({node, ...props}) => <h2 style={{ 
              color: '#fff', 
              fontSize: '1.5em',
              margin: '20px 0 14px 0',
              fontWeight: '500'
            }} {...props} />,
            h3: ({node, ...props}) => <h3 style={{ 
              color: '#fff', 
              fontSize: '1.25em',
              margin: '16px 0 12px 0',
              fontWeight: '500'
            }} {...props} />,
            p: ({node, ...props}) => <p style={{ 
              color: '#e1e1e1', 
              margin: '16px 0', 
              lineHeight: '1.6',
              fontSize: '20px'
            }} {...props} />,
            a: ({node, ...props}) => <a style={{ 
              color: '#18a3f9',
              textDecoration: 'underline'
            }} target="_blank" rel="noopener noreferrer" {...props} />,
            img: ({node, ...props}) => (
              <img 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '4px', 
                  margin: '16px 0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }} 
                {...props} 
                src={processImageUrl(props.src)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Image+not+found';
                }}
                loading="lazy"
                alt="Изображение поста"
              />
            ),
            blockquote: ({node, ...props}) => (
              <blockquote style={{
                borderLeft: '4px solid #18a3f9',
                paddingLeft: '16px',
                margin: '16px 0',
                color: '#aaa',
                fontStyle: 'italic'
              }} {...props} />
            ),
            ul: ({node, ...props}) => <ul style={{ 
              color: '#e1e1e1', 
              paddingLeft: '24px',
              margin: '16px 0'
            }} {...props} />,
            ol: ({node, ...props}) => <ol style={{ 
              color: '#e1e1e1', 
              paddingLeft: '24px',
              margin: '16px 0'
            }} {...props} />,
            li: ({node, ...props}) => <li style={{ 
              marginBottom: '8px',
              fontSize: '16px'
            }} {...props} />,
            table: ({node, ...props}) => (
              <div style={{ overflowX: 'auto', margin: '16px 0' }}>
                <table style={{ 
                  borderCollapse: 'collapse',
                  width: '100%',
                  border: '1px solid #31373F'
                }} {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th style={{
              border: '1px solid #31373F',
              padding: '8px',
              backgroundColor: '#151B23',
              textAlign: 'left'
            }} {...props} />,
            td: ({node, ...props}) => <td style={{
              border: '1px solid #31373F',
              padding: '8px'
            }} {...props} />,
          }}
        >
          {post.text}
        </ReactMarkdown>
        
        <div className='post-actions' style={{ 
          marginTop: '30px',
          display: 'flex',
          gap: '10px'
        }}>
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            onClick={handleDownload}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              textTransform: 'none',
              padding: '8px 16px'
            }}
          >
            Скачать текст
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShareIcon />}
            onClick={handleShare}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              textTransform: 'none',
              padding: '8px 16px'
            }}
          >
            Поделиться
          </Button>
        </div>
      </div>
    </div>
  );
};
