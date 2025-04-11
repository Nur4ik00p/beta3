import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Post } from "../post/post";
import axios from "../../axios";
import styles from '../../style/post-fullview/FULLPOST.scss';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism } from 'prism-react-renderer';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export const FullPost = () => {
  const [post, setPost] = React.useState(null);
  const [randomPosts, setRandomPosts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector(state => state.auth.data);

  React.useEffect(() => {
    document.body.classList.add(styles.bodyScroll);
    return () => {
      document.body.classList.remove(styles.bodyScroll);
    };
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка только при первом рендере или изменении id
        if (!post || post._id !== id) {
          setLoading(true);
          setError(null);
          
          const { data: postData } = await axios.get(`/posts/${id}`);
          setPost(postData);
          
          try {
            const { data: randomPostsData } = await axios.get('/posts/random?limit=3');
            setRandomPosts(randomPostsData);
          } catch (randomPostsError) {
            console.error("Error fetching random posts:", randomPostsError);
            setRandomPosts([]);
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, post]);

  // Остальной код остается без изменений...
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([post.text], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${post.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
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

  const tagsArray = post?.tags 
    ? typeof post.tags === 'string' 
      ? post.tags.split(',').map(tag => tag.trim()) 
      : Array.isArray(post.tags) 
        ? post.tags 
        : []
    : [];

  if (isLoading && !post) {
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
      <div className="error-container">
        <h3>Error loading post</h3>
        <p>{error}</p>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          className='github-button'
        >
          Go to homepage
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="not-found-container">
        <h3>Post not found</h3>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          className='github-button'
        >
          Go to homepage
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
        tags={tagsArray}
        viewsCount={post.viewsCount}
        user={post.user}
        createdAt={post.createdAt}
        isEditable={userData?._id === post.user._id}
        likesCount={post.likes?.count || 0}
        dislikesCount={post.dislikes?.count || 0}
        userReaction={post.userReaction}
        isFullPost
      />
      
      {/* Остальной код рендеринга поста... */}
      <div className='post-text-content'>
        <div className='text-posta'>
          <ReactMarkdown 
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            className='markdown-content'
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <Prism
                    theme={Prism.themes.vscDarkPlus}
                    language={match[1]}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </Prism>
                ) : (
                  <code className="markdown-inline-code" {...props}>
                    {children}
                  </code>
                );
              },
              strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
              em: ({node, ...props}) => <em className="markdown-em" {...props} />,
              pre: ({node, ...props}) => <div className="markdown-pre-wrapper" {...props} />,
              ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
              ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
              li: ({node, ...props}) => <li className="markdown-li" {...props} />,
              h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
              h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
              h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="markdown-blockquote" {...props} />,
              a: ({node, ...props}) => <a className="markdown-a" target="_blank" rel="noopener noreferrer" {...props} />,
              table: ({node, ...props}) => <div className="markdown-table-container"><table className="markdown-table" {...props} /></div>,
              img: ({node, ...props}) => <img className="markdown-img" style={{maxWidth: '100%'}} {...props} />,
              hr: ({node, ...props}) => <hr className="markdown-hr" {...props} />,
            }}
          >
            {post.text}
          </ReactMarkdown>
        </div>
        
        <div className='post-actions'>
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            onClick={handleDownload}
            className='github-button download-btn'
          >
            Скачать текст
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShareIcon />}
            onClick={handleShare}
            className='github-button share-btn'
          >
            Поделиться
          </Button>
        </div>
      </div>
      
      {randomPosts.length > 0 && (
        <div className='recommended-posts'>
          <h3 className='recommended-title'>Рекомендуемые посты</h3>
          <div className='posts-grid'>
            {randomPosts.map(randomPost => (
              <Post
                key={randomPost._id}
                _id={randomPost._id}
                imageUrl={randomPost.imageUrl}
                title={randomPost.title}
                text={randomPost.text.substring(0, 100) + '...'}
                tags={Array.isArray(randomPost.tags) ? randomPost.tags : []}
                viewsCount={randomPost.viewsCount}
                user={randomPost.user}
                createdAt={randomPost.createdAt}
                isEditable={userData?._id === randomPost.user._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};