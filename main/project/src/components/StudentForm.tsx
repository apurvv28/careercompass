import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, GraduationCap, Target, Wallet } from 'lucide-react';
import FormSummary from './FormSummary';
import '../style/StudentForm.css';

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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const errors: { [key: string]: string } = {};
    const requiredFields: { [key: number]: string[] } = {
      1: ['fullName', 'dateOfBirth', 'gender', 'contactNumber', 'email', 'cityState', 'preferredLanguage'],
      2: ['educationLevel', 'instituteName', 'board', 'percentage', 'subjects', 'extracurricular'],
      3: ['careerPath', 'shortTermGoals', 'longTermGoals', 'higherEducation', 'collegesOfInterest', 'skills'],
      4: ['familyIncome']
    };

    const fieldsToCheck = requiredFields[currentStep];
    let isValid = true;

    fieldsToCheck.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Special validations
    if (currentStep === 1) {
      if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
        errors.contactNumber = 'Please enter a valid 10-digit number';
        isValid = false;
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (currentStep === 2) {
      if (formData.percentage && (Number(formData.percentage) < 0 || Number(formData.percentage) > 100)) {
        errors.percentage = 'Percentage must be between 0 and 100';
        isValid = false;
      }
      if (formData.educationLevel === '10th' && !formData.preferredStream) {
        errors.preferredStream = 'Please select your preferred stream';
        isValid = false;
      } else if (formData.educationLevel !== '10th' && !formData.stream) {
        errors.stream = 'Please select your stream';
        isValid = false;
      }
    }

    if (currentStep === 3) {
      if (formData.careerPath === 'Other' && !formData.otherCareerPath) {
        errors.otherCareerPath = 'Please specify your career path';
        isValid = false;
      }
      if (formData.competitiveExams === 'Other' && !formData.otherExam) {
        errors.otherExam = 'Please specify the exam';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setShowSummary(true);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
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
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={formErrors.fullName ? 'error' : ''}
              />
              {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
            </div>
            <div className="form-group">
              <label>Date of Birth <span className="required">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={formErrors.dateOfBirth ? 'error' : ''}
              />
              {formErrors.dateOfBirth && <span className="error-message">{formErrors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label>Gender <span className="required">*</span></label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
                className={formErrors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.gender && <span className="error-message">{formErrors.gender}</span>}
            </div>
            <div className="form-group">
              <label>Contact Number <span className="required">*</span></label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                className={formErrors.contactNumber ? 'error' : ''}
              />
              {formErrors.contactNumber && <span className="error-message">{formErrors.contactNumber}</span>}
            </div>
            <div className="form-group">
              <label>Email ID <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>City & State <span className="required">*</span></label>
              <input
                type="text"
                name="cityState"
                value={formData.cityState}
                onChange={handleInputChange}
                className={formErrors.cityState ? 'error' : ''}
              />
              {formErrors.cityState && <span className="error-message">{formErrors.cityState}</span>}
            </div>
            <div className="form-group">
              <label>Preferred Language <span className="required">*</span></label>
              <select 
                name="preferredLanguage" 
                value={formData.preferredLanguage} 
                onChange={handleInputChange}
                className={formErrors.preferredLanguage ? 'error' : ''}
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.preferredLanguage && <span className="error-message">{formErrors.preferredLanguage}</span>}
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
          <section>
            <h2>Educational Background</h2>
            <div className="form-group">
              <label>Current Education Level <span className="required">*</span></label>
              <select 
                name="educationLevel" 
                value={formData.educationLevel} 
                onChange={handleInputChange}
                className={formErrors.educationLevel ? 'error' : ''}
              >
                <option value="">Select Education Level</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.educationLevel && <span className="error-message">{formErrors.educationLevel}</span>}
            </div>
            <div className="form-group">
              <label>Name of School/College/University <span className="required">*</span></label>
              <input
                type="text"
                name="instituteName"
                value={formData.instituteName}
                onChange={handleInputChange}
                className={formErrors.instituteName ? 'error' : ''}
              />
              {formErrors.instituteName && <span className="error-message">{formErrors.instituteName}</span>}
            </div>
            <div className="form-group">
              <label>Board <span className="required">*</span></label>
              <select 
                name="board" 
                value={formData.board} 
                onChange={handleInputChange}
                className={formErrors.board ? 'error' : ''}
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.board && <span className="error-message">{formErrors.board}</span>}
            </div>
            {formData.educationLevel === '10th' ? (
              <div className="form-group">
                <label>Preferred Stream <span className="required">*</span></label>
                <select 
                  name="preferredStream" 
                  value={formData.preferredStream} 
                  onChange={handleInputChange}
                  className={formErrors.preferredStream ? 'error' : ''}
                >
                  <option value="">Select Preferred Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.preferredStream && <span className="error-message">{formErrors.preferredStream}</span>}
              </div>
            ) : (
              <div className="form-group">
                <label>Stream <span className="required">*</span></label>
                <select 
                  name="stream" 
                  value={formData.stream} 
                  onChange={handleInputChange}
                  className={formErrors.stream ? 'error' : ''}
                >
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.stream && <span className="error-message">{formErrors.stream}</span>}
              </div>
            )}
            <div className="form-group">
              <label>Percentage/CGPA <span className="required">*</span></label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className={formErrors.percentage ? 'error' : ''}
              />
              {formErrors.percentage && <span className="error-message">{formErrors.percentage}</span>}
            </div>
            <div className="form-group">
              <label>Subjects of Interest <span className="required">*</span></label>
              <textarea
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                className={formErrors.subjects ? 'error' : ''}
              />
              {formErrors.subjects && <span className="error-message">{formErrors.subjects}</span>}
            </div>
            <div className="form-group">
              <label>Extracurricular Activities & Achievements <span className="required">*</span></label>
              <textarea
                name="extracurricular"
                value={formData.extracurricular}
                onChange={handleInputChange}
                className={formErrors.extracurricular ? 'error' : ''}
              />
              {formErrors.extracurricular && <span className="error-message">{formErrors.extracurricular}</span>}
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
          <section>
            <h2>Career Interests & Aspirations</h2>
            <div className="form-group">
              <label>Preferred Career Path <span className="required">*</span></label>
              <select 
                name="careerPath" 
                value={formData.careerPath} 
                onChange={handleInputChange}
                className={formErrors.careerPath ? 'error' : ''}
              >
                <option value="">Select Career Path</option>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="UPSC">UPSC</option>
                <option value="Management">Management</option>
                <option value="IT">IT</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.careerPath && <span className="error-message">{formErrors.careerPath}</span>}
            </div>
            {showOtherCareerPath && (
              <div className="form-group">
                <label>Specify Other Career Path <span className="required">*</span></label>
                <input
                  type="text"
                  name="otherCareerPath"
                  value={formData.otherCareerPath}
                  onChange={handleInputChange}
                  className={formErrors.otherCareerPath ? 'error' : ''}
                />
                {formErrors.otherCareerPath && <span className="error-message">{formErrors.otherCareerPath}</span>}
              </div>
            )}
            <div className="form-group">
              <label>Short-Term Goals <span className="required">*</span></label>
              <textarea
                name="shortTermGoals"
                value={formData.shortTermGoals}
                onChange={handleInputChange}
                className={formErrors.shortTermGoals ? 'error' : ''}
              />
              {formErrors.shortTermGoals && <span className="error-message">{formErrors.shortTermGoals}</span>}
            </div>
            <div className="form-group">
              <label>Long-Term Goals <span className="required">*</span></label>
              <textarea
                name="longTermGoals"
                value={formData.longTermGoals}
                onChange={handleInputChange}
                className={formErrors.longTermGoals ? 'error' : ''}
              />
              {formErrors.longTermGoals && <span className="error-message">{formErrors.longTermGoals}</span>}
            </div>
            {formData.educationLevel !== '10th' && (
              <div className="form-group">
                <label>Competitive Exams</label>
                <select 
                  name="competitiveExams" 
                  value={formData.competitiveExams} 
                  onChange={handleInputChange}
                  className={formErrors.competitiveExams ? 'error' : ''}
                >
                  <option value="">Select Competitive Exam</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="CAT">CAT</option>
                  <option value="UPSC">UPSC</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.competitiveExams && <span className="error-message">{formErrors.competitiveExams}</span>}
              </div>
            )}
            {showOtherExam && (
              <div className="form-group">
                <label>Specify Other Exam <span className="required">*</span></label>
                <input
                  type="text"
                  name="otherExam"
                  value={formData.otherExam}
                  onChange={handleInputChange}
                  className={formErrors.otherExam ? 'error' : ''}
                />
                {formErrors.otherExam && <span className="error-message">{formErrors.otherExam}</span>}
              </div>
            )}
            <div className="form-group">
              <label>Preferred Mode of Higher Education <span className="required">*</span></label>
              <select 
                name="higherEducation" 
                value={formData.higherEducation} 
                onChange={handleInputChange}
                className={formErrors.higherEducation ? 'error' : ''}
              >
                <option value="">Select Mode</option>
                <option value="India">India</option>
                <option value="Abroad">Abroad</option>
              </select>
              {formErrors.higherEducation && <span className="error-message">{formErrors.higherEducation}</span>}
            </div>
            <div className="form-group">
              <label>Colleges/Universities of Interest <span className="required">*</span></label>
              <textarea
                name="collegesOfInterest"
                value={formData.collegesOfInterest}
                onChange={handleInputChange}
                className={formErrors.collegesOfInterest ? 'error' : ''}
              />
              {formErrors.collegesOfInterest && <span className="error-message">{formErrors.collegesOfInterest}</span>}
            </div>
            <div className="form-group">
              <label>Skills and Certifications <span className="required">*</span></label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className={formErrors.skills ? 'error' : ''}
                placeholder="Enter your skills, separated by commas"
              />
              {formErrors.skills && <span className="error-message">{formErrors.skills}</span>}
            </div>
          </section>
        </div>

        <div className={`form-section ${currentStep === 4 ? 'active' : ''}`}>
          <section>
            <h2>Financial Information</h2>
            <div className="form-group">
              <label>Family Income Bracket <span className="required">*</span></label>
              <select 
                name="familyIncome" 
                value={formData.familyIncome} 
                onChange={handleInputChange}
                className={formErrors.familyIncome ? 'error' : ''}
              >
                <option value="">Select Income Bracket</option>
                <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                <option value="₹1 Lakh - ₹2.5 Lakh">₹1 Lakh - ₹2.5 Lakh</option>
                <option value="₹2.5 Lakh - ₹7.5 Lakh">₹2.5 Lakh - ₹7.5 Lakh</option>
                <option value="Above ₹7.5 Lakh">Above ₹7.5 Lakh</option>
              </select>
              {formErrors.familyIncome && <span className="error-message">{formErrors.familyIncome}</span>}
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