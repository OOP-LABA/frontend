import Header from "./Header";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Button, Container, Group, Image, Modal, NumberInput, Paper, Select, Text, Textarea, TextInput, Title } from '@mantine/core';
import api from '../axios.js';

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
          setPageError(error?.response?.data?.message || 'Failed to load task');
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
      const budget = Number(post.goal) || 0;
      return budget.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }, [post]);

    const depositLabel = useMemo(() => {
      if (!post) return '';
      const amount = Number(post.depositAmount) || 0;
      return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
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
      () => categories.map((c) => ({ value: c.name, label: c.name })),
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
        const message = e?.response?.data?.message || 'Failed to send offer';
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
        const message = e?.response?.data?.message || 'Failed to update task';
        setEditState({ saving: false, error: message });
      }
    };

    const handleDeleteTask = async () => {
      if (!window.confirm('Delete this task?')) return;
      try {
        await api.delete(`posts/${postId}`);
        navigate('/posts');
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to delete task');
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
        const message = e?.response?.data?.message || 'Failed to accept offer';
        setAcceptState({ sending: false, error: message });
      }
    };

    const handleSetStatus = async (newStatus) => {
      try {
        await api.patch(`posts/${postId}/status`, { status: newStatus });
        await refreshTask();
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to update status');
      }
    };

    const handleLeaveReview = async () => {
      try {
        setReviewState({ sending: true, error: '', ok: '' });
        await api.post(`posts/${postId}/reviews`, {
          rating: Number(reviewRating) || 5,
          content: reviewContent,
        });
        setReviewState({ sending: false, error: '', ok: 'Review sent!' });
        setReviewOpened(false);
        setReviewContent('');
      } catch (e) {
        const message = e?.response?.data?.message || 'Failed to send review';
        setReviewState({ sending: false, error: message, ok: '' });
      }
    };

    const handleReportTask = async () => {
      const reason = reportReason.trim();
      if (!reason) return;
      try {
        setReportState({ sending: true, error: '', ok: '' });
        await api.post('complaints', { reason, targetPostId: Number(postId) });
        setReportState({ sending: false, error: '', ok: 'Complaint submitted!' });
        setReportOpened(false);
        setReportReason('');
      } catch (e) {
        const message = e?.response?.data?.message || 'Failed to submit complaint';
        setReportState({ sending: false, error: message, ok: '' });
      }
    };

    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'failed') return <div>{pageError || 'Failed to load task.'}</div>;
    if (!post) return <div>Task not found.</div>;

    return (
        <>
        <Header />
        <Modal opened={editOpened} onClose={() => setEditOpened(false)} title="Edit task" centered>
          <TextInput
            label="Task title"
            mt="sm"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            mt="sm"
            minRows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          {categoryOptions.length > 0 ? (
            <Select
              label="Subject"
              placeholder="Pick a subject"
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
              label="Subject"
              placeholder="e.g. Math / Programming / English"
              mt="sm"
              value={editCategory ?? ''}
              onChange={(e) => setEditCategory(e.target.value)}
            />
          )}
          <NumberInput
            label="Budget"
            mt="sm"
            min={0}
            allowNegative={false}
            thousandSeparator=","
            value={editBudget}
            onChange={setEditBudget}
          />
          <TextInput
            label="Contact"
            mt="sm"
            maxLength={35}
            value={editContact}
            onChange={(e) => setEditContact(e.target.value)}
          />
          {editState.error && <Text c="red" size="sm" mt="sm">{editState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditOpened(false)}>Cancel</Button>
            <Button color="violet" onClick={handleSaveEdit} loading={editState.saving}>
              Save
            </Button>
          </Group>
        </Modal>

        <Modal opened={acceptOpened} onClose={() => setAcceptOpened(false)} title="Accept offer" centered>
          <Text size="sm" c="dimmed">
            Choose deposit amount to hold for this task. This is a simplified “escrow” record in the DB.
          </Text>
          <NumberInput
            label="Deposit amount"
            mt="sm"
            min={0}
            allowNegative={false}
            thousandSeparator=","
            value={depositAmount}
            onChange={setDepositAmount}
          />
          {acceptState.error && <Text c="red" size="sm" mt="sm">{acceptState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setAcceptOpened(false)}>Cancel</Button>
            <Button color="violet" onClick={handleAcceptOffer} loading={acceptState.sending}>
              Accept
            </Button>
          </Group>
        </Modal>

        <Modal opened={reviewOpened} onClose={() => setReviewOpened(false)} title="Leave a review" centered>
          <NumberInput
            label="Rating (1–5)"
            mt="sm"
            min={1}
            max={5}
            value={reviewRating}
            onChange={setReviewRating}
          />
          <Textarea
            label="Comment (optional)"
            placeholder="What was good / what to improve"
            mt="sm"
            minRows={4}
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
          {reviewState.error && <Text c="red" size="sm" mt="sm">{reviewState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setReviewOpened(false)}>Cancel</Button>
            <Button color="violet" onClick={handleLeaveReview} loading={reviewState.sending}>
              Submit
            </Button>
          </Group>
        </Modal>

        <Modal opened={reportOpened} onClose={() => setReportOpened(false)} title="Report task" centered>
          <Textarea
            label="Reason"
            placeholder="Describe what happened"
            minRows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          {reportState.error && <Text c="red" size="sm" mt="sm">{reportState.error}</Text>}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setReportOpened(false)}>Cancel</Button>
            <Button color="violet" onClick={handleReportTask} loading={reportState.sending} disabled={!reportReason.trim()}>
              Submit
            </Button>
          </Group>
        </Modal>

        <Container size="md" className="taskPage">
          <Paper withBorder radius="lg" p="lg" className="taskCard">
            <Group align="flex-start" gap="xl" className="taskLayout">
              <Image
                src={post.avatar}
                alt="Task attachment"
                radius="md"
                className="taskImage"
                fallbackSrc="/task-placeholder.svg"
              />

              <div className="taskContent">
                <Group justify="space-between" align="flex-start" gap="md">
                  <div>
                    <Title order={2} className="taskTitle">{post.title}</Title>
                    <Text c="dimmed" size="sm" mt={4}>
                      Budget: <span className="taskBudget">{budgetLabel}</span>
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Posted by{' '}
                      {post.authorUsername ? (
                        <Link to={`/profiles/${post.authorUsername}`} className="inlineLink">
                          {post.authorUsername}
                        </Link>
                      ) : (
                        'unknown'
                      )}
                      {post.authorCity ? ` · ${post.authorCity}` : ''}
                    </Text>
                  </div>

                  <Group gap="xs">
                    {post.category && (
                      <Badge variant="light" color="violet">
                        {post.category}
                      </Badge>
                    )}
                    {post.status && (
                      <Badge variant="light" color="gray">
                        {String(post.status).replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </Group>
                </Group>

                <Group gap="sm" mt="md" wrap="wrap">
                  {post.executorUsername && (
                    <Badge variant="light" color="teal">
                      Executor:{' '}
                      <Link to={`/profiles/${post.executorUsername}`} className="inlineLink">
                        {post.executorUsername}
                      </Link>
                    </Badge>
                  )}
                  {post.depositStatus && (
                    <Badge variant="light" color="orange">
                      Deposit: {depositLabel} ({post.depositStatus})
                    </Badge>
                  )}
                  {isLoggedIn && (
                    <Button variant="default" color="gray" onClick={() => setReportOpened(true)}>
                      Report
                    </Button>
                  )}
                  {canManage && (
                    <>
                      <Button variant="light" color="violet" onClick={openEdit} disabled={!isAdmin && post.status !== 'OPEN'}>
                        Edit
                      </Button>
                      <Button variant="default" color="red" onClick={handleDeleteTask} disabled={!isAdmin && post.status !== 'OPEN'}>
                        Delete
                      </Button>
                    </>
                  )}
                </Group>

                <Group gap="sm" mt="sm" wrap="wrap">
                  {(isOwner || isExecutor || isAdmin) && post.status === 'IN_PROGRESS' && (
                    <Button variant="light" color="teal" onClick={() => handleSetStatus('DONE')}>
                      Mark as done
                    </Button>
                  )}
                  {(isOwner || isAdmin) && post.status !== 'DONE' && post.status !== 'CANCELLED' && (
                    <Button variant="default" color="gray" onClick={() => handleSetStatus('CANCELLED')}>
                      Cancel task
                    </Button>
                  )}
                </Group>

                <Text mt="md" className="taskDescription">
                  {post.content}
                </Text>

                <Paper withBorder radius="md" p="md" mt="lg" className="taskContact">
                  <Text size="sm" c="dimmed">Contact</Text>
                  <Group justify="space-between" align="center" mt={6}>
                    <Text fw={600}>{post.accountDetails}</Text>
                    <Button
                      variant="light"
                      color="violet"
                      onClick={handleCopyContact}
                      disabled={copyState === 'copying'}
                    >
                      {copyState === 'copied' ? 'Copied' : 'Copy'}
                    </Button>
                  </Group>
                </Paper>

                <Paper withBorder radius="md" p="md" mt="lg" className="offersSection">
                  <Group justify="space-between" align="center">
                    <Text fw={800}>Offers</Text>
                    <Text size="sm" c="dimmed">{offers.length} total</Text>
                  </Group>

                  {offers.length === 0 ? (
                    <Text c="dimmed" size="sm" mt="sm">
                      No offers yet. Be the first to respond.
                    </Text>
                  ) : (
                    <div className="offersList">
                      {offers.map((offer, idx) => {
                        const authorName =
                          [offer.firstName, offer.secondName].filter(Boolean).join(' ') || offer.username || 'Student';
                        const date = offer.createdAt ? new Date(offer.createdAt).toLocaleString() : '';
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
                                  Accept offer
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
                      <Link to="/signin">Sign in</Link> to send an offer.
                    </Text>
                  ) : isOwner ? (
                    <Text size="sm" c="dimmed" mt="md">
                      You can’t send offers to your own task.
                    </Text>
                  ) : post.status !== 'OPEN' ? (
                    <Text size="sm" c="dimmed" mt="md">
                      Offers are closed for this task.
                    </Text>
                  ) : (
                    <div className="offerForm">
                      <Textarea
                        label="Send an offer"
                        placeholder="Describe how you’ll solve it, ETA, and your price if different from budget."
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
                          Send offer
                        </Button>
                      </Group>
                    </div>
                  )}
                </Paper>

                {isLoggedIn && post.status === 'DONE' && (isOwner || isExecutor) && (
                  <Paper withBorder radius="md" p="md" mt="lg" className="offersSection">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={800}>Review</Text>
                        <Text size="sm" c="dimmed">
                          Leave a rating for the other side of this task.
                        </Text>
                      </div>
                      <Button color="violet" variant="light" onClick={() => setReviewOpened(true)}>
                        Leave review
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
