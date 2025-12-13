import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICategorySchema extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: Types.ObjectId | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategorySchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
);

// Indexes for performance
categorySchema.index({ parentId: 1, isActive: 1 });
categorySchema.index({ slug: 1, isActive: 1 });

// Middleware to prevent circular references
categorySchema.pre('save', async function (next) {
  if (!this.parentId) {
    return next();
  }

  // Check for circular reference
  let currentId = this.parentId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId.toString())) {
      throw new Error('Circular reference detected in category hierarchy');
    }

    if (currentId.toString() === this._id?.toString()) {
      throw new Error('Category cannot be its own parent');
    }

    visited.add(currentId.toString());

    const parent = await CategoryModel.findById(currentId).lean();
    if (!parent) {
      throw new Error('Parent category not found');
    }

    currentId = parent.parentId;
  }

  next();
});

export const CategoryModel = models.Category || model<ICategorySchema>('Category', categorySchema);
export { categorySchema };
