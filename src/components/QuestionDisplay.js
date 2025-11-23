import React, { useState, useEffect } from 'react';

// A mock API function to simulate network delay
const fetchQuestionById = (id, signal) => {
    // Simulate a random network delay between 200ms and 1.5s
    const delay = Math.random() * 1300 + 200;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if the request was aborted while waiting
            if (signal.aborted) {
                return reject(new DOMException('Aborted', 'AbortError'));
            }

            const questions = {
                1: { id: 1, text: "What is the capital of Japan?" },
                2: { id: 2, text: "Which planet is known as the Red Planet?" },
                3: { id: 3, text: "What is the largest mammal in the world?" },
            };
            resolve(questions[id]);
        }, delay);
    });
};


// --- THIS IS THE COMPONENT WITH THE BEST-PRACTICE SOLUTION ---
const QuestionDisplay = ({ questionId }) => {
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Create a new AbortController for this specific effect run.
        const controller = new AbortController();

        const getQuestion = async () => {
            try {
                setLoading(true);
                setError(null);

                // 2. Pass the controller's signal to the fetch function.
                const questionData = await fetchQuestionById(questionId, controller.signal);

                // The data is fetched successfully. We can now update the state.
                setQuestion(questionData);

            } catch (err) {
                // 3. If the fetch was aborted, the error name will be 'AbortError'.
                // We check for this and simply ignore it, because it's an expected cancellation.
                if (err.name === 'AbortError') {
                    console.log(`Fetch for question ${questionId} was aborted.`);
                } else {
                    // It's a real network or API error.
                    setError('Failed to fetch the question.');
                    console.error(err);
                }
            } finally {
                // This runs regardless of success or failure.
                // We only stop loading if the component hasn't been unmounted/re-rendered.
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        getQuestion();

        // 4. THE CLEANUP FUNCTION: This is the most important part.
        // React will call this function when the component unmounts OR
        // when the `questionId` dependency changes, just before running the effect again.
        return () => {
            console.log(`Cleaning up effect for question ${questionId}. Aborting fetch.`);
            controller.abort();
        };

    }, [questionId]); // The dependency array: re-run the effect when `questionId` changes.

    if (loading) {
        return <div className="question-container loading">Loading question...</div>;
    }

    if (error) {
        return <div className="question-container error">{error}</div>;
    }

    return (
        <div className="question-container">
            <h2>Question #{question?.id}</h2>
            <p>{question?.text}</p>
        </div>
    );
};

export default QuestionDisplay;