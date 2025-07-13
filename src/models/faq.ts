import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isActive: boolean;
  priority: number;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
}

const FAQSchema: Schema = new Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'account',
      'orders',
      'shipping',
      'payments',
      'returns',
      'vendor',
      'technical',
      'general'
    ],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  notHelpful: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better search performance
FAQSchema.index({ question: 'text', answer: 'text', tags: 'text' });
FAQSchema.index({ category: 1, isActive: 1 });
FAQSchema.index({ priority: -1, views: -1 });
FAQSchema.index({ createdAt: -1 });

// Virtual for helpfulness score
FAQSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpful + this.notHelpful;
  return total > 0 ? (this.helpful / total) * 100 : 0;
});

export const FAQ = mongoose.models?.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);
