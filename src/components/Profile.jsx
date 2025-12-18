import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Container, Group, Paper, Select, Text, TextInput, Textarea, Title } from '@mantine/core';
import Header from './Header';
import AuthenticationTitle from './Auth.jsx';
import api from '../axios.js';

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
        setCities(list.map((c) => ({ value: c.name, label: c.name })));
      } catch (e) {
        const message = e?.response?.data?.message || 'Failed to load profile';
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
            <Title order={2}>Resume</Title>
            <Text c="dimmed" size="sm">
              This is your public profile + resume (stored in the backend).
            </Text>
          </div>
          <Button color="violet" onClick={handleSave}>
            {savedState === 'saved' ? 'Saved' : 'Save'}
          </Button>
        </Group>

        {loading ? (
          <Text c="dimmed">Loading profile…</Text>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : null}

        <div className="profileGrid">
          <Paper withBorder radius="lg" p="md" className="profileCard">
            <Group grow>
              <TextInput
                label="First name"
                placeholder="Andrew"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                label="Second name"
                placeholder="Watskov"
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </Group>

            <Select
              label="City"
              placeholder="Select a city"
              mt="md"
              searchable
              data={cities}
              value={city}
              onChange={(v) => setCity(v || '')}
              comboboxProps={{ withinPortal: false }}
            />

            <TextInput
              label="Headline"
              placeholder="e.g. I solve math & programming tasks fast"
              mt="md"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <Textarea
              label="About"
              placeholder="A few lines about your experience, tools, and what you’re good at."
              minRows={4}
              mt="md"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />

            <TextInput
              label="Skills"
              description="Comma-separated"
              placeholder="Java, Calculus, Excel, SQL"
              mt="md"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <Textarea
              label="Portfolio links"
              placeholder="One link per line"
              minRows={3}
              mt="md"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />

            <TextInput
              label="Contacts"
              description="What you want to show on your profile (not the same as task contact field)."
              placeholder="@telegram / discord / email"
              mt="md"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
            />
          </Paper>

          <Paper withBorder radius="lg" p="md" className="profileCard">
            <Text c="dimmed" size="sm">Preview</Text>
            <Group justify="space-between" align="flex-start" mt={6}>
              <div>
                <Title order={3}>{username}</Title>
                {(firstName || secondName) && (
                  <Text c="dimmed" size="sm">
                    {[firstName, secondName].filter(Boolean).join(' ')}
                    {city ? ` · ${city}` : ''}
                  </Text>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={700}>
                  {ratingAverage !== null ? ratingAverage.toFixed(1) : '—'} / 5
                </Text>
                <Text c="dimmed" size="xs">{ratingCount} reviews</Text>
              </div>
            </Group>
            {headline && <Text fw={700} mt="sm">{headline}</Text>}
            {about && <Text mt="sm" className="profilePreviewText">{about}</Text>}

            {previewSkills.length > 0 && (
              <>
                <Text fw={700} mt="lg">Skills</Text>
                <div className="profileChips">
                  {previewSkills.map((s) => (
                    <span key={s} className="profileChip">{s}</span>
                  ))}
                </div>
              </>
            )}

            {portfolio.trim() && (
              <>
                <Text fw={700} mt="lg">Portfolio</Text>
                <Text c="dimmed" size="sm" className="profilePreviewText">
                  {portfolio}
                </Text>
              </>
            )}

            {contacts.trim() && (
              <>
                <Text fw={700} mt="lg">Contacts</Text>
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
