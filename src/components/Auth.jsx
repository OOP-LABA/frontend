import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
  } from '@mantine/core';
  import Modal from './Modal'
  import React from 'react';
  import { useDispatch, useSelector } from 'react-redux'
  import {login} from '../slices/appSlice.js';
  import { Link, useNavigate } from "react-router-dom";
  import Header from './Header';
  import classes from '../AuthenticationTitle.module.css';

  export default function AuthenticationTitle() {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { status, error } = useSelector(state => state.app);

    const [fields, setFields] = React.useState({});
    

    const handleChange = (field, value) => {
        setFields({
          ...fields,
          [field]: value
        })
      }
      const handleLogin = async () => {
        const response = await dispatch(login(fields));
        if(response.type === 'app/login/fulfilled'){
          navigate("/");
        }
        
      };

    return (
      <> 
      <Modal></Modal>
      <Header></Header>
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Добро пожаловать в Studylance
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Войдите, чтобы смотреть задания и публиковать свои.{' '}
        </Text>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Еще нет аккаунта?{' '}
          <Link to={"/signup"}>
          <Anchor size="sm" component="button">
            Создать аккаунт
          </Anchor>
          </Link>
        </Text>
  
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Логин" placeholder="User123" required onChange={e => handleChange("username", e.target.value)} value={fields['username']}/>
          <PasswordInput label="Пароль" placeholder="Ваш пароль" required mt="md" onChange={e => handleChange("password", e.target.value)} value={fields['password']}/>
          <Group justify="space-between" mt="lg">
            <Checkbox label="Запомнить меня" />
          </Group>
          {status === 'failed' && (
            <Text mt="sm" c="red" size="sm">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </Text>
          )}
          <Button fullWidth mt="xl" color='violet' onClick={handleLogin}>
            Войти
          </Button>
        </Paper>
      </Container>
      </>
    );
  }
