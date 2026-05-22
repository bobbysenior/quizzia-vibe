-- Quand un quiz est supprimé, les tentatives liées doivent aussi disparaître.
-- Sans cascade, le DELETE échouait avec une violation de FK dès qu'un quiz
-- avait été joué au moins une fois.

ALTER TABLE public.quiz_attempts
    DROP CONSTRAINT quiz_attempts_quiz_id_fkey;

ALTER TABLE public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
