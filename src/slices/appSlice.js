import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from '../services/auth.js';
import PostsService from "../services/posts.js";

const parseJwtPayload = (token) => {
  if (!token) return { user: '', roles: [] };
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return { user: '', roles: [] };

  const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const payload = JSON.parse(atob(normalized + padding));

  const user = typeof payload?.sub === 'string' ? payload.sub : '';
  const roles = Array.isArray(payload?.roles) ? payload.roles.filter(Boolean) : [];
  return { user, roles };
};

const readSavedAuth = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { isLoggedIn: false, user: '', roles: [] };

    const parsed = parseJwtPayload(token);
    return { isLoggedIn: true, user: parsed.user, roles: parsed.roles };
  } catch {
    return { isLoggedIn: !!localStorage.getItem('token'), user: '', roles: [] };
  }
};

const savedAuth = readSavedAuth();
export const login = createAsyncThunk(
  'app/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(username, password);
      localStorage.setItem("token", response.token); 
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const register = createAsyncThunk(
  'app/register',
  async ({ username, password, email, firstName, secondName, city }, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(username, password, email, firstName, secondName, city);
      localStorage.setItem("token", response.token); 
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const post = createAsyncThunk(
  "app/post",
  async ({title, content, category, file, goal, accountDetails}, {rejectWithValue}) => {
    try{
      const response = await PostsService.postpost(title, content, category, file, goal, accountDetails);
      return response;
    }catch(err){
      return rejectWithValue(err.response.data);
    }
  }
);
export const getposts = createAsyncThunk(
  "app/getposts",
  async (_, {rejectWithValue}) => {
    try{
      const response = await PostsService.getPosts();
      return response;
    }catch(err){
      return rejectWithValue(err.response.data);
    }
  }
);
export const getpost = createAsyncThunk(
  "app/getpost",
  async ({id}, {rejectWithValue}) => {
    try{
      const response = await PostsService.getPost(id);
      return response;
    }catch(err){
      return rejectWithValue(err.response.data);
    }
  }
);
export const appSlice = createSlice({
  name: 'app',
  initialState: {
    isLoggedIn: savedAuth.isLoggedIn,
    user: savedAuth.user,
    roles: savedAuth.roles,
    isAdmin: savedAuth.roles.includes('ROLE_ADMIN'),
    status: 'idle',
    error: null,
    modal: false
  },
  reducers: {
    setAuth: (state, action) => {
      state.isLoggedIn = true;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    openModal: (state) => { 
      state.modal = true;
    },
    closeModal: (state) => { 
      state.modal = false;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = '';
      state.roles = [];
      state.isAdmin = false;
      state.status = 'idle';
      state.error = null;
      state.modal = false;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        const parsed = parseJwtPayload(action.payload?.token);
        state.isLoggedIn = true;
        state.user = parsed.user || action.meta.arg?.username || state.user;
        state.roles = parsed.roles;
        state.isAdmin = parsed.roles.includes('ROLE_ADMIN');
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to login';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        const parsed = parseJwtPayload(action.payload?.token);
        state.isLoggedIn = true;
        state.user = parsed.user || action.meta.arg?.username || state.user;
        state.roles = parsed.roles;
        state.isAdmin = parsed.roles.includes('ROLE_ADMIN');
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to register';
      })
      .addCase(post.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(post.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(post.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getposts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getposts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getposts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getpost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getpost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getpost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
      
  }
});

export default appSlice.reducer;
export const { setAuth, setUser, openModal, closeModal, logout } = appSlice.actions;
