import React from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Select,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../slices/appSlice.js';
import Header from './Header';
import classes from '../AuthenticationTitle.module.css';
import Modal from './Modal'
import api from '../axios.js';
export default function AuthenticationTitle() {
  const [fields, setFields] = React.useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    secondName: '',
    city: ''
  });
  const [cityOptions, setCityOptions] = React.useState([]);
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.app);

  React.useEffect(() => {
    let mounted = true;
    const fetchCities = async () => {
      try {
        const response = await api.get('cities');
        if (!mounted) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setCityOptions(list.map(c => ({ value: c.name, label: c.name })));
      } catch (e) {
        console.warn('Failed to load cities', e);
      }
    };

    fetchCities();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFields({
      ...fields,
      [field]: value
    });
  };

  const handleRegister = async () => {
    const response = await dispatch(register(fields));
    if(response.type === 'app/register/fulfilled'){
      navigate("/");
    }
    
  };

  return (
    <>
      <Modal></Modal>
      <Header />
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Create your account
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Username" placeholder="User123" required onChange={e => handleChange("username", e.target.value)} value={fields.username} />
          {cityOptions.length > 0 ? (
            <Select
              label="City"
              placeholder="Select a city"
              searchable
              required
              mt="md"
              data={cityOptions}
              value={fields.city}
              onChange={(value) => handleChange("city", value || '')}
              comboboxProps={{ withinPortal: false }}
            />
          ) : (
            <TextInput
              label="City"
              placeholder="Moscow"
              required
              mt="md"
              onChange={e => handleChange("city", e.target.value)}
              value={fields.city}
            />
          )}
          <TextInput label="First name" placeholder="Andrew" required onChange={e => handleChange("firstName", e.target.value)} value={fields.firstName} />
          <TextInput label="Second name" placeholder="Watskov" required onChange={e => handleChange("secondName", e.target.value)} value={fields.secondName} />
          <TextInput label="Email" placeholder="you@mail.ru" required onChange={e => handleChange("email", e.target.value)} value={fields.email} />
          <PasswordInput label="Password" placeholder="Your password" required mt="md" onChange={e => handleChange("password", e.target.value)} value={fields.password} />
          
          {status === 'loading' && <Text>Loading...</Text>}
          {status === 'failed' && <Text color="red">{JSON.stringify(error)}</Text>}

          <Button fullWidth mt="xl" color='violet' onClick={handleRegister}>
            Sign up
          </Button>
        </Paper>
      </Container>
    </>
  );
}
