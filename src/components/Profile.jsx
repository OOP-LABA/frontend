import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Container, Group, Paper, Select, Text, TextInput, Textarea, Title } from '@mantine/core';
import Header from './Header';
import AuthenticationTitle from './Auth.jsx';
import api from '../axios.js';
import { formatCity, formatReviewsCount } from '../i18n.js';

export default function Profile() {
  const isLoggedIn = useSelector(state => state.app.isLoggedIn);
  const username = useSelector(state => state.app.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [contacts, setContacts] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [ratingAverage, setRatingAverage] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [savedState, setSavedState] = useState('idle');

  useEffect(() => {
    if (!isLoggedIn) return;
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [profileRes, citiesRes] = await Promise.all([
          api.get('profiles/me'),
          api.get('cities'),
        ]);

        if (!mounted) return;

        const profile = profileRes.data;
        setFirstName(profile?.firstName ?? '');
        setSecondName(profile?.secondName ?? '');
        setCity(profile?.city ?? '');
        setHeadline(profile?.headline ?? '');
        setAbout(profile?.about ?? '');
        setSkills(profile?.skills ?? '');
        setPortfolio(profile?.portfolio ?? '');
        setContacts(profile?.contacts ?? '');
        setRatingAverage(typeof profile?.ratingAverage === 'number' ? profile.ratingAverage : null);
        setRatingCount(typeof profile?.ratingCount === 'number' ? profile.ratingCount : 0);

        const list = Array.isArray(citiesRes.data) ? citiesRes.data : [];
        setCities(list.map((c) => ({ value: c.name, label: formatCity(c.name) })));
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось загрузить профиль';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const previewSkills = useMemo(
    () => skills.split(',').map(s => s.trim()).filter(Boolean),
    [skills]
  );

  const handleSave = async () => {
    if (!username) return;
    try {
      setSavedState('saving');
      await api.put('profiles/me', {
        firstName,
        secondName,
        city,
        headline,
        about,
        skills,
        portfolio,
        contacts,
      });
      setSavedState('saved');
      window.setTimeout(() => setSavedState('idle'), 1200);
    } catch (e) {
      console.warn('Failed to save profile', e);
      setSavedState('idle');
    }
  };

  if (!isLoggedIn) return <AuthenticationTitle />;

  return (
    <>
      <Header />
      <Container size="md" className="profilePage">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Резюме</Title>
            <Text c="dimmed" size="sm">
              Это ваш публичный профиль, который видят заказчики и исполнители.
            </Text>
          </div>
          <Button color="violet" onClick={handleSave}>
            {savedState === 'saved' ? 'Сохранено' : 'Сохранить'}
          </Button>
        </Group>

        {loading ? (
          <Text c="dimmed">Загружаем профиль...</Text>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : null}

        <div className="profileGrid">
          <Paper withBorder radius="lg" p="md" className="profileCard">
            <Group grow>
              <TextInput
                label="Имя"
                placeholder="Андрей"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                label="Фамилия"
                placeholder="Вацков"
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </Group>

            <Select
              label="Город"
              placeholder="Выберите город"
              mt="md"
              searchable
              data={cities}
              value={city}
              onChange={(v) => setCity(v || '')}
              comboboxProps={{ withinPortal: false }}
            />

            <TextInput
              label="Заголовок"
              placeholder="Например: быстро решаю задачи по математике и программированию"
              mt="md"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <Textarea
              label="О себе"
              placeholder="Несколько строк об опыте, инструментах и том, в чем вы сильны."
              minRows={4}
              mt="md"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />

            <TextInput
              label="Навыки"
              description="Через запятую"
              placeholder="Java, математика, Excel, SQL"
              mt="md"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <Textarea
              label="Ссылки на портфолио"
              placeholder="Одна ссылка на строку"
              minRows={3}
              mt="md"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />

            <TextInput
              label="Контакты"
              description="То, что вы хотите показывать в профиле. Это не поле контакта конкретного задания."
              placeholder="@telegram / Discord / почта"
              mt="md"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
            />
          </Paper>

          <Paper withBorder radius="lg" p="md" className="profileCard">
            <Text c="dimmed" size="sm">Предпросмотр</Text>
            <Group justify="space-between" align="flex-start" mt={6}>
              <div>
                <Title order={3}>{username}</Title>
                {(firstName || secondName) && (
                  <Text c="dimmed" size="sm">
                    {[firstName, secondName].filter(Boolean).join(' ')}
                    {city ? ` · ${formatCity(city)}` : ''}
                  </Text>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={700}>
                  {ratingAverage !== null ? ratingAverage.toFixed(1) : '—'} / 5
                </Text>
                <Text c="dimmed" size="xs">{formatReviewsCount(ratingCount)}</Text>
              </div>
            </Group>
            {headline && <Text fw={700} mt="sm">{headline}</Text>}
            {about && <Text mt="sm" className="profilePreviewText">{about}</Text>}

            {previewSkills.length > 0 && (
              <>
                <Text fw={700} mt="lg">Навыки</Text>
                <div className="profileChips">
                  {previewSkills.map((s) => (
                    <span key={s} className="profileChip">{s}</span>
                  ))}
                </div>
              </>
            )}

            {portfolio.trim() && (
              <>
                <Text fw={700} mt="lg">Портфолио</Text>
                <Text c="dimmed" size="sm" className="profilePreviewText">
                  {portfolio}
                </Text>
              </>
            )}

            {contacts.trim() && (
              <>
                <Text fw={700} mt="lg">Контакты</Text>
                <Text c="dimmed" size="sm" className="profilePreviewText">
                  {contacts}
                </Text>
              </>
            )}
          </Paper>
        </div>
      </Container>
    </>
  );
}
