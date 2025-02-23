import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../lib/gemini';
import { Brain, Loader2, Target, CheckCircle2, XCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import '../style/TechnicalQuiz.css';

interface TechnicalQuizProps {
  formData: {
    careerPath: string;
    subjects: string;
    skills: string;
    educationLevel: string;
    stream: string;
    preferredStream: string;
    otherCareerPath: string;
  };
  onBack: () => void;
  onComplete: (score: number) => void;
}

const TechnicalQuiz: React.FC<TechnicalQuizProps> = ({ formData, onBack, onComplete }) => {
  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let mounted = true;

    const fetchQuestions = async () => {
      try {
        // Start progress animation
        progressInterval = setInterval(() => {
          if (mounted) {
            setLoadingProgress(prev => {
              if (prev >= 90) return prev;
              return prev + Math.random() * 15;
            });
          }
        }, 500);

        const quizQuestions = await generateQuiz(
          [formData.subjects, formData.skills],
          formData.careerPath,
          formData.otherCareerPath
        );

        if (mounted) {
          // Complete progress animation
          setLoadingProgress(100);
          setTimeout(() => {
            if (mounted) {
              if (quizQuestions.length === 0) {
                throw new Error('No questions generated');
              }
              setQuestions(quizQuestions);
              setLoading(false);
            }
          }, 500);
        }
      } catch (err) {
        console.error('Error generating quiz:', err);
        if (mounted) {
          setError('Unable to generate assessment questions. Please try again.');
          setLoading(false);
        }
      } finally {
        clearInterval(progressInterval);
      }
    };

    fetchQuestions();

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, []);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null || quizComplete) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
      onComplete((score / questions.length) * 100);
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-animation">
          <div className="loading-circle"></div>
          <Brain className="loading-brain" size={48} />
        </div>
        <div className="loading-progress">
          <div className="loading-bar">
            <div 
              className="loading-bar-fill" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="loading-text">
            Generating personalized questions
            <span className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <XCircle size={48} className="error-icon" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          <ArrowLeft size={20} />
          Try Again
        </button>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="quiz-complete">
        <h2>Assessment Complete!</h2>
        <div className="score-card">
          <div className="score-circle" style={{ 
            background: `conic-gradient(#48bb78 ${percentage}%, #1a365d ${percentage}%)`
          }}>
            <div className="score-inner">
              <Brain size={32} className="score-icon" />
              <span className="score-value">{percentage}%</span>
            </div>
          </div>
          <p className="score-label">Your Score</p>
          <div className="score-details">
            <div className="score-stat">
              <span>Correct Answers</span>
              <strong>{score} / {questions.length}</strong>
            </div>
            <div className="score-stat">
              <span>Accuracy</span>
              <strong>{percentage.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="back-button">
          <Target size={20} />
          View Career Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Technical Knowledge Assessment</h2>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="question-card">
        <p className="question">{questions[currentQuestion].question}</p>
        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`option ${
                selectedAnswer === option 
                  ? option === questions[currentQuestion].correctAnswer 
                    ? 'correct' 
                    : 'incorrect'
                  : ''
              } ${selectedAnswer !== null ? 'disabled' : ''}`}
              disabled={selectedAnswer !== null}
            >
              <span className="option-text">{option}</span>
              {selectedAnswer === option && (
                option === questions[currentQuestion].correctAnswer 
                  ? <CheckCircle2 className="option-icon correct" size={20} />
                  : <XCircle className="option-icon incorrect" size={20} />
              )}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="explanation">
            <h3>Explanation</h3>
            <p>{questions[currentQuestion].explanation}</p>
          </div>
        )}

        {selectedAnswer !== null && (
          <button onClick={handleNext} className="next-button">
            {currentQuestion < questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight size={20} />
              </>
            ) : (
              <>
                Complete Assessment
                <CheckCircle2 size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TechnicalQuiz;