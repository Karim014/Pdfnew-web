
import { Tool } from './types';

export const TOOLS: Tool[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF documents into a single file in seconds.',
    icon: 'call_merge',
    category: 'Organize',
    path: '/tools/merge'
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate pages easily into individual files.',
    icon: 'call_split',
    category: 'Organize',
    path: '/tools/split'
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining the best quality.',
    icon: 'compress',
    category: 'Optimize',
    path: '/tools/compress'
  },
  {
    id: 'ocr',
    name: 'OCR Scanner',
    description: 'Extract text from images and scanned documents instantly.',
    icon: 'document_scanner',
    category: 'AI Tools',
    path: '/tools/ocr',
    isPro: true
  },
  {
    id: 'summarizer',
    name: 'AI Summarizer',
    description: 'Condense lengthy lectures into key bullet points.',
    icon: 'auto_awesome',
    category: 'AI Tools',
    path: '/ai-studio',
    isPro: true
  }
];

export const APP_NAME = "StudyFlow";
