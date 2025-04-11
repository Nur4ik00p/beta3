import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from '../../axios';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  try {
    const { data } = await axios.get('/posts');
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
});

export const fetchTags = createAsyncThunk('posts/fetchTags', async () => {
  try {
    const { data } = await axios.get('/tags');
    
    // Extract unique tags from the response
    // This assumes that each post has a 'tags' property that is a string
    // We'll split the tags string, trim each tag, and create a unique set
    const uniqueTags = new Set();
    
    if (Array.isArray(data)) {
      data.forEach(post => {
        if (post.tags) {
          const tagsArray = post.tags.split(',').map(tag => tag.trim());
          tagsArray.forEach(tag => {
            if (tag) uniqueTags.add(tag);
          });
        }
      });
    }
    
    // Convert the Set back to an array
    return Array.from(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: {
      items: [],
      status: 'idle',
      error: null
    },
    tags: {
      items: [],
      status: 'idle',
      error: null
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    // Posts reducers
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.posts.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts.status = 'succeeded';
        state.posts.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.posts.status = 'failed';
        state.posts.error = action.error.message;
      })
      
      // Tags reducers
      .addCase(fetchTags.pending, (state) => {
        state.tags.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags.status = 'succeeded';
        state.tags.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.tags.status = 'failed';
        state.tags.error = action.error.message;
      });
  },
});

export const postsReducer = postsSlice.reducer;