import Header from "./Header";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Button, Container, Group, Image, Modal, NumberInput, Paper, Select, Text, Textarea, TextInput, Title } from '@mantine/core';
import api from '../axios.js';
import {
  formatCategory,
  formatCity,
  formatDateTime,
  formatDepositStatus,
  formatNumber,
  formatOffersCount,
  formatStatus,
} from '../i18n.js';

export default function NewPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [status, setStatus] = useState('loading');
    const [pageError, setPageError] = useState('');
    const [copyState, setCopyState] = useState('idle');
    const [offerText, setOfferText] = useState('');
    const [sendingOffer, setSendingOffer] = useState(false);
    const [offerError, setOfferError] = useState('');
    const isLoggedIn = useSelector(state => state.app.isLoggedIn);
    const username = useSelector(state => state.app.user);
    const isAdmin = useSelector(state => state.app.isAdmin);

    const [categories, setCategories] = useState([]);

    const [acceptOpened, setAcceptOpened] = useState(false);
    const [acceptOffer, setAcceptOffer] = useState(null);
    const [depositAmount, setDepositAmount] = useState(null);
    const [acceptState, setAcceptState] = useState({ sending: false, error: '' });

    const [editOpened, setEditOpened] = useState(false);
    const [editState, setEditState] = useState({ saving: false, error: '' });
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editCategory, setEditCategory] = useState(null);
    const [editBudget, setEditBudget] = useState(null);
    const [editContact, setEditContact] = useState('');

    const [reviewOpened, setReviewOpened] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewState, setReviewState] = useState({ sending: false, error: '', ok: '' });

    const [reportOpened, setReportOpened] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportState, setReportState] = useState({ sending: false, error: '', ok: '' });

    const refreshTask = useCallback(async () => {
      const response = await api.get(`posts/${postId}`);
      setPost(response.data || null);
    }, [postId]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          setStatus('loading');
          setPageError('');
          await refreshTask();
          setStatus('succeeded');
        } catch (error) {
          console.error('Error fetching posts:', error);
          setPageError(error?.response?.data?.message || 'Не удалось загрузить задание');
          setStatus('failed');
        }
      };

      fetchData();
    }, [postId, refreshTask]);

    useEffect(() => {
      let mounted = true;
      const fetchCategories = async () => {
        try {
          const response = await api.get('categories');
          if (!mounted) return;
          setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (e) {
          console.warn('Failed to load categories', e);
        }
      };

      fetchCategories();
      return () => {
        mounted = false;
      };
    }, []);

    const budgetLabel = useMemo(() => {
      if (!post) return '';
      return formatNumber(post.goal);
    }, [post]);

    const depositLabel = useMemo(() => {
      if (!post) return '';
      return formatNumber(post.depositAmount);
    }, [post]);

    const handleCopyContact = async () => {
      if (!post?.accountDetails) return;
      try {
        setCopyState('copying');
        await navigator.clipboard.writeText(post.accountDetails);
        setCopyState('copied');
        window.setTimeout(() => setCopyState('idle'), 1200);
      } catch (e) {
        console.warn('Clipboard copy failed', e);
        setCopyState('idle');
      }
    };

    const offers = useMemo(() => {
      if (!post?.comments) return [];
      return Array.isArray(post.comments) ? post.comments : [];
    }, [post]);

    const categoryOptions = useMemo(
      () => categories.map((c) => ({ value: c.name, label: formatCategory(c.name) })),
      [categories]
    );

    const isOwner = Boolean(post?.authorUsername && username && post.authorUsername === username);
    const isExecutor = Boolean(post?.executorUsername && username && post.executorUsername === username);
    const canManage = Boolean(isLoggedIn && (isAdmin || isOwner));

    const handleSendOffer = async () => {
      const text = offerText.trim();
      if (!text) return;

      try {
        setOfferError('');
        setSendingOffer(true);
        await api.post(`posts/${postId}/comments`, { content: text });
        setOfferText('');
        await refreshTask();
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось отправить отклик';
        setOfferError(message);
      } finally {
        setSendingOffer(false);
      }
    };

    const openEdit = () => {
      if (!post) return;
      setEditTitle(post.title ?? '');
      setEditContent(post.content ?? '');
      setEditCategory(post.category ?? null);
      setEditBudget(typeof post.goal === 'number' ? post.goal : Number(post.goal) || 0);
      setEditContact(post.accountDetails ?? '');
      setEditState({ saving: false, error: '' });
      setEditOpened(true);
    };

    const handleSaveEdit = async () => {
      try {
        setEditState({ saving: true, error: '' });
        await api.put(`posts/${postId}`, {
          title: editTitle,
          content: editContent,
          category: editCategory,
          goal: Number(editBudget) || 0,
          accountDetails: editContact,
        });
        setEditOpened(false);
        await refreshTask();
        setEditState({ saving: false, error: '' });
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось обновить задание';
        setEditState({ saving: false, error: message });
      }
    };

    const handleDeleteTask = async () => {
      if (!window.confirm('Удалить это задание?')) return;
      try {
        await api.delete(`posts/${postId}`);
        navigate('/posts');
      } catch (e) {
        alert(e?.response?.data?.message || 'Не удалось удалить задание');
      }
    };

    const openAccept = (offer) => {
      setAcceptOffer(offer);
      setDepositAmount(Number(post?.goal) || 0);
      setAcceptState({ sending: false, error: '' });
      setAcceptOpened(true);
    };

    const handleAcceptOffer = async () => {
      if (!acceptOffer?.id) return;
      try {
        setAcceptState({ sending: true, error: '' });
        await api.post(`posts/${postId}/comments/${acceptOffer.id}/accept`, {
          depositAmount: typeof depositAmount === 'number' ? depositAmount : Number(depositAmount) || 0,
        });
        setAcceptOpened(false);
        setAcceptOffer(null);
        await refreshTask();
        setAcceptState({ sending: false, error: '' });
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось принять отклик';
        setAcceptState({ sending: false, error: message });
      }
    };

    const handleSetStatus = async (newStatus) => {
      try {
        await api.patch(`posts/${postId}/status`, { status: newStatus });
        await refreshTask();
      } catch (e) {
        alert(e?.response?.data?.message || 'Не удалось обновить статус');
      }
    };

    const handleLeaveReview = async () => {
      try {
        setReviewState({ sending: true, error: '', ok: '' });
        await api.post(`posts/${postId}/reviews`, {
          rating: Number(reviewRating) || 5,
          content: reviewContent,
        });
        setReviewState({ sending: false, error: '', ok: 'Отзыв отправлен!' });
        setReviewOpened(false);
        setReviewContent('');
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось отправить отзыв';
        setReviewState({ sending: false, error: message, ok: '' });
      }
    };

    const handleReportTask = async () => {
      const reason = reportReason.trim();
      if (!reason) return;
      try {
        setReportState({ sending: true, error: '', ok: '' });
        await api.post('complaints', { reason, targetPostId: Number(postId) });
        setReportState({ sending: false, error: '', ok: 'Жалоба отправлена!' });
        setReportOpened(false);
        setReportReason('');
      } catch (e) {
        const message = e?.response?.data?.message || 'Не удалось отправить жалобу';
        setReportState({ sending: false, error: message, ok: '' });
      }
    };

    if (status === 'loading') return <div>Загрузка...</div>;
    if (status === 'failed') return <div>{pageError || 'Не удалось загрузить задание.'}</div>;
    if (!post) return <div>Задание не найдено.</div>;

    return (
        <>
        <Header />
        <Modal opened={editOpened} onClose={() => setEditOpened(false)} title="Редактировать задание" centered>
          <TextInput
            label="Название задания"
            mt="sm"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            label="Описание"
            mt="sm"
            minRows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          {categoryOptions.length > 0 ? (
            <Select
              label="Предмет"
              placeholder="Выберите предмет"
              mt="sm"
              data={categoryOptions}
              searchable
              clearable
              value={editCategory}
              onChange={setEditCategory}
              comboboxProps={{ withinPortal: false }}
            />
          ) : (
            <TextInput
              label="Предмет"
              placeholder="Например: математика / программирование / английский"
              mt="sm"
              value={editCategory ?? ''}
              onChange={(e) => setEditCategory(e.target.value)}
            />
          )}
          <NumberInput
            label="Бюджет"
            mt="sm"
            min={0}
            allowNegative={false}
            thousandSeparator=","
            value={editBudget}
            onChange={setEditBudget}
          />
          <TextInput
            label="Контакт"
            mt="sm"
            maxLength={35}
            value={editContact}
            onChange={(e) => setEditContact(e.target.value)}
          />
          {editState.error && <Text c="red" size="sm" mt="sm">{editState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditOpened(false)}>Отмена</Button>
            <Button color="violet" onClick={handleSaveEdit} loading={editState.saving}>
              Сохранить
            </Button>
          </Group>
        </Modal>

        <Modal opened={acceptOpened} onClose={() => setAcceptOpened(false)} title="Принять отклик" centered>
          <Text size="sm" c="dimmed">
            Укажите сумму депозита, которая будет удержана за это задание.
          </Text>
          <NumberInput
            label="Сумма депозита"
            mt="sm"
            min={0}
            allowNegative={false}
            thousandSeparator=","
            value={depositAmount}
            onChange={setDepositAmount}
          />
          {acceptState.error && <Text c="red" size="sm" mt="sm">{acceptState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setAcceptOpened(false)}>Отмена</Button>
            <Button color="violet" onClick={handleAcceptOffer} loading={acceptState.sending}>
              Принять
            </Button>
          </Group>
        </Modal>

        <Modal opened={reviewOpened} onClose={() => setReviewOpened(false)} title="Оставить отзыв" centered>
          <NumberInput
            label="Оценка (1-5)"
            mt="sm"
            min={1}
            max={5}
            value={reviewRating}
            onChange={setReviewRating}
          />
          <Textarea
            label="Комментарий (необязательно)"
            placeholder="Что понравилось и что можно улучшить"
            mt="sm"
            minRows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
          {reviewState.error && <Text c="red" size="sm" mt="sm">{reviewState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setReviewOpened(false)}>Отмена</Button>
            <Button color="violet" onClick={handleLeaveReview} loading={reviewState.sending}>
              Отправить
            </Button>
          </Group>
        </Modal>

        <Modal opened={reportOpened} onClose={() => setReportOpened(false)} title="Пожаловаться на задание" centered>
          <Textarea
            label="Причина"
            placeholder="Опишите, что произошло"
            minRows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          {reportState.error && <Text c="red" size="sm" mt="sm">{reportState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setReportOpened(false)}>Отмена</Button>
            <Button color="violet" onClick={handleReportTask} loading={reportState.sending} disabled={!reportReason.trim()}>
              Отправить
            </Button>
          </Group>
        </Modal>

        <Container size="md" className="taskPage">
          <Paper withBorder radius="lg" p="lg" className="taskCard">
            <Group align="flex-start" gap="xl" className="taskLayout">
              <Image
                src={post.avatar}
                alt="Вложение к заданию"
                radius="md"
                className="taskImage"
                fallbackSrc="/task-placeholder.svg"
              />

              <div className="taskContent">
                <Group justify="space-between" align="flex-start" gap="md">
                  <div>
                    <Title order={2} className="taskTitle">{post.title}</Title>
                    <Text c="dimmed" size="sm" mt={4}>
                      Бюджет: <span className="taskBudget">{budgetLabel}</span>
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Автор:{' '}
                      {post.authorUsername ? (
                        <Link to={`/profiles/${post.authorUsername}`} className="inlineLink">
                          {post.authorUsername}
                        </Link>
                      ) : (
                        'неизвестно'
                      )}
                      {post.authorCity ? ` · ${formatCity(post.authorCity)}` : ''}
                    </Text>
                  </div>

                  <Group gap="xs">
                    {post.category && (
                      <Badge variant="light" color="violet">
                        {formatCategory(post.category)}
                      </Badge>
                    )}
                    {post.status && (
                      <Badge variant="light" color="gray">
                        {formatStatus(post.status)}
                      </Badge>
                    )}
                  </Group>
                </Group>

                <Group gap="sm" mt="md" wrap="wrap">
                  {post.executorUsername && (
                    <Badge variant="light" color="teal">
                      Исполнитель:{' '}
                      <Link to={`/profiles/${post.executorUsername}`} className="inlineLink">
                        {post.executorUsername}
                      </Link>
                    </Badge>
                  )}
                  {post.depositStatus && (
                    <Badge variant="light" color="orange">
                      Депозит: {depositLabel} ({formatDepositStatus(post.depositStatus)})
                    </Badge>
                  )}
                  {isLoggedIn && (
                    <Button variant="default" color="gray" onClick={() => setReportOpened(true)}>
                      Пожаловаться
                    </Button>
                  )}
                  {canManage && (
                    <>
                      <Button variant="light" color="violet" onClick={openEdit} disabled={!isAdmin && post.status !== 'OPEN'}>
                        Редактировать
                      </Button>
                      <Button variant="default" color="red" onClick={handleDeleteTask} disabled={!isAdmin && post.status !== 'OPEN'}>
                        Удалить
                      </Button>
                    </>
                  )}
                </Group>

                <Group gap="sm" mt="sm" wrap="wrap">
                  {(isOwner || isExecutor || isAdmin) && post.status === 'IN_PROGRESS' && (
                    <Button variant="light" color="teal" onClick={() => handleSetStatus('DONE')}>
                      Отметить выполненным
                    </Button>
                  )}
                  {(isOwner || isAdmin) && post.status !== 'DONE' && post.status !== 'CANCELLED' && (
                    <Button variant="default" color="gray" onClick={() => handleSetStatus('CANCELLED')}>
                      Отменить задание
                    </Button>
                  )}
                </Group>

                <Text mt="md" className="taskDescription">
                  {post.content}
                </Text>

                <Paper withBorder radius="md" p="md" mt="lg" className="taskContact">
                  <Text size="sm" c="dimmed">Контакт</Text>
                  <Group justify="space-between" align="center" mt={6}>
                    <Text fw={600}>{post.accountDetails}</Text>
                    <Button
                      variant="light"
                      color="violet"
                      onClick={handleCopyContact}
                      disabled={copyState === 'copying'}
                    >
                      {copyState === 'copied' ? 'Скопировано' : 'Копировать'}
                    </Button>
                  </Group>
                </Paper>

                <Paper withBorder radius="md" p="md" mt="lg" className="offersSection">
                  <Group justify="space-between" align="center">
                    <Text fw={800}>Отклики</Text>
                    <Text size="sm" c="dimmed">{formatOffersCount(offers.length)}</Text>
                  </Group>

                  {offers.length === 0 ? (
                    <Text c="dimmed" size="sm" mt="sm">
                      Откликов пока нет. Вы можете быть первым.
                    </Text>
                  ) : (
                    <div className="offersList">
                      {offers.map((offer, idx) => {
                        const authorName =
                          [offer.firstName, offer.secondName].filter(Boolean).join(' ') || offer.username || 'Студент';
                        const date = formatDateTime(offer.createdAt);
                        return (
                          <Paper key={offer.id ?? `${offer.createdAt ?? idx}-${idx}`} withBorder radius="md" p="sm" className="offerCard">
                            <Group justify="space-between" align="center">
                              <Group gap="xs">
                                <Text fw={700}>
                                  {offer.username ? (
                                    <Link to={`/profiles/${offer.username}`} className="inlineLink">
                                      {authorName}
                                    </Link>
                                  ) : (
                                    authorName
                                  )}
                                </Text>
                                {offer.username && <Badge variant="light" color="gray">@{offer.username}</Badge>}
                              </Group>
                              <Text size="xs" c="dimmed">{date}</Text>
                            </Group>
                            <Text mt={6} className="offerText">{offer.content}</Text>
                            {isOwner && post.status === 'OPEN' && offer.id && (
                              <Group justify="flex-end" mt="sm">
                                <Button color="violet" variant="light" onClick={() => openAccept(offer)}>
                                  Принять отклик
                                </Button>
                              </Group>
                            )}
                          </Paper>
                        );
                      })}
                    </div>
                  )}

                  {!isLoggedIn ? (
                    <Text size="sm" c="dimmed" mt="md">
                      <Link to="/signin">Войдите</Link>, чтобы отправить отклик.
                    </Text>
                  ) : isOwner ? (
                    <Text size="sm" c="dimmed" mt="md">
                      Нельзя отправлять отклик на свое задание.
                    </Text>
                  ) : post.status !== 'OPEN' ? (
                    <Text size="sm" c="dimmed" mt="md">
                      Отклики на это задание закрыты.
                    </Text>
                  ) : (
                    <div className="offerForm">
                      <Textarea
                        label="Отправить отклик"
                        placeholder="Опишите, как вы решите задачу, сроки и свою цену, если она отличается от бюджета."
                        mt="md"
                        minRows={3}
                        value={offerText}
                        onChange={(e) => setOfferText(e.target.value)}
                      />
                      {offerError && (
                        <Text size="sm" c="red" mt={6}>{offerError}</Text>
                      )}
                      <Group justify="flex-end" mt="sm">
                        <Button
                          color="violet"
                          variant="filled"
                          onClick={handleSendOffer}
                          loading={sendingOffer}
                          disabled={!offerText.trim()}
                        >
                          Отправить отклик
                        </Button>
                      </Group>
                    </div>
                  )}
                </Paper>

                {isLoggedIn && post.status === 'DONE' && (isOwner || isExecutor) && (
                  <Paper withBorder radius="md" p="md" mt="lg" className="offersSection">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={800}>Отзыв</Text>
                        <Text size="sm" c="dimmed">
                          Оставьте оценку второй стороне этого задания.
                        </Text>
                      </div>
                      <Button color="violet" variant="light" onClick={() => setReviewOpened(true)}>
                        Оставить отзыв
                      </Button>
                    </Group>
                  </Paper>
                )}
              </div>
            </Group>
          </Paper>
        </Container>
        </>
    );
}
