import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Todo } from '../models/Todo.js';

class TodoInputError extends Error {}

const router = Router();
router.use(requireAuth);

router.get('/', async (request, response) => {
  const todos = await Todo.find({ userId: request.userId }).sort({ createdAt: -1 });
  response.json(todos);
});

router.get('/summary', async (request, response) => {
  const userId = request.userId;
  const [total, completed, pending] = await Promise.all([
    Todo.countDocuments({ userId }),
    Todo.countDocuments({ userId, done: true }),
    Todo.countDocuments({ userId, done: false }),
  ]);
  response.json({ total, completed, pending });
});

router.post('/', async (request, response) => {
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
  if (!text) {
    response.status(400).json({ message: 'text is required' });
    return;
  }
  const todo = await Todo.create({ text, userId: request.userId });
  response.status(201).json(todo);
});

router.post('/bulk', async (request, response) => {
  const items: unknown[] = Array.isArray(request.body?.todos) ? request.body.todos : [];
  if (items.length === 0 || items.length > 100) {
    response.status(400).json({ message: 'todos must contain between 1 and 100 items' });
    return;
  }

  const outcomes = await Promise.allSettled(items.map(async (item) => {
    const text = typeof item === 'object' && item !== null && 'text' in item && typeof item.text === 'string'
      ? item.text.trim()
      : '';
    if (!text) throw new TodoInputError('text is required');
    if (text.length > 200) throw new TodoInputError('text must be 200 characters or fewer');
    return Todo.create({ text, userId: request.userId });
  }));

  const results = outcomes.map((outcome, index) => {
    if (outcome.status === 'fulfilled') {
      return { index, status: outcome.status, todo: outcome.value };
    }
    const message = outcome.reason instanceof TodoInputError ? outcome.reason.message : 'Unable to create todo';
    return { index, status: outcome.status, message };
  });
  const createdCount = outcomes.filter((outcome) => outcome.status === 'fulfilled').length;
  response.status(createdCount === items.length ? 201 : 207).json({ results });
});

router.patch('/:id', async (request, response) => {
  const { id } = request.params;
  if (!isValidObjectId(id)) {
    response.status(400).json({ message: 'invalid id' });
    return;
  }
  const update: { text?: string; done?: boolean } = {};
  if (typeof request.body?.text === 'string') update.text = request.body.text.trim();
  if (typeof request.body?.done === 'boolean') update.done = request.body.done;

  const todo = await Todo.findOneAndUpdate({ _id: id, userId: request.userId }, update, { new: true, runValidators: true });
  if (!todo) {
    response.status(404).json({ message: 'todo not found' });
    return;
  }
  response.json(todo);
});

router.delete('/:id', async (request, response) => {
  const { id } = request.params;
  if (!isValidObjectId(id)) {
    response.status(400).json({ message: 'invalid id' });
    return;
  }
  const todo = await Todo.findOneAndDelete({ _id: id, userId: request.userId });
  if (!todo) {
    response.status(404).json({ message: 'todo not found' });
    return;
  }
  response.status(204).end();
});

export default router;