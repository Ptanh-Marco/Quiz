import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from '../../config/firebaseConfig';
import { ref, onValue, set, remove, get, update } from "firebase/database";
import Confetti from "react-confetti";
import "./AdminPanel.scss";

import ParticipantList from './ParticipantList';
import LiveQuestionView from './LiveQuestionView';
import Leaderboard from './Leaderboard';

const QUESTION_TIME_LIMIT = 10;

export default function AdminPanel() {
    // --- STATE ---
    const [participants, setParticipants] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [quizState, setQuizState] = useState({
        started: false,
        finished: false,
        currentQuestionIndex: 0,
        timer: QUESTION_TIME_LIMIT
    });
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const isProcessingRef = useRef(false);
    const quizStateRef = useRef(quizState);

    useEffect(() => { quizStateRef.current = quizState; }, [quizState]);

    useEffect(() => {
        const participantsRef = ref(db, "participants");
        const questionsRef = ref(db, "questions");
        const quizStateDbRef = ref(db, "quizState");
        const scoresRef = ref(db, "scores");

        const unsubParticipants = onValue(participantsRef, snap =>
            setParticipants(Object.values(snap.val() || {}))
        );
        const unsubQuestions = onValue(questionsRef, snap => {
            const qObj = snap.val();
            // Convert object to array with id property
            setQuestions(qObj
                ? Object.entries(qObj).map(([id, q]) => ({ ...q, id }))
                : []
            );
        });
        const unsubQuizState = onValue(quizStateDbRef, snap => {
            setQuizState(
                snap.val() || {
                    started: false,
                    finished: false,
                    currentQuestionIndex: 0,
                    timer: QUESTION_TIME_LIMIT
                }
            );
        });
        const unsubScores = onValue(scoresRef, async scoresSnap => {
            const scores = scoresSnap.val() || {};
            const participantsSnap = await get(participantsRef);
            const participantsObj = participantsSnap.val() || {};
            const board = Object.keys(scores)
                .map(pid => ({
                    name: participantsObj[pid]?.name || "Unknown",
                    points: Object.values(scores[pid]?.perQuestion || {}).reduce(
                        (a, b) => a + b, 0
                    ),
                    pid
                }))
                .sort((a, b) => b.points - a.points);
            setLeaderboard(board);
        });

        return () => {
            unsubParticipants();
            unsubQuestions();
            unsubQuizState();
            unsubScores();
        };
    }, []);

    // SCORING & QUESTION SEQUENCING LOGIC
    const handleEndOfQuestion = useCallback(async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const questionIndexToProcess = quizStateRef.current.currentQuestionIndex;
        const q = questions[questionIndexToProcess];
        const qid = q?.id;

        try {
            if (q && qid) {
                const allAnswersSnap = await get(ref(db, `quizState/answers`));
                const allAnswers = allAnswersSnap.val() || {};
                const participantsSnap = await get(ref(db, "participants"));
                const participantsObj = participantsSnap.val() || {};

                const correctParticipants = Object.keys(participantsObj)
                    .map(pid => {
                        const ansObj = allAnswers[pid]?.[qid] || {};
                        let isCorrect;
                        if (Array.isArray(q.correct)) {
                            isCorrect = q.correct.some(
                                ans =>
                                    ans.trim().toLowerCase() ===
                                    (ansObj.answer || "").trim().toLowerCase()
                            );
                        } else {
                            isCorrect =
                                (ansObj.answer || "").trim().toLowerCase() ===
                                (q.correct || "").trim().toLowerCase();
                        }
                        return isCorrect
                            ? {
                                pid,
                                timeToAnswer: ansObj.timeToAnswer ?? QUESTION_TIME_LIMIT
                            }
                            : null;
                    })
                    .filter(Boolean);

                correctParticipants.sort(
                    (a, b) => a.timeToAnswer - b.timeToAnswer
                );

                const N = correctParticipants.length;
                const S = N > 0 ? (N * (N + 1)) / 2 : 1;
                const updates = {};
                correctParticipants.forEach((p, i) => {
                    updates[`scores/${p.pid}/perQuestion/${questionIndexToProcess}`] =
                        Math.round((1000 * (N - i)) / S);
                });

                if (Object.keys(updates).length > 0) await update(ref(db), updates);
            }

            const nextIndex = questionIndexToProcess + 1;
            if (nextIndex < questions.length) {
                set(ref(db, "quizState"), {
                    ...quizStateRef.current,
                    currentQuestionIndex: nextIndex,
                    timer: QUESTION_TIME_LIMIT
                });
            } else {
                set(ref(db, "quizState/finished"), true);
            }
        } catch (error) {
            console.error("Error processing end of question:", error);
        } finally {
            isProcessingRef.current = false;
        }
    }, [questions]);

    // THE MASTER CLOCK
    useEffect(() => {
        if (!quizState.started || quizState.finished) return;
        if (quizState.timer <= 0) {
            handleEndOfQuestion();
            return;
        }
        const timerId = setInterval(() => {
            const newTime = quizStateRef.current.timer - 1;
            set(ref(db, "quizState/timer"), newTime);
        }, 1000);
        return () => clearInterval(timerId);
    }, [quizState.started, quizState.finished, quizState.timer, handleEndOfQuestion]);

    // ENHANCED START QUIZ
    const startQuiz = async () => {
        if (questions.length === 0) {
            alert("Cannot start quiz with no questions.");
            return;
        }

        const quizStartTime = Date.now();
        const initialQuizState = {
            started: true,
            finished: false,
            currentQuestionIndex: 0,
            timer: QUESTION_TIME_LIMIT,
            startTime: quizStartTime,
        };

        await Promise.all([
            set(ref(db, "quizState"), initialQuizState),
            remove(ref(db, "scores")),
            remove(ref(db, "quizState/answers"))
        ]);

        // Remove any participants who joined at or after quizStartTime
        const participantsRef = ref(db, "participants");
        const participantsSnap = await get(participantsRef);
        const participantsObj = participantsSnap.val() || {};
        const notWaitingPids = Object.keys(participantsObj).filter(
            pid => !participantsObj[pid].joined || participantsObj[pid].joined >= quizStartTime
        );
        for (const pid of notWaitingPids) {
            await remove(ref(db, `participants/${pid}`));
        }
    };

    // RESET QUIZ
    const resetQuiz = async () => {
        if (
            window.confirm(
                "Are you sure you want to fully reset the quiz? This will remove ALL participants and clear all progress."
            )
        ) {
            try {
                const initialQuizState = {
                    started: false,
                    finished: false,
                    currentQuestionIndex: 0,
                    timer: QUESTION_TIME_LIMIT
                };

                await Promise.all([
                    set(ref(db, "quizState"), initialQuizState),
                    remove(ref(db, "participants")),
                    remove(ref(db, "scores")),
                    remove(ref(db, "quizState/answers"))
                ]);

                console.log("Quiz and participants have been reset successfully.");
            } catch (error) {
                console.error("Failed to reset quiz:", error);
                alert(
                    "An error occurred while resetting the quiz. Please check the console for details."
                );
            }
        }
    };

    const currentQuestion = questions[quizState.currentQuestionIndex];

    useEffect(() => {
        const handleResize = () =>
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="admin-panel-root">
            {quizState.finished && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}
            <header className="admin-header">
                <h1>👑 Admin Panel</h1>
                <div className="admin-header-btns">
                    {!quizState.started && (
                        <button className="admin-btn" onClick={startQuiz}>
                            Start Quiz
                        </button>
                    )}
                    <button className="admin-btn reset" onClick={resetQuiz}>
                        Reset Quiz
                    </button>
                </div>
            </header>
            {!quizState.started && (
                <ParticipantList participants={participants} />
            )}
            {quizState.started && !quizState.finished && currentQuestion && (
                <LiveQuestionView
                    question={currentQuestion}
                    timer={quizState.timer}
                    currentQuestionIndex={quizState.currentQuestionIndex}
                    totalQuestions={questions.length}
                />
            )}
            <Leaderboard
                leaderboard={leaderboard}
                finished={quizState.finished}
            />
        </div>
    );
}