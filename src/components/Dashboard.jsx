import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Container, Group, Paper, Tabs, Text, TextInput, Title } from '@mantine/core';
import Header from './Header';
import AuthenticationTitle from './Auth.jsx';
import api from '../axios.js';
import { Link } from 'react-router-dom';
import { formatCategory, formatNumber, formatStatus } from '../i18n.js';

export default function Dashboard() {
  const isLoggedIn = useSelector(state => state.app.isLoggedIn);
  const username = useSelector(state => state.app.user);
  const isAdmin = useSelector(state => state.app.isAdmin);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('posted');

  useEffect(() => {
    if (!isLoggedIn) return;
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('posts', { params: { sort: 'newest' } });
        if (!mounted) return;
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Не удалось загрузить задания');
        setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const mine = useMemo(
    () => posts.filter((p) => p.authorUsername && p.authorUsername === username),
    [posts, username]
  );
  const assigned = useMemo(
    () => posts.filter((p) => p.executorUsername && p.executorUsername === username),
    [posts, username]
  );

  const filterList = (list) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const hay = `${p.title ?? ''} ${p.content ?? ''} ${p.category ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  };

  const list = tab === 'assigned' ? assigned : mine;
  const filtered = filterList(list);

  const statusColor = (value) => {
    switch (value) {
      case 'OPEN':
        return 'violet';
      case 'IN_PROGRESS':
        return 'teal';
      case 'DONE':
        return 'green';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatMoney = (value) => {
    return formatNumber(value);
  };

  if (!isLoggedIn) return <AuthenticationTitle />;

  return (
    <>
      <Header />
      <Container size="lg" className="dashboardPage">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Личный кабинет</Title>
            <Text c="dimmed" size="sm">
              Ваши задания и отклики в одном месте.
            </Text>
          </div>
          {isAdmin && (
            <Button variant="default" component={Link} to="/admin">
              Открыть админку
            </Button>
          )}
        </Group>

        <Paper withBorder radius="lg" p="md" className="dashboardCard">
          <Group justify="space-between" align="flex-end" mb="sm" wrap="wrap">
            <TextInput
              label="Поиск"
              placeholder="Название / описание / предмет"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="dashboardSearch"
            />
            <Button variant="default" component={Link} to="/posts">
              Все задания
            </Button>
          </Group>

          <Tabs value={tab} onChange={(v) => setTab(v || 'posted')}>
            <Tabs.List>
              <Tabs.Tab value="posted">Мои задания ({mine.length})</Tabs.Tab>
              <Tabs.Tab value="assigned">Я исполнитель ({assigned.length})</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="posted" pt="md">
              {loading ? (
                <Text c="dimmed">Загрузка...</Text>
              ) : error ? (
                <Text c="red">{error}</Text>
              ) : filtered.length === 0 ? (
                <Text c="dimmed">Здесь пока нет заданий.</Text>
              ) : (
                <div className="dashboardList">
                  {filtered.map((p) => (
                    <Paper key={p.id} withBorder radius="md" p="md" className="dashboardItem">
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text fw={800}>{p.title}</Text>
                          <Text size="sm" c="dimmed" mt={4} lineClamp={2}>
                            {p.content}
                          </Text>
                          <Text size="sm" c="dimmed" mt={6}>
                            Бюджет: <Text span fw={700}>{formatMoney(p.goal)}</Text>
                          </Text>
                          {p.executorUsername && (
                            <Text size="sm" c="dimmed" mt={4}>
                              Исполнитель:{' '}
                              <Link to={`/profiles/${p.executorUsername}`} className="inlineLink">
                                {p.executorUsername}
                              </Link>
                            </Text>
                          )}
                        </div>
                        <Group gap="xs">
                          {p.category && <Badge variant="light" color="violet">{formatCategory(p.category)}</Badge>}
                          {p.status && <Badge variant="light" color={statusColor(p.status)}>{formatStatus(p.status)}</Badge>}
                        </Group>
                      </Group>
                      <Group justify="flex-end" mt="sm">
                        <Button size="xs" color="violet" variant="light" component={Link} to={`/posts/${p.id}`}>
                          Открыть
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="assigned" pt="md">
              {loading ? (
                <Text c="dimmed">Загрузка...</Text>
              ) : error ? (
                <Text c="red">{error}</Text>
              ) : filtered.length === 0 ? (
                <Text c="dimmed">Вас пока не назначили исполнителем.</Text>
              ) : (
                <div className="dashboardList">
                  {filtered.map((p) => (
                    <Paper key={p.id} withBorder radius="md" p="md" className="dashboardItem">
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text fw={800}>{p.title}</Text>
                          <Text size="sm" c="dimmed" mt={4} lineClamp={2}>
                            {p.content}
                          </Text>
                          <Text size="sm" c="dimmed" mt={6}>
                            Бюджет: <Text span fw={700}>{formatMoney(p.goal)}</Text>
                          </Text>
                          {p.authorUsername && (
                            <Text size="sm" c="dimmed" mt={4}>
                              Автор:{' '}
                              <Link to={`/profiles/${p.authorUsername}`} className="inlineLink">
                                {p.authorUsername}
                              </Link>
                            </Text>
                          )}
                        </div>
                        <Group gap="xs">
                          {p.category && <Badge variant="light" color="violet">{formatCategory(p.category)}</Badge>}
                          {p.status && <Badge variant="light" color={statusColor(p.status)}>{formatStatus(p.status)}</Badge>}
                        </Group>
                      </Group>
                      <Group justify="flex-end" mt="sm">
                        <Button size="xs" color="violet" variant="light" component={Link} to={`/posts/${p.id}`}>
                          Открыть
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </div>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Container>
    </>
  );
}
