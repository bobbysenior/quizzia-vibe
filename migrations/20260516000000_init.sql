-- ============================================================
-- Migration: Schema initial — App Quizz
-- Description: Crée les tables, index, RLS et triggers
-- ============================================================

-- 1. TABLES
-- ============================================================

-- 1.1 quizzes
CREATE TABLE public.quizzes (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id    uuid NOT NULL,
    title         text NOT NULL,
    theme         text NOT NULL,
    question_count integer NOT NULL CHECK (question_count BETWEEN 5 AND 30),
    status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 1.2 questions
CREATE TABLE public.questions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    order_index   integer NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- 1.3 choices
CREATE TABLE public.choices (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id   uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    choice_text   text NOT NULL,
    is_correct    boolean NOT NULL DEFAULT false,
    order_index   integer NOT NULL DEFAULT 0
);

-- 1.4 quiz_attempts
CREATE TABLE public.quiz_attempts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid,
    quiz_id         uuid NOT NULL REFERENCES public.quizzes(id),
    status          text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    score           integer,
    total_questions integer NOT NULL,
    started_at      timestamptz NOT NULL DEFAULT now(),
    completed_at    timestamptz
);

-- 1.5 user_answers
CREATE TABLE public.user_answers (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id         uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id        uuid NOT NULL REFERENCES public.questions(id),
    selected_choice_id uuid NOT NULL REFERENCES public.choices(id),
    is_correct         boolean NOT NULL,
    answered_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_answers_attempt_question UNIQUE (attempt_id, question_id)
);

-- 2. INDEXES
-- ============================================================

-- quizzes
CREATE INDEX idx_quizzes_creator_id ON public.quizzes(creator_id);
CREATE INDEX idx_quizzes_status ON public.quizzes(status) WHERE status = 'published';

-- questions
CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);

-- choices
CREATE INDEX idx_choices_question_id ON public.choices(question_id);

-- quiz_attempts
CREATE INDEX idx_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- user_answers
CREATE INDEX idx_user_answers_attempt_id ON public.user_answers(attempt_id);

-- 3. TRIGGERS & FONCTIONS
-- ============================================================

-- 3.1 Mise à jour automatique de updated_at sur quizzes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 3.2 Une seule réponse correcte par question
CREATE OR REPLACE FUNCTION public.check_single_correct_choice()
RETURNS trigger AS $$
DECLARE
    correct_count integer;
BEGIN
    SELECT COUNT(*) INTO correct_count
    FROM public.choices
    WHERE question_id = NEW.question_id AND is_correct = true;

    IF NEW.is_correct AND correct_count > 0 THEN
        RAISE EXCEPTION 'Une seule réponse correcte est autorisée par question (question_id=%)', NEW.question_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_choices_single_correct
    BEFORE INSERT OR UPDATE ON public.choices
    FOR EACH ROW
    WHEN (NEW.is_correct = true)
    EXECUTE FUNCTION public.check_single_correct_choice();

-- 4. ROW LEVEL SECURITY
-- ============================================================

-- 4.1 quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les quizz publiés
CREATE POLICY "quizzes_select_published" ON public.quizzes
    FOR SELECT
    USING (status = 'published');

-- Le créateur peut voir tous ses quizz (quel que soit le statut)
CREATE POLICY "quizzes_select_own" ON public.quizzes
    FOR SELECT
    USING (auth.uid() = creator_id);

-- Utilisateur authentifié peut créer un quizz
CREATE POLICY "quizzes_insert_auth" ON public.quizzes
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Le créateur peut modifier son quizz
CREATE POLICY "quizzes_update_own" ON public.quizzes
    FOR UPDATE
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Le créateur peut supprimer son quizz
CREATE POLICY "quizzes_delete_own" ON public.quizzes
    FOR DELETE
    USING (auth.uid() = creator_id);

-- 4.2 questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Même visibilité que le quizz parent (publié ou créateur)
CREATE POLICY "questions_select_public_or_creator" ON public.questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
              AND (q.status = 'published' OR q.creator_id = auth.uid())
        )
    );

-- Créateur du quizz parent uniquement
CREATE POLICY "questions_insert_creator" ON public.questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
              AND q.creator_id = auth.uid()
        )
    );

CREATE POLICY "questions_update_creator" ON public.questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
              AND q.creator_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
              AND q.creator_id = auth.uid()
        )
    );

CREATE POLICY "questions_delete_creator" ON public.questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = questions.quiz_id
              AND q.creator_id = auth.uid()
        )
    );

-- 4.3 choices
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;

-- Même visibilité que le quizz parent
-- Note: le masquage de is_correct pour les non-créateurs pendant une tentative
--       est géré au niveau applicatif
CREATE POLICY "choices_select_public_or_creator" ON public.choices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.questions qu
            JOIN public.quizzes q ON q.id = qu.quiz_id
            WHERE qu.id = choices.question_id
              AND (q.status = 'published' OR q.creator_id = auth.uid())
        )
    );

CREATE POLICY "choices_insert_creator" ON public.choices
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions qu
            JOIN public.quizzes q ON q.id = qu.quiz_id
            WHERE qu.id = choices.question_id
              AND q.creator_id = auth.uid()
        )
    );

CREATE POLICY "choices_update_creator" ON public.choices
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.questions qu
            JOIN public.quizzes q ON q.id = qu.quiz_id
            WHERE qu.id = choices.question_id
              AND q.creator_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.questions qu
            JOIN public.quizzes q ON q.id = qu.quiz_id
            WHERE qu.id = choices.question_id
              AND q.creator_id = auth.uid()
        )
    );

CREATE POLICY "choices_delete_creator" ON public.choices
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.questions qu
            JOIN public.quizzes q ON q.id = qu.quiz_id
            WHERE qu.id = choices.question_id
              AND q.creator_id = auth.uid()
        )
    );

-- 4.4 quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Propriétaire de la tentative (connecté) peut voir ses tentatives
CREATE POLICY "attempts_select_own" ON public.quiz_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Tout le monde (y compris anonyme) peut créer une tentative sur un quizz publié
CREATE POLICY "attempts_insert_on_published" ON public.quiz_attempts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id
              AND q.status = 'published'
        )
    );

-- Propriétaire peut mettre à jour sa tentative (ex: score final)
CREATE POLICY "attempts_update_own" ON public.quiz_attempts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4.5 user_answers
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Propriétaire de la tentative parent peut voir ses réponses
CREATE POLICY "answers_select_own" ON public.user_answers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = user_answers.attempt_id
              AND a.user_id = auth.uid()
        )
    );

-- Propriétaire de la tentative parent peut insérer des réponses
-- (ou anonyme pendant la tentative, quand user_id est NULL)
CREATE POLICY "answers_insert_own_or_anon" ON public.user_answers
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = user_answers.attempt_id
              AND (a.user_id = auth.uid() OR a.user_id IS NULL)
        )
    );

-- Pas d'UPDATE ni DELETE : réponse figée une fois donnée (pas de politique = refusé)
