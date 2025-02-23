import React, { useState } from 'react';
import TechnicalQuiz from './TechnicalQuiz';
import CareerConsultation from './CareerConsultation';
import '../style/FormSummary.css';

interface FormSummaryProps {
  data: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    email: string;
    cityState: string;
    preferredLanguage: string;
    educationLevel: string;
    instituteName: string;
    board: string;
    stream: string;
    preferredStream: string;
    percentage: string;
    subjects: string;
    extracurricular: string;
    careerPath: string;
    otherCareerPath: string;
    shortTermGoals: string;
    longTermGoals: string;
    competitiveExams: string;
    otherExam: string;
    higherEducation: string;
    collegesOfInterest: string;
    skills: string;
    familyIncome: string;
  };
  onBack: () => void;
}

const FormSummary: React.FC<FormSummaryProps> = ({ data, onBack }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (showConsultation) {
    return (
      <CareerConsultation
        formData={data}
        quizScore={quizScore}
        onBack={() => setShowConsultation(false)}
      />
    );
  }

  if (showQuiz) {
    return (
      <TechnicalQuiz 
        formData={data}
        onBack={() => setShowQuiz(false)}
        onComplete={(score) => {
          setQuizScore(score);
          setShowQuiz(false);
          setShowConsultation(true);
        }}
      />
    );
  }

  return (
    <div className="form-summary">
      <h2>Student Information Summary</h2>
      
      <div className="summary-section">
        <h3>Personal Information</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Full Name:</span>
            <span className="value">{data.fullName}</span>
          </div>
          <div className="summary-item">
            <span className="label">Date of Birth:</span>
            <span className="value">{data.dateOfBirth}</span>
          </div>
          <div className="summary-item">
            <span className="label">Gender:</span>
            <span className="value">{data.gender}</span>
          </div>
          <div className="summary-item">
            <span className="label">Contact Number:</span>
            <span className="value">{data.contactNumber}</span>
          </div>
          <div className="summary-item">
            <span className="label">Email:</span>
            <span className="value">{data.email}</span>
          </div>
          <div className="summary-item">
            <span className="label">City & State:</span>
            <span className="value">{data.cityState}</span>
          </div>
          <div className="summary-item">
            <span className="label">Preferred Language:</span>
            <span className="value">{data.preferredLanguage}</span>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3>Educational Background</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Education Level:</span>
            <span className="value">{data.educationLevel}</span>
          </div>
          <div className="summary-item">
            <span className="label">Institution:</span>
            <span className="value">{data.instituteName}</span>
          </div>
          <div className="summary-item">
            <span className="label">Board:</span>
            <span className="value">{data.board}</span>
          </div>
          <div className="summary-item">
            <span className="label">{data.educationLevel === '10th' ? 'Preferred Stream:' : 'Stream:'}</span>
            <span className="value">{data.educationLevel === '10th' ? data.preferredStream : data.stream}</span>
          </div>
          <div className="summary-item">
            <span className="label">Percentage/CGPA:</span>
            <span className="value">{data.percentage}%</span>
          </div>
        </div>
        <div className="summary-text">
          <span className="label">Subjects of Interest:</span>
          <p className="value">{data.subjects}</p>
        </div>
        <div className="summary-text">
          <span className="label">Extracurricular Activities:</span>
          <p className="value">{data.extracurricular}</p>
        </div>
      </div>

      <div className="summary-section">
        <h3>Career Interests & Aspirations</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Career Path:</span>
            <span className="value">
              {data.careerPath === 'Other' ? data.otherCareerPath : data.careerPath}
            </span>
          </div>
          {data.educationLevel !== '10th' && (
            <div className="summary-item">
              <span className="label">Competitive Exams:</span>
              <span className="value">
                {data.competitiveExams === 'Other' ? data.otherExam : data.competitiveExams}
              </span>
            </div>
          )}
          <div className="summary-item">
            <span className="label">Higher Education:</span>
            <span className="value">{data.higherEducation}</span>
          </div>
        </div>
        <div className="summary-text">
          <span className="label">Short-Term Goals:</span>
          <p className="value">{data.shortTermGoals}</p>
        </div>
        <div className="summary-text">
          <span className="label">Long-Term Goals:</span>
          <p className="value">{data.longTermGoals}</p>
        </div>
        <div className="summary-text">
          <span className="label">Colleges of Interest:</span>
          <p className="value">{data.collegesOfInterest}</p>
        </div>
        <div className="summary-text">
          <span className="label">Skills and Certifications:</span>
          <p className="value">{data.skills}</p>
        </div>
      </div>

      <div className="summary-section">
        <h3>Financial Information</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Family Income Bracket:</span>
            <span className="value">{data.familyIncome}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button onClick={onBack} className="back-button">
          Back to Form
        </button>
        <button onClick={() => setShowQuiz(true)} className="quiz-button">
          Take Technical Assessment
        </button>
      </div>
    </div>
  );
};

export default FormSummary;