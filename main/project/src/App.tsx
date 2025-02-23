import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, GraduationCap, Target, Wallet } from 'lucide-react';
import FormSummary from './FormSummary';
import '../styles/StudentForm.css';

const StudentForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    cityState: '',
    preferredLanguage: '',
    educationLevel: '',
    instituteName: '',
    board: '',
    stream: '',
    preferredStream: '',
    percentage: '',
    subjects: '',
    extracurricular: '',
    careerPath: '',
    otherCareerPath: '',
    shortTermGoals: '',
    longTermGoals: '',
    competitiveExams: '',
    otherExam: '',
    higherEducation: '',
    collegesOfInterest: '',
    skills: '',
    familyIncome: ''
  });

  const [showOtherCareerPath, setShowOtherCareerPath] = useState(false);
  const [showOtherExam, setShowOtherExam] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'careerPath') {
      setShowOtherCareerPath(value === 'Other');
    }
    if (name === 'competitiveExams') {
      setShowOtherExam(value === 'Other');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-icon">
            <User size={20} />
          </div>
          <span>Personal</span>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-icon">
            <GraduationCap size={20} />
          </div>
          <span>Education</span>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-icon">
            <Target size={20} />
          </div>
          <span>Career</span>
        </div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-icon">
            <Wallet size={20} />
          </div>
          <span>Financial</span>
        </div>
      </div>
    );
  };

  if (showSummary) {
    return <FormSummary data={formData} onBack={() => setShowSummary(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {renderStepIndicator()}
      
      <div className="form-sections-container">
        <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
          <section>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Number:</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div className="form-group">
              <label>Email ID:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>City & State:</label>
              <input
                type="text"
                name="cityState"
                value={formData.cityState}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Preferred Language:</label>
              <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange} required>
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
          <section>
            <h2>Educational Background</h2>
            <div className="form-group">
              <label>Current Education Level:</label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} required>
                <option value="">Select Education Level</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Name of School/College/University:</label>
              <input
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Board:</label>
              <select name="board" value={formData.board} onChange={handleInputChange} required>
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {formData.educationLevel === '10th' ? (
              <div className="form-group">
                <label>Preferred Stream:</label>
                <select name="preferredStream" value={formData.preferredStream} onChange={handleInputChange} required>
                  <option value="">Select Preferred Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Stream:</label>
                <select name="stream" value={formData.stream} onChange={handleInputChange} required>
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Percentage/CGPA:</label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Subjects of Interest:</label>
              <textarea
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Extracurricular Activities & Achievements:</label>
              <textarea
                name="extracurricular"
                value={formData.extracurricular}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
          <section>
            <h2>Career Interests & Aspirations</h2>
            <div className="form-group">
              <label>Preferred Career Path:</label>
              <select name="careerPath" value={formData.careerPath} onChange={handleInputChange} required>
                <option value="">Select Career Path</option>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="UPSC">UPSC</option>
                <option value="Management">Management</option>
                <option value="IT">IT</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {showOtherCareerPath && (
              <div className="form-group">
                <label>Specify Other Career Path:</label>
                <input
                  type="text"
                  name="otherCareerPath"
                  value={formData.otherCareerPath}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Short-Term Goals:</label>
              <textarea
                name="shortTermGoals"
                value={formData.shortTermGoals}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Long-Term Goals:</label>
              <textarea
                name="longTermGoals"
                value={formData.longTermGoals}
                onChange={handleInputChange}
                required
              />
            </div>
            {formData.educationLevel !== '10th' && (
              <div className="form-group">
                <label>Competitive Exams:</label>
                <select name="competitiveExams" value={formData.competitiveExams} onChange={handleInputChange} required>
                  <option value="">Select Competitive Exam</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="CAT">CAT</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            {showOtherExam && (
              <div className="form-group">
                <label>Specify Other Exam:</label>
                <input
                  type="text"
                  name="otherExam"
                  value={formData.otherExam}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Preferred Mode of Higher Education:</label>
              <select name="higherEducation" value={formData.higherEducation} onChange={handleInputChange} required>
                <option value="">Select Mode</option>
                <option value="India">India</option>
                <option value="Abroad">Abroad</option>
              </select>
            </div>
            <div className="form-group">
              <label>Colleges/Universities of Interest:</label>
              <textarea
                name="collegesOfInterest"
                value={formData.collegesOfInterest}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Skills and Certifications:</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 4 ? 'active' : ''}`}>
          <section>
            <h2>Financial Information</h2>
            <div className="form-group">
              <label>Family Income Bracket:</label>
              <select name="familyIncome" value={formData.familyIncome} onChange={handleInputChange} required>
                <option value="">Select Income Bracket</option>
                <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                <option value="₹1 Lakh - ₹2.5 Lakh">₹1 Lakh - ₹2.5 Lakh</option>
                <option value="₹2.5 Lakh - ₹7.5 Lakh">₹2.5 Lakh - ₹7.5 Lakh</option>
                <option value="Above ₹7.5 Lakh">Above ₹7.5 Lakh</option>
              </select>
            </div>
          </section>
        </div>
      </div>

      <div className="form-navigation">
        {currentStep > 1 && (
          <button type="button" onClick={prevStep} className="nav-btn prev-btn">
            <ChevronLeft size={20} /> Previous
          </button>
        )}
        {currentStep < 4 ? (
          <button type="button" onClick={nextStep} className="nav-btn next-btn">
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button type="submit" className="nav-btn submit-btn">
            Submit
          </button>
        )}
      </div>
    </form>
  );
};

export default StudentForm;