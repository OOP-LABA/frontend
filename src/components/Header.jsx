import React, { useEffect, useMemo, useState } from 'react';
import logo from '../assets/Artboard 1@3x.png';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, FileInput, Group, Modal, NumberInput, Select, TextInput, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { logout, post } from '../slices/appSlice.js';
import api from '../axios.js';
import { formatCategory } from '../i18n.js';
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
      return Array.from(new Set(options))
        .sort((a, b) => String(a).localeCompare(String(b)))
        .map((name) => ({ value: name, label: formatCategory(name) }));
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
          alert('Введите название задания');
          return;
        }
        if (!category.trim()) {
          alert('Выберите предмет или категорию');
          return;
        }
        if (!details.trim()) {
          alert('Добавьте контакт для связи: Telegram, Discord или почту');
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
          alert(response.payload?.message || 'Не удалось создать задание');
          return;
        }

        close();
        resetForm();
    }
    return (
        <>
            <Modal opened={opened} onClose={close} title="Опубликовать задание" centered>
                <TextInput
                  label="Название задания"
                  placeholder="Например: решить контрольную по математике"
                  mt="sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  label="Описание"
                  placeholder="Что нужно сделать? Какой дедлайн? Есть ли требования к оформлению?"
                  mt="sm"
                  minRows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                {categoryOptions.length > 0 ? (
                  <Select
                    label="Предмет"
                    placeholder="Выберите предмет"
                    mt="sm"
                    data={categoryOptions}
                    searchable
                    value={category}
                    onChange={(value) => setCategory(value || '')}
                    comboboxProps={{ withinPortal: false }}
                  />
                ) : (
                  <TextInput
                    label="Предмет"
                    placeholder="Например: математика / программирование / английский"
                    mt="sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                )}

                <NumberInput
                  label="Бюджет"
                  placeholder="Например: 1500"
                  mt="sm"
                  min={0}
                  allowNegative={false}
                  thousandSeparator=","
                  value={budget}
                  onChange={setBudget}
                />

                <TextInput
                  label="Контакт"
                  description="Telegram, Discord или почта, до 35 символов"
                  placeholder="@username"
                  mt="sm"
                  maxLength={35}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />

                <FileInput
                  accept="image/png,image/jpeg"
                  label="Вложение (необязательно)"
                  description="Скриншот задания или требований"
                  placeholder="Загрузить изображение"
                  mt="sm"
                  onChange={handleFileChange}
                  value={file}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close}>Отмена</Button>
                  <Button onClick={handlePost} color='violet'>Опубликовать</Button>
                </Group>
            </Modal>
            <div className='header'>
                <Link to={"/"} className="brand">
                  <img src={logo} height="40" className='logo' alt="Studylance" />
                  <span className="brandName">Studylance</span>
                </Link>
                <div className='texts'>
                    <button type="button" className='link linkButton' onClick={handleOpenCreate}>
                        <span className='perexod'>СОЗДАТЬ</span>
                    </button>
                    <Link style={{ textDecoration: 'none' }} to={"/posts"}>
                        <div className='link'>
                            <span className='perexod'>
                                ЗАДАНИЯ
                            </span>
                        </div>
                    </Link>
                    {isLoggedIn && (
                      <Link style={{ textDecoration: 'none' }} to={"/dashboard"}>
                        <div className='link'>
                          <span className='perexod'>КАБИНЕТ</span>
                        </div>
                      </Link>
                    )}
                    {isLoggedIn && (
                      <Link style={{ textDecoration: 'none' }} to={"/profile"}>
                        <div className='link'>
                          <span className='perexod'>ПРОФИЛЬ</span>
                        </div>
                      </Link>
                    )}
                    {isLoggedIn && isAdmin && (
                      <Link style={{ textDecoration: 'none' }} to={"/admin"}>
                        <div className='link'>
                          <span className='perexod'>АДМИН</span>
                        </div>
                      </Link>
                    )}
                    {!isLoggedIn &&
                        <div className='signs'>
                            <Link to={`/signup`} style={{ textDecoration: 'none' }}>
                              <Button variant="filled" color="violet" size="md">Регистрация</Button>
                            </Link>
                            <Link to={`/signin`} style={{ textDecoration: 'none' }}>
                              <Button variant="default" color="gray" style={{ marginLeft: '8px' }}>Войти</Button>
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
                              Выйти
                            </Button>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}
