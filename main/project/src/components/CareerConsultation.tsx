import React, { useState, useEffect, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import Webcam from 'react-webcam';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Send, Volume2, Edit2, Check, GraduationCap, Target, User, Briefcase, Home, Download, TrendingUp, BrainCircuit, BarChart3, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateConsultation, generateQuiz } from '../lib/gemini2';
import { QuizQuestion } from '../lib/gemini2';
import maleConsultantAnimation from '../assets/male-consultant-animation.json';
import femaleConsultantAnimation from '../assets/female-consultant-animation.json';
import '../style/CareerConsultation.css';
// No replacement needed, just remove the incorrect import
const maleVideoPath = new URL('../assets/male.mp4', import.meta.url).href;
const femaleVideoPath = new URL('../assets/female1.mp4', import.meta.url).href;

interface CareerConsultationProps {
  formData: any;
  quizScore: number;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'consultant';
  timestamp: Date;
}

interface CareerTrend {
  year: string;
  growth: number;
}

interface SkillAnalysis {
  skill: string;
  proficiency: number;
}

interface InterestAnalysis {
  category: string;
  interest: number;
  knowledge: number;
}

export default function CareerConsultation({ formData, quizScore, onBack }: CareerConsultationProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [consultantGender, setConsultantGender] = useState<'male' | 'female'>('male');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAIResponse, setCurrentAIResponse] = useState<string>('');
  const [useVideo, setUseVideo] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isReassessing, setIsReassessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [newScore, setNewScore] = useState(quizScore);
  const [interestAnalysis, setInterestAnalysis] = useState<InterestAnalysis[]>([
    { category: formData.careerPath, interest: 85, knowledge: quizScore },
    { category: 'Related Fields', interest: 70, knowledge: quizScore * 0.8 },
    { category: 'Core Skills', interest: 90, knowledge: quizScore * 0.9 },
    { category: 'Advanced Topics', interest: 75, knowledge: quizScore * 0.7 },
    { category: 'Practical Application', interest: 80, knowledge: quizScore * 0.85 }
  ]);
  const [careerTrends, setCareerTrends] = useState<CareerTrend[]>([
    { year: '2024', growth: 15 },
    { year: '2025', growth: 22 },
    { year: '2026', growth: 28 },
    { year: '2027', growth: 35 },
    { year: '2028', growth: 42 }
  ]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingRef = useRef<ReturnType<typeof setTimeout>>();
  const speechSynthesis = window.speechSynthesis;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startLoadingAnimation = () => {
    setLoadingProgress(0);
    loadingRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const stopLoadingAnimation = () => {
    if (loadingRef.current) {
      clearInterval(loadingRef.current);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Initialize skill analysis based on form data
        const skills = formData.skills.split(',').map((skill: string) => ({
          skill: skill.trim(),
          proficiency: Math.min(100, quizScore + Math.random() * 20 - 10)
        }));
        setSkillAnalysis(skills);

        let initialMessage: Message;
        if (quizScore >= 60) {
          initialMessage = {
            id: Date.now().toString(),
            text: `Congratulations ${formData.fullName}! Your score of ${quizScore}% shows strong potential in ${formData.careerPath}. I've analyzed your performance and created a detailed skill assessment. Let's discuss how you can leverage your strengths and explore current industry trends. What specific aspect would you like to know more about?`,
            sender: 'consultant',
            timestamp: new Date()
          };
        } else {
          initialMessage = {
            id: Date.now().toString(),
            text: `Hi ${formData.fullName}, I see you scored ${quizScore}% in the assessment. While there's room for improvement, don't be discouraged! Let's take a focused assessment to better understand your interests and strengths. Would you like to start?`,
            sender: 'consultant',
            timestamp: new Date()
          };
        }

        setMessages([initialMessage]);
        setCurrentAIResponse(initialMessage.text);
        speakMessage(initialMessage.text);
      }
    };

    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      speechSynthesis.cancel();
      if (loadingRef.current) {
        clearInterval(loadingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript && !isEditing) {
      setInputMessage(transcript);
    }
  }, [transcript, isEditing]);

  useEffect(() => {
    if (videoRef.current) {
      if (isSpeaking) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isSpeaking]);

  const startReassessment = async () => {
    setIsReassessing(true);
    startLoadingAnimation();
    
    try {
      const newQuestions = await generateQuiz(
        [formData.subjects, formData.skills],
        formData.careerPath,
        formData.otherCareerPath
      );
      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error generating reassessment:', error);
      setIsReassessing(false);
    } finally {
      stopLoadingAnimation();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setNewScore(prev => prev + (100 - prev) * 0.2);
    }

    setInterestAnalysis(prev => prev.map(item => ({
      ...item,
      knowledge: Math.min(100, item.knowledge + (isCorrect ? 5 : -2)),
      interest: Math.min(100, item.interest + (answer === questions[currentQuestion].correctAnswer ? 2 : 1))
    })));

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsReassessing(false);
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Great effort! Based on this focused assessment, I can see your interest and knowledge in ${formData.careerPath} has evolved. Let's analyze your results and discuss the best path forward.`,
          sender: 'consultant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
        setCurrentAIResponse(completionMessage.text);
        speakMessage(completionMessage.text);
      }
    }, 2000);
  };

  const speakMessage = (text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = speechSynthesis.getVoices();
      
      const preferredVoice = voices.find(voice => {
        const voiceName = voice.name.toLowerCase();
        return consultantGender === 'female' 
          ? voiceName.includes('female') || voiceName.includes('woman')
          : voiceName.includes('male') || voiceName.includes('man');
      });

      utterance.voice = preferredVoice || voices[0];
      utterance.pitch = consultantGender === 'female' ? 1.2 : 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setIsEditing(false);
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    resetTranscript();
    setIsThinking(true);
    setIsEditing(false);

    if (quizScore < 60 && !isReassessing && inputMessage.toLowerCase().includes('yes')) {
      await startReassessment();
      setIsThinking(false);
      return;
    }

    try {
      const response = await generateConsultation(
        formData,
        newScore,
        messages,
        inputMessage
      );

      const consultantMessage: Message = {
        id: Date.now().toString(),
        text: response.message,
        sender: 'consultant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, consultantMessage]);
      setCurrentAIResponse(response.message);
      speakMessage(response.message);
    } catch (error) {
      console.error('Error generating consultation:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble processing that right now. Could you please rephrase your question?",
        sender: 'consultant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentAIResponse(errorMessage.text);
      speakMessage(errorMessage.text);
    } finally {
      setIsThinking(false);
    }
  };

  const handleEndChat = () => {
    setShowExportDialog(true);
  };

  const handleRetakeAssessment = () => {
    startReassessment();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportChatSummary = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 20;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Career Consultation Summary', margin, yPosition);
    yPosition += lineHeight * 2;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student Information:', margin, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${formData.fullName}`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Career Path: ${formData.careerPath}`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Technical Assessment Score: ${newScore}%`, margin, yPosition);
    yPosition += lineHeight * 2;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Consultation History:', margin, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont('helvetica', 'normal');
    messages.forEach(message => {
      const sender = message.sender === 'user' ? 'You' : 'Consultant';
      const timestamp = formatDate(message.timestamp);
      const text = `[${timestamp}] ${sender}: ${message.text}`;
      
      const splitText = pdf.splitTextToSize(text, pageWidth - margin * 2);
      
      if (yPosition + (splitText.length * lineHeight) > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      splitText.forEach((line: string) => {
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += lineHeight / 2;
    });

    pdf.save(`career-consultation-${formData.fullName.replace(/\s+/g, '-')}.pdf`);
  };

  const handleExportDialogResponse = (shouldExport: boolean) => {
    if (shouldExport) {
      exportChatSummary();
    }
    setShowExportDialog(false);
    window.location.href = '/';
  };

  const renderCareerTrends = () => {
    const maxGrowth = Math.max(...careerTrends.map(t => t.growth));
    
    return (
      <div className="career-trends">
        <h3><TrendingUp size={20} /> Industry Growth Trends</h3>
        <div className="trend-bars">
          {careerTrends.map((trend, index) => (
            <div key={trend.year} className="trend-bar-container">
              <div 
                className="trend-bar"
                style={{ 
                  height: `${(trend.growth / maxGrowth) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <span className="trend-value">+{trend.growth}%</span>
              </div>
              <span className="trend-year">{trend.year}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillAnalysis = () => {
    return (
      <div className="skill-analysis">
        <h3><BarChart3 size={20} /> Skill Proficiency Analysis</h3>
        <div className="skill-bars">
          {skillAnalysis.map((skill, index) => (
            <div key={skill.skill} className="skill-bar-container">
              <span className="skill-name">{skill.skill}</span>
              <div className="skill-bar-wrapper">
                <div 
                  className="skill-bar"
                  style={{ 
                    width: `${skill.proficiency}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="skill-value">{Math.round(skill.proficiency)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInterestAnalysis = () => {
    return (
      <div className="interest-analysis">
        <h3><BookOpen size={20} /> Interest & Knowledge Analysis</h3>
        <div className="interest-bars">
          {interestAnalysis.map((item, index) => (
            <div key={item.category} className="interest-bar-container">
              <span className="category-name">{item.category}</span>
              <div className="interest-bar-group">
                <div className="bar-wrapper">
                  <div 
                    className="interest-bar"
                    style={{ 
                      width: `${item.interest}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="bar-value">Interest: {Math.round(item.interest)}%</span>
                  </div>
                </div>
                <div className="bar-wrapper">
                  <div 
                    className="knowledge-bar"
                    style={{ 
                      width: `${item.knowledge}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="bar-value">Knowledge: {Math.round(item.knowledge)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isReassessing && questions.length > 0) {
    return (
      <div className="reassessment-container">
        <h2>Focused Assessment</h2>
        <div className="question-card">
          <p className="question-number">Question {currentQuestion + 1} of {questions.length}</p>
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
                }`}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedAnswer && (
            <div className="explanation">
              <h3>Explanation:</h3>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-container">
      <div className="consultation-header">
        <div className="consultant-info">
          <div className={`consultant-avatar ${isSpeaking ? 'speaking' : ''}`}>
            {useVideo ? (
              <video
                ref={videoRef}
                src={consultantGender === 'male' ? '/src/assets/videos/male-consultant.mp4' : '/src/assets/videos/female-consultant.mp4'}
                className="avatar-animation"
                loop
                muted
                playsInline
              />
            ) : (
              <Player
                src={consultantGender === 'male' ? maleConsultantAnimation : femaleConsultantAnimation}
                className="avatar-animation"
                autoplay
                loop
              />
            )}
          </div>
          <div className="consultant-details">
            <h2>Career Consultation</h2>
            <p>AI-Powered Career Guidance</p>
          </div>
        </div>
        <div className="header-controls">
          <div className="gender-selector">
            <button
              onClick={() => setConsultantGender('male')}
              className={`gender-button ${consultantGender === 'male' ? 'active' : ''}`}
            >
              Male
            </button>
            <button
              onClick={() => setConsultantGender('female')}
              className={`gender-button ${consultantGender === 'female' ? 'active' : ''}`}
            >
              Female
            </button>
          </div>
          <button
            onClick={() => setUseVideo(!useVideo)}
            className={`video-toggle ${useVideo ? 'active' : ''}`}
          >
            {useVideo ? 'Use Animation' : 'Use Video'}
          </button>
          <button onClick={handleEndChat} className="end-chat-button">
            <Home size={20} />
            End Chat
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="video-panel left">
          <div className="video-container small">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              className="video-feed"
              width={280}
              height={200}
            />
            <div className="video-label">You</div>
          </div>
          <div className="session-info">
            <h3>Session Information</h3>
            <div className="info-item">
              <User size={16} />
              <span>Name:</span>
              <strong>{formData.fullName}</strong>
            </div>
            <div className="info-item">
              <Briefcase size={16} />
              <span>Career Path:</span>
              <strong>{formData.careerPath}</strong>
            </div>
            <div className="info-item">
              <GraduationCap size={16} />
              <span>Education:</span>
              <strong>{formData.educationLevel}</strong>
            </div>
            <div className="info-item">
              <Target size={16} />
              <span>Assessment Score:</span>
              <strong>{Math.round(newScore)}%</strong>
            </div>
          </div>
          {renderInterestAnalysis()}
          {newScore >= 60 && (
            <>
              {renderCareerTrends()}
              {renderSkillAnalysis()}
            </>
          )}
        </div>

        <div className="chat-section">
          <div className="messages-container">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.sender === 'consultant' && (
                    <button 
                      className="replay-voice"
                      onClick={() => speakMessage(message.text)}
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
                <span className="message-time">{formatDate(message.timestamp)}</span>
              </div>
            ))}
            {isThinking && (
              <div className="thinking-indicator">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-controls">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={listening && !isEditing ? 'Listening...' : 'Type your message...'}
                className="message-input"
                disabled={listening && !isEditing}
              />
              {browserSupportsSpeechRecognition && (
                <button
                  onClick={toggleMic}
                  className={`mic-button ${listening ? 'active' : ''}`}
                  title={listening ? 'Stop recording' : 'Start recording'}
                >
                  {listening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              {listening && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`edit-button ${isEditing ? 'active' : ''}`}
                  title={isEditing ? 'Submit edit' : 'Edit transcript'}
                >
                  {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className="send-button"
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
            {listening && !isEditing && (
              <p className="listening-indicator">Speaking... Click edit to modify the text</p>
            )}
          </div>
        </div>

        <div className="video-panel right">
          <div className={`video-container small ${isSpeaking ? 'speaking' : ''}`}>
          {consultantGender === 'male' ? (
              <video
                ref={videoRef}
                src={maleVideoPath}
                className="video-feed"
                style={{ width: '280px', height: '200px' }}
                loop
                muted
                playsInline
              />
            ) : (
              <video
                ref={videoRef}
                src={femaleVideoPath}
                className="video-feed"
                style={{ width: '280px', height: '200px' }}
                loop
                muted
                playsInline
              />
            )}
            <div className="video-label">AI Consultant</div>
          </div>
          <div className="ai-response">
            <h3>Current Response</h3>
            <p>{currentAIResponse}</p>
          </div>
          {/* {newScore < 60 && (
            <div className="retake-assessment">
              <h3>Improve Your Score</h3>
              <p>Take another assessment focused on your interests to better understand your strengths.</p>
              <button 
                className="retake-button"
                onClick={handleRetakeAssessment}
              >
                <BrainCircuit size={20} />
                Start New Assessment
              </button>
            </div>
          )} */}
        </div>
      </div>

      {showExportDialog && (
        <div className="export-dialog-overlay">
          <div className="export-dialog">
            <h3>Save Chat Summary</h3>
            <p>Would you like to save a PDF summary of this consultation?</p>
            <div className="export-dialog-buttons">
              <button onClick={() => handleExportDialogResponse(true)} className="export-yes">
                <Download size={20} />
                Yes, Save PDF
              </button>
              <button onClick={() => handleExportDialogResponse(false)} className="export-no">
                No, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}