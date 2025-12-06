const LiveQuestionView = ({
    question,
    timer,
    currentQuestionIndex,
    totalQuestions,
    answers = [],
    participants = []
}) => {
    if (!question) return null;

    // Defensive: avoid NaN
    const safeIndex = typeof currentQuestionIndex === "number" && !isNaN(currentQuestionIndex)
        ? currentQuestionIndex + 1
        : "?";
    return (
        <section className="admin-card admin-quiz-section">
            <div className="quiz-header">
                <strong>Question {currentQuestionIndex + 1} / {totalQuestions}</strong>
                <div className="timer">{timer}s</div>
            </div>
            <div className="quiz-question-area">
                {question.image && <img className="current-q-img" src={question.image} alt="Question visual" />}
                <div className="quiz-q-text"><strong>{question.question}</strong></div>
            </div>

            {/* --- THIS IS THE CORRECTED SECTION --- */}
            {/* It now correctly handles rendering for each different question type. */}
            <div className="admin-options-container">

                {/* Case 1: The question is a standard multiple choice */}
                {question.type === "single_choice" && (question?.options ?? []).map((opt) => (
                    <div key={opt} className="admin-option-btn">
                        {opt}
                    </div>
                ))}

                {/* Case 2: The question is a fill-in-the-blank */}
                {question.type === "fill_text" && (
                    <div className="admin-fill-text-display">
                        <input type="text" placeholder="Participants will type their answer here..." disabled />
                    </div>
                )}

                {/* Case 3: The question uses images as choices */}
                {/* This correctly accesses the `opt.image` and `opt.label` properties instead of rendering the object */}
                {question.type === "image_choice" && (question?.options ?? []).map((opt) => (
                    <div key={opt.label} className="admin-option-image-btn">
                        <img src={opt.image} alt={opt.label} className="admin-option-image" />
                        <span className="admin-option-label">{opt.label}</span>
                    </div>
                ))}

            </div>
        </section>
    );
};

export default LiveQuestionView;