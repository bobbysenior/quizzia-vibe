-- Autoriser les utilisateurs anonymes à jouer aux quiz publiés.
-- Une tentative avec user_id NULL appartient à toute session anonyme :
-- la connaissance de l'UUID de la tentative tient lieu de jeton.

-- quiz_attempts : SELECT autorisé si propriétaire OU tentative anonyme
DROP POLICY IF EXISTS "attempts_select_own" ON public.quiz_attempts;
CREATE POLICY "attempts_select_own_or_anon" ON public.quiz_attempts
    FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

-- quiz_attempts : UPDATE autorisé si propriétaire OU tentative anonyme
DROP POLICY IF EXISTS "attempts_update_own" ON public.quiz_attempts;
CREATE POLICY "attempts_update_own_or_anon" ON public.quiz_attempts
    FOR UPDATE
    USING (user_id IS NULL OR auth.uid() = user_id)
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- user_answers : SELECT autorisé si tentative parent appartient au user OU anonyme
DROP POLICY IF EXISTS "answers_select_own" ON public.user_answers;
CREATE POLICY "answers_select_own_or_anon" ON public.user_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = user_answers.attempt_id
              AND (a.user_id IS NULL OR a.user_id = auth.uid())
        )
    );
