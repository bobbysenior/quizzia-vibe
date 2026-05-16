export type QuizStatus = 'draft' | 'published' | 'archived';

export interface Quiz {
  id: string;
  creator_id: string;
  title: string;
  theme: string;
  question_count: number;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
}

export interface QuizWithCount extends Quiz {
  actual_question_count: number;
}
