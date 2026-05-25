import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Checkbox, Container, Group, Modal, Paper, Select, Table, Text, TextInput, Textarea, Title, Tabs } from '@mantine/core';
import Header from './Header';
import AuthenticationTitle from './Auth.jsx';
import api from '../axios.js';
import { Link } from 'react-router-dom';
import { formatCity, formatRole, formatStatus } from '../i18n.js';

export default function Admin() {
  const isLoggedIn = useSelector(state => state.app.isLoggedIn);
  const isAdmin = useSelector(state => state.app.isAdmin);

  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState('');
  const [complaintsStatus, setComplaintsStatus] = useState('OPEN');

  const [banOpened, setBanOpened] = useState(false);
  const [banUsername, setBanUsername] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banState, setBanState] = useState({ saving: false, error: '' });

  const [resolveOpened, setResolveOpened] = useState(false);
  const [resolveComplaint, setResolveComplaint] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [resolveNote, setResolveNote] = useState('');
  const [resolveBanUser, setResolveBanUser] = useState(false);
  const [resolveBanReason, setResolveBanReason] = useState('');
  const [resolveState, setResolveState] = useState({ saving: false, error: '' });

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      const res = await api.get('admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setUsersError(e?.response?.data?.message || 'Не удалось загрузить пользователей');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchComplaints = useCallback(async (statusOverride) => {
    try {
      setComplaintsLoading(true);
      setComplaintsError('');

      const params = {};
      const statusValue = statusOverride ?? complaintsStatus;
      if (statusValue && statusValue !== 'ALL') params.status = statusValue;
      const res = await api.get('admin/complaints', { params });
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setComplaintsError(e?.response?.data?.message || 'Не удалось загрузить жалобы');
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }, [complaintsStatus]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    fetchUsers();
    fetchComplaints();
  }, [fetchComplaints, fetchUsers, isAdmin, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    fetchComplaints();
  }, [complaintsStatus, fetchComplaints, isAdmin, isLoggedIn]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => String(u.username || '').toLowerCase().includes(q));
  }, [userSearch, users]);

  const openBan = (username) => {
    setBanUsername(username);
    setBanReason('');
    setBanState({ saving: false, error: '' });
    setBanOpened(true);
  };

  const handleBan = async () => {
    if (!banUsername) return;
    try {
      setBanState({ saving: true, error: '' });
      await api.post(`admin/users/${banUsername}/ban`, { reason: banReason });
      setBanOpened(false);
      await fetchUsers();
      setBanState({ saving: false, error: '' });
    } catch (e) {
      setBanState({ saving: false, error: e?.response?.data?.message || 'Не удалось заблокировать пользователя' });
    }
  };

  const handleUnban = async (username) => {
    if (!window.confirm(`Разблокировать ${username}?`)) return;
    try {
      await api.post(`admin/users/${username}/unban`);
      await fetchUsers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Не удалось разблокировать пользователя');
    }
  };

  const openResolve = (complaint) => {
    setResolveComplaint(complaint);
    setResolveStatus('RESOLVED');
    setResolveNote('');
    setResolveBanUser(false);
    setResolveBanReason('');
    setResolveState({ saving: false, error: '' });
    setResolveOpened(true);
  };

  const handleResolve = async () => {
    if (!resolveComplaint?.id) return;
    try {
      setResolveState({ saving: true, error: '' });
      await api.post(`admin/complaints/${resolveComplaint.id}/resolve`, {
        status: resolveStatus,
        adminNote: resolveNote,
        banUser: resolveBanUser,
        banReason: resolveBanUser ? resolveBanReason : '',
      });
      setResolveOpened(false);
      await fetchComplaints();
      await fetchUsers();
      setResolveState({ saving: false, error: '' });
    } catch (e) {
      setResolveState({ saving: false, error: e?.response?.data?.message || 'Не удалось обработать жалобу' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!postId) return;
    if (!window.confirm(`Удалить задание #${postId}?`)) return;
    try {
      await api.delete(`admin/posts/${postId}`);
      await fetchComplaints();
    } catch (e) {
      alert(e?.response?.data?.message || 'Не удалось удалить задание');
    }
  };

  const badgeColorForStatus = (status) => {
    switch (status) {
      case 'OPEN':
        return 'yellow';
      case 'RESOLVED':
        return 'green';
      case 'REJECTED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (!isLoggedIn) return <AuthenticationTitle />;

  return (
    <>
      <Header />

      <Modal opened={banOpened} onClose={() => setBanOpened(false)} title={`Заблокировать пользователя: ${banUsername}`} centered>
        <TextInput
          label="Причина"
          placeholder="Необязательно"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
        {banState.error && <Text c="red" size="sm" mt="sm">{banState.error}</Text>}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setBanOpened(false)}>Отмена</Button>
          <Button color="red" onClick={handleBan} loading={banState.saving}>
            Заблокировать
          </Button>
        </Group>
      </Modal>

      <Modal opened={resolveOpened} onClose={() => setResolveOpened(false)} title={`Обработать жалобу #${resolveComplaint?.id ?? ''}`} centered>
        <Select
          label="Статус"
          data={[
            { value: 'RESOLVED', label: formatStatus('RESOLVED') },
            { value: 'REJECTED', label: formatStatus('REJECTED') },
          ]}
          value={resolveStatus}
          onChange={(v) => setResolveStatus(v || 'RESOLVED')}
          comboboxProps={{ withinPortal: false }}
        />
        <Textarea
          label="Заметка администратора"
          mt="sm"
          minRows={3}
          value={resolveNote}
          onChange={(e) => setResolveNote(e.target.value)}
        />
        <Checkbox
          mt="sm"
          label="Заблокировать пользователя по итогам жалобы"
          checked={resolveBanUser}
          onChange={(e) => setResolveBanUser(e.currentTarget.checked)}
        />
        {resolveBanUser && (
          <TextInput
            mt="sm"
            label="Причина блокировки"
            placeholder="Заблокирован администратором"
            value={resolveBanReason}
            onChange={(e) => setResolveBanReason(e.target.value)}
          />
        )}
        {resolveState.error && <Text c="red" size="sm" mt="sm">{resolveState.error}</Text>}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setResolveOpened(false)}>Отмена</Button>
          <Button color="violet" onClick={handleResolve} loading={resolveState.saving}>
            Сохранить
          </Button>
        </Group>
      </Modal>

      <Container size="lg" className="adminPage">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>Админка</Title>
            <Text c="dimmed" size="sm">Пользователи, блокировки, жалобы и модерация.</Text>
          </div>
          {!isAdmin && (
            <Badge color="red" variant="light">Нет прав администратора</Badge>
          )}
        </Group>

        {!isAdmin ? (
          <Paper withBorder radius="lg" p="md" className="adminCard">
            <Text>У вас нет доступа к инструментам администратора.</Text>
          </Paper>
        ) : (
          <Paper withBorder radius="lg" p="md" className="adminCard">
            <Tabs value={tab} onChange={(v) => setTab(v || 'users')}>
              <Tabs.List>
                <Tabs.Tab value="users">Пользователи</Tabs.Tab>
                <Tabs.Tab value="complaints">Жалобы</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="users" pt="md">
                <Group justify="space-between" align="flex-end" mb="sm">
                  <TextInput
                    label="Поиск"
                    placeholder="логин"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="adminSearch"
                  />
                  <Button variant="default" onClick={fetchUsers} loading={usersLoading}>
                    Обновить
                  </Button>
                </Group>

                {usersError && <Text c="red" size="sm">{usersError}</Text>}
                {usersLoading ? (
                  <Text c="dimmed">Загрузка...</Text>
                ) : (
                  <div className="adminTableWrap">
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Пользователь</Table.Th>
                          <Table.Th>Почта</Table.Th>
                          <Table.Th>Роли</Table.Th>
                          <Table.Th>Статус</Table.Th>
                          <Table.Th>Действия</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filteredUsers.map((u) => (
                          <Table.Tr key={u.id ?? u.username}>
                            <Table.Td>
                              <Text fw={700}>
                                <Link to={`/profiles/${u.username}`} className="inlineLink">
                                  {u.username}
                                </Link>
                              </Text>
                              <Text size="xs" c="dimmed">
                                {[u.firstName, u.secondName].filter(Boolean).join(' ')}
                                {u.city ? ` · ${formatCity(u.city)}` : ''}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{u.email}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={6}>
                                {(u.roles || []).map((r) => (
                                  <Badge key={r} variant="light" color={r === 'ROLE_ADMIN' ? 'violet' : 'gray'}>
                                    {formatRole(r)}
                                  </Badge>
                                ))}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              {u.banned ? (
                                <Badge color="red" variant="light">Заблокирован</Badge>
                              ) : (
                                <Badge color="green" variant="light">Активен</Badge>
                              )}
                              {u.banned && u.banReason && (
                                <Text size="xs" c="dimmed" mt={4}>{u.banReason}</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                {u.banned ? (
                                  <Button size="xs" variant="default" onClick={() => handleUnban(u.username)}>
                                    Разблокировать
                                  </Button>
                                ) : (
                                  <Button size="xs" color="red" variant="light" onClick={() => openBan(u.username)}>
                                    Заблокировать
                                  </Button>
                                )}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="complaints" pt="md">
                <Group justify="space-between" align="flex-end" mb="sm">
                  <Select
                    label="Статус"
                    data={[
                      { value: 'ALL', label: formatStatus('ALL') },
                      { value: 'OPEN', label: formatStatus('OPEN') },
                      { value: 'RESOLVED', label: formatStatus('RESOLVED') },
                      { value: 'REJECTED', label: formatStatus('REJECTED') },
                    ]}
                    value={complaintsStatus}
                    onChange={(v) => setComplaintsStatus(v || 'OPEN')}
                    comboboxProps={{ withinPortal: false }}
                  />
                  <Button variant="default" onClick={fetchComplaints} loading={complaintsLoading}>
                    Обновить
                  </Button>
                </Group>

                {complaintsError && <Text c="red" size="sm">{complaintsError}</Text>}
                {complaintsLoading ? (
                  <Text c="dimmed">Загрузка...</Text>
                ) : complaints.length === 0 ? (
                  <Text c="dimmed">Жалоб нет.</Text>
                ) : (
                  <div className="adminTableWrap">
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Статус</Table.Th>
                          <Table.Th>Автор жалобы</Table.Th>
                          <Table.Th>Цель</Table.Th>
                          <Table.Th>Причина</Table.Th>
                          <Table.Th>Действия</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {complaints.map((c) => (
                          <Table.Tr key={c.id}>
                            <Table.Td>#{c.id}</Table.Td>
                            <Table.Td>
                              <Badge variant="light" color={badgeColorForStatus(c.status)}>{formatStatus(c.status)}</Badge>
                            </Table.Td>
                            <Table.Td>
                              {c.reporterUsername ? (
                                <Link to={`/profiles/${c.reporterUsername}`} className="inlineLink">
                                  {c.reporterUsername}
                                </Link>
                              ) : (
                                '—'
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                {c.targetUsername && (
                                  <Badge variant="light" color="gray">
                                    <Link to={`/profiles/${c.targetUsername}`} className="inlineLink">
                                      @{c.targetUsername}
                                    </Link>
                                  </Badge>
                                )}
                                {c.targetPostId && (
                                  <Badge variant="light" color="gray">
                                    <Link to={`/posts/${c.targetPostId}`} className="inlineLink">
                                      задание #{c.targetPostId}
                                    </Link>
                                  </Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" lineClamp={2}>{c.reason}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Button size="xs" variant="light" color="violet" onClick={() => openResolve(c)}>
                                  Обработать
                                </Button>
                                {c.targetPostId && (
                                  <Button size="xs" variant="default" color="red" onClick={() => handleDeletePost(c.targetPostId)}>
                                    Удалить задание
                                  </Button>
                                )}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </Container>
    </>
  );
}
