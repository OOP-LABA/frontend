import Header from './Header';
import { Badge, Button, Card, Grid, Group, Image, NumberInput, Paper, Select, Text, TextInput } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import api from '../axios.js';
export default function Posts(){
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 250);
    const [subject, setSubject] = useState(null);
    const [minBudget, setMinBudget] = useState(null);
    const [maxBudget, setMaxBudget] = useState(null);
    const [sort, setSort] = useState('newest');

    const formatBudget = (value) => {
      const budget = Number(value) || 0;
      return budget.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    useEffect(() => {
      let mounted = true;

      const fetchData = async () => {
        try {
          setLoading(true);

          const params = { sort };
          if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
          if (subject) params.category = subject;
          if (typeof minBudget === 'number') params.minGoal = minBudget;
          if (typeof maxBudget === 'number') params.maxGoal = maxBudget;

          const response = await api.get('posts', { params });
          if (!mounted) return;
          setPosts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching posts:', error);
          if (!mounted) return;
          setPosts([]);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchData();
      return () => {
        mounted = false;
      };
    }, [debouncedSearch, maxBudget, minBudget, sort, subject]);

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

    const categoryOptions = useMemo(() => {
      const fromApi = categories.map((c) => c.name).filter(Boolean);
      const unique = Array.from(new Set(fromApi));
      unique.sort((a, b) => String(a).localeCompare(String(b)));
      return unique.map((name) => ({ value: name, label: name }));
    }, [categories]);

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

    return (
        <>
          <Header />
          <div className='main-posts'>
            <Paper withBorder radius="lg" p="md" className="postsToolbar">
              <Group gap="sm" align="flex-end" wrap="wrap">
                <TextInput
                  label="Search"
                  placeholder="Title or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="postsSearch"
                />

                <Select
                  label="Subject"
                  placeholder="All"
                  data={categoryOptions}
                  searchable
                  clearable
                  value={subject}
                  onChange={setSubject}
                  comboboxProps={{ withinPortal: false }}
                />

                <NumberInput
                  label="Min budget"
                  placeholder="0"
                  min={0}
                  allowNegative={false}
                  thousandSeparator=","
                  value={minBudget}
                  onChange={setMinBudget}
                />

                <NumberInput
                  label="Max budget"
                  placeholder="Any"
                  min={0}
                  allowNegative={false}
                  thousandSeparator=","
                  value={maxBudget}
                  onChange={setMaxBudget}
                />

                <Select
                  label="Sort"
                  data={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'budget_desc', label: 'Budget: high to low' },
                    { value: 'budget_asc', label: 'Budget: low to high' },
                  ]}
                  value={sort}
                  onChange={(v) => setSort(v || 'newest')}
                  comboboxProps={{ withinPortal: false }}
                />
              </Group>
            </Paper>

            {loading ? (
              <Text c="dimmed" mt="md">Loading tasks…</Text>
            ) : posts.length === 0 ? (
              <Text c="dimmed" mt="md">No tasks match your filters.</Text>
            ) : (
              <Grid justify="space-around" align="flex-start" mt="md">
                {posts.map(post => (
                  <Grid.Col key={post.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Card.Section>
                        <Image
                          src={post.avatar}
                          height={160}
                          alt="Task attachment"
                          fallbackSrc="/task-placeholder.svg"
                        />
                      </Card.Section>

                      <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={600}>{post.title}</Text>
                        <Group gap={6}>
                          {post.category && (
                            <Badge variant="light" color="violet">
                              {post.category}
                            </Badge>
                          )}
                          {post.status && (
                            <Badge variant="light" color={statusColor(post.status)}>
                              {String(post.status).replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {post.content}
                      </Text>
                      <Group justify="space-between" mt="md">
                        <Text size="sm" c="dimmed">Budget</Text>
                        <Text fw={700}>{formatBudget(post.goal)}</Text>
                      </Group>
                      <Link to={`/posts/${post.id}`}>
                        <Button color="violet" fullWidth mt="md" radius="md">
                          Open task
                        </Button>
                      </Link>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </div>
        </>
    )
}
