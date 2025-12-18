import React, { useEffect, useMemo, useState } from 'react';
import logo from '../assets/Artboard 1@3x.png';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Autocomplete, Button, FileInput, Group, Modal, NumberInput, TextInput, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { logout, post } from '../slices/appSlice.js';
import api from '../axios.js';
export default function Header() {
    const user = useSelector(state => state.app.user);
    const isLoggedIn = useSelector(state => state.app.isLoggedIn);
    const isAdmin = useSelector(state => state.app.isAdmin);
    const [opened, { open, close }] = useDisclosure(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [budget, setBudget] = useState(0);
    const [file, setFile] = useState(null);
    const [details, setDetails] = useState('');
    const dispatch = useDispatch();

    const categoryOptions = useMemo(() => {
      const options = categories.map((c) => c.name).filter(Boolean);
      return Array.from(new Set(options)).sort((a, b) => String(a).localeCompare(String(b)));
    }, [categories]);

    useEffect(() => {
      let mounted = true;
      const fetchCategories = async () => {
        try {
          const response = await api.get('categories');
          if (!mounted) return;
          const list = Array.isArray(response.data) ? response.data : [];
          setCategories(list);
        } catch (e) {
          // Non-blocking: allow manual entry if backend is down
          console.warn('Failed to load categories', e);
        }
      };

      fetchCategories();
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const shouldOpen = params.get('new') === '1';
      if (!shouldOpen) return;

      if (!isLoggedIn) {
        navigate('/signin');
        return;
      }

      open();
    }, [isLoggedIn, location.search, navigate, open]);

    const handleFileChange = (file) => {
        setFile(file);
    };

    const handleOpenCreate = () => {
      if (!isLoggedIn) {
        navigate('/signin');
        return;
      }
      open();
    };

    const resetForm = () => {
      setTitle('');
      setContent('');
      setCategory('');
      setBudget(0);
      setDetails('');
      setFile(null);
    };

    const handleLogout = () => {
      localStorage.removeItem('token');
      dispatch(logout());
      navigate('/');
    };

    const handlePost = async () => {
        if (!title.trim()) {
          alert('Please enter a task title');
          return;
        }
        if (!category.trim()) {
          alert('Please enter a subject');
          return;
        }
        if (!details.trim()) {
          alert('Please add contact details (Telegram/Discord/email)');
          return;
        }

        const response = await dispatch(
          post({
            title: title.trim(),
            content,
            category: category.trim(),
            file,
            goal: Number(budget) || 0,
            accountDetails: details.trim(),
          })
        );

        if (response.type === 'app/post/rejected') {
          alert(response.payload?.message || 'Failed to create task');
          return;
        }

        close();
        resetForm();
    }
    return (
        <>
            <Modal opened={opened} onClose={close} title="Post a task" centered>
                <TextInput
                  label="Task title"
                  placeholder="e.g. Solve calculus worksheet #3"
                  mt="sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  label="Description"
                  placeholder="What needs to be done? Deadline? Formatting requirements?"
                  mt="sm"
                  minRows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <Autocomplete
                  label="Subject"
                  placeholder="e.g. Math / Programming / English"
                  mt="sm"
                  data={categoryOptions}
                  value={category}
                  onChange={setCategory}
                  comboboxProps={{ withinPortal: false }}
                />

                <NumberInput
                  label="Budget"
                  placeholder="e.g. 1500"
                  mt="sm"
                  min={0}
                  allowNegative={false}
                  thousandSeparator=","
                  value={budget}
                  onChange={setBudget}
                />

                <TextInput
                  label="Contact"
                  description="Telegram/Discord/email (max 35 chars)"
                  placeholder="@yourhandle"
                  mt="sm"
                  maxLength={35}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />

                <FileInput
                  accept="image/png,image/jpeg"
                  label="Attachment (optional)"
                  description="Screenshot of the task / requirements"
                  placeholder="Upload image"
                  mt="sm"
                  onChange={handleFileChange}
                  value={file}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close}>Cancel</Button>
                  <Button onClick={handlePost} color='violet'>Publish</Button>
                </Group>
            </Modal>
            <div className='header'>
                <Link to={"/"} className="brand">
                  <img src={logo} height="40" className='logo' alt="Studylance" />
                  <span className="brandName">Studylance</span>
                </Link>
                <div className='texts'>
                    <button type="button" className='link linkButton' onClick={handleOpenCreate}>
                        <span className='perexod'>POST A TASK</span>
                    </button>
                    <Link style={{ textDecoration: 'none' }} to={"/posts"}>
                        <div className='link'>
                            <span className='perexod'>
                                BROWSE TASKS
                            </span>
                        </div>
                    </Link>
                    {isLoggedIn && (
                      <Link style={{ textDecoration: 'none' }} to={"/dashboard"}>
                        <div className='link'>
                          <span className='perexod'>DASHBOARD</span>
                        </div>
                      </Link>
                    )}
                    {isLoggedIn && (
                      <Link style={{ textDecoration: 'none' }} to={"/profile"}>
                        <div className='link'>
                          <span className='perexod'>PROFILE</span>
                        </div>
                      </Link>
                    )}
                    {isLoggedIn && isAdmin && (
                      <Link style={{ textDecoration: 'none' }} to={"/admin"}>
                        <div className='link'>
                          <span className='perexod'>ADMIN</span>
                        </div>
                      </Link>
                    )}
                    {!isLoggedIn &&
                        <div className='signs'>
                            <Link to={`/signup`} style={{ textDecoration: 'none' }}>
                              <Button variant="filled" color="violet" size="md">SIGN UP</Button>
                            </Link>
                            <Link to={`/signin`} style={{ textDecoration: 'none' }}>
                              <Button variant="default" color="gray" style={{ marginLeft: '8px' }}>SIGN IN</Button>
                            </Link>
                        </div>
                    }
                    {user &&
                        <div className='signs'>
                            <Link to="/profile" style={{ textDecoration: 'none' }}>{user}</Link>
                            <Button
                              variant="default"
                              color="gray"
                              size="sm"
                              style={{ marginLeft: '10px' }}
                              onClick={handleLogout}
                            >
                              SIGN OUT
                            </Button>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
