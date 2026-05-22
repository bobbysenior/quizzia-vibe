-- Permet à un utilisateur de lire les métadonnées d'un quiz auquel il a déjà
-- participé, même si le créateur l'a repassé en draft ou archivé. Sans ça,
-- l'historique des tentatives affiche "Quiz supprimé" alors que le quiz existe.

CREATE POLICY "quizzes_select_attempted" ON public.quizzes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.quiz_id = quizzes.id
              AND a.user_id = auth.uid()
        )
    );
