import { EditQuizClient } from './edit-quiz-client';

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditQuizClient quizId={id} />;
}
