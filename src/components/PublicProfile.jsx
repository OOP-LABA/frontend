import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Button, Container, Group, Modal, Paper, Text, Textarea, Title } from '@mantine/core';
import Header from './Header';
import api from '../axios.js';
import { formatCity, formatDateTime, formatReviewsCount } from '../i18n.js';

export default function PublicProfile() {
  const { username } = useParams();
  const isLoggedIn = useSelector(state => state.app.isLoggedIn);
  const me = useSelector(state => state.app.user);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reportOpened, setReportOpened] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportState, setReportState] = useState({ sending: false, error: '' });

  const canReport = isLoggedIn && me && username && me !== username;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`profiles/${username}`),
          api.get(`profiles/${username}/reviews`),
        ]);
        if (!mounted) return;
        setProfile(profileRes.data || null);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
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
  }, [username]);

  const skills = useMemo(() => {
    const raw = profile?.skills || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }, [profile?.skills]);

  const handleReport = async () => {
    const reason = reportReason.trim();
    if (!reason) return;

    try {
      setReportState({ sending: true, error: '' });
      await api.post('complaints', { reason, targetUsername: username });
      setReportOpened(false);
      setReportReason('');
    } catch (e) {
      const message = e?.response?.data?.message || 'Не удалось отправить жалобу';
      setReportState({ sending: false, error: message });
      return;
    }

    setReportState({ sending: false, error: '' });
  };

  return (
    <>
      <Header />

      <Modal opened={reportOpened} onClose={() => setReportOpened(false)} title="Пожаловаться на пользователя" centered>
        <Textarea
          label="Причина"
          placeholder="Опишите, что произошло"
          minRows={4}
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
        {reportState.error && (
          <Text c="red" size="sm" mt="sm">
            {reportState.error}
          </Text>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setReportOpened(false)}>Отмена</Button>
          <Button color="violet" onClick={handleReport} loading={reportState.sending} disabled={!reportReason.trim()}>
            Отправить
          </Button>
        </Group>
      </Modal>

      <Container size="md" className="profilePage">
        {loading ? (
          <Text c="dimmed">Загружаем профиль...</Text>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : !profile ? (
          <Text c="dimmed">Профиль не найден.</Text>
        ) : (
          <>
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Title order={2}>{profile.username}</Title>
                <Text c="dimmed" size="sm">
                  {[profile.firstName, profile.secondName].filter(Boolean).join(' ')}
                  {profile.city ? ` · ${formatCity(profile.city)}` : ''}
                </Text>
              </div>

              <Group gap="xs">
                <Badge variant="light" color="violet">
                  {profile.ratingAverage !== null && profile.ratingAverage !== undefined
                    ? `${Number(profile.ratingAverage).toFixed(1)} / 5`
                    : '— / 5'}
                </Badge>
                <Badge variant="light" color="gray">{formatReviewsCount(profile.ratingCount ?? 0)}</Badge>
                {canReport && (
                  <Button variant="default" color="gray" onClick={() => setReportOpened(true)}>
                    Пожаловаться
                  </Button>
                )}
              </Group>
            </Group>

            <div className="profileGrid">
              <Paper withBorder radius="lg" p="md" className="profileCard">
                {profile.headline && <Text fw={800}>{profile.headline}</Text>}
                {profile.about && <Text mt="sm" className="profilePreviewText">{profile.about}</Text>}

                {skills.length > 0 && (
                  <>
                    <Text fw={700} mt="lg">Навыки</Text>
                    <div className="profileChips">
                      {skills.map((s) => (
                        <span key={s} className="profileChip">{s}</span>
                      ))}
                    </div>
                  </>
                )}

                {profile.portfolio && (
                  <>
                    <Text fw={700} mt="lg">Портфолио</Text>
                    <Text c="dimmed" size="sm" className="profilePreviewText">
                      {profile.portfolio}
                    </Text>
                  </>
                )}

                {profile.contacts && (
                  <>
                    <Text fw={700} mt="lg">Контакты</Text>
                    <Text c="dimmed" size="sm" className="profilePreviewText">
                      {profile.contacts}
                    </Text>
                  </>
                )}
              </Paper>

              <Paper withBorder radius="lg" p="md" className="profileCard">
                <Group justify="space-between" align="center">
                  <Text fw={800}>Отзывы</Text>
                  <Text c="dimmed" size="sm">{reviews.length}</Text>
                </Group>

                {reviews.length === 0 ? (
                  <Text c="dimmed" size="sm" mt="sm">Отзывов пока нет.</Text>
                ) : (
                  <div className="reviewsList">
                    {reviews.map((r) => (
                      <Paper key={r.id} withBorder radius="md" p="sm" className="reviewCard">
                        <Group justify="space-between" align="center">
                          <Group gap="xs">
                            <Badge color="violet" variant="light">{r.rating} / 5</Badge>
                            <Text fw={700}>
                              <Link to={`/profiles/${r.reviewerUsername}`} className="inlineLink">
                                {r.reviewerUsername}
                              </Link>
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(r.createdAt)}
                          </Text>
                        </Group>
                        {r.content && <Text mt={6} className="profilePreviewText">{r.content}</Text>}
                        {r.postId && (
                          <Text size="sm" c="dimmed" mt={6}>
                            Задание: <Link to={`/posts/${r.postId}`} className="inlineLink">#{r.postId}</Link>
                          </Text>
                        )}
                      </Paper>
                    ))}
                  </div>
                )}
              </Paper>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
