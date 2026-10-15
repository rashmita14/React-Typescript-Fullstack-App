import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { Todo } from '../models/Todo.js';

const router = Router();

router.get('/', async (_request, response) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  response.json(todos);
});

router.post('/', async (request, response) => {
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
  if (!text) {
    response.status(400).json({ message: 'text is required' });
    return;
  }
  const todo = await Todo.create({ text });
  response.status(201).json(todo);
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

  const todo = await Todo.findByIdAndUpdate(id, update, { new: true, runValidators: true });
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
  const todo = await Todo.findByIdAndDelete(id);
  if (!todo) {
    response.status(404).json({ message: 'todo not found' });
    return;
  }
  response.status(204).end();
});

export default router;