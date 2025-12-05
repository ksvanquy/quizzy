import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId?: number | null; // null = root category, number for parent displayOrder
  icon?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentId: {
      type: Number,
      default: null,
      index: true,
    },
    icon: {
      type: String,
      default: '📁',
    },
    description: String,
    displayOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for parent-child hierarchy
categorySchema.index({ parentId: 1, displayOrder: 1 });

export const Category = models.Category || model<ICategory>('Category', categorySchema);
