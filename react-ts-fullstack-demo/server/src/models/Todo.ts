import { Schema, model, type InferSchemaType } from 'mongoose';

const todoSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type TodoDoc = InferSchemaType<typeof todoSchema>;
export const Todo = model('Todo', todoSchema);