// src/components/AdminPanel/ResultsView.jsx
import React from 'react';

const ResultsView = ({ question }) => {
    // This component simply displays the question and highlights the correct answer.
    return (
        <section className="admin-card admin-results-section">
            <div className="results-header">Revealing Correct Answer...</div>
            <div className="quiz-question-area">
                <div className="quiz-q-text"><strong>{question.question}</strong></div>
            </div>
            <div className="admin-options-container results">
                {(question?.options ?? []).map(option => {
                    const isCorrect = Array.isArray(question.correct)
                        ? question.correct.includes(option)
                        : question.correct === option;
                    const optionClass = isCorrect ? 'correct' : 'incorrect';
                    return (
                        <div key={option} className={`admin-option-btn ${optionClass}`}>{option}</div>
                    );
                })}
            </div>
        </section>
    );
};
export default ResultsView;