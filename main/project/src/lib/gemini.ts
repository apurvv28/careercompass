import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  
}

export async function generateQuiz(interests: string[], careerPath: string, otherCareerPath: string): Promise<QuizQuestion[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create a technical assessment with 10 multiple-choice questions based on ${careerPath} and these interests: ${interests.join(', ')}.

Format each question exactly like this example:
{
  "question": "What is the primary purpose of version control systems in software development?",
  "options": [
    "To make code run faster",
    "To track changes and manage code collaboration",
    "To automatically fix bugs",
    "To compile code into executables"
  ],
  "correctAnswer": "To track changes and manage code collaboration",
  "explanation": "Version control systems are essential for tracking code changes, managing collaboration between developers, and maintaining code history."
}

Requirements:
1. Each question must test technical knowledge relevant to ${careerPath} and ${interests.join(', ')}
2. Provide exactly 4 options per question
3. One option must be exactly correct
4. Include a clear explanation
5. Format as a valid JSON array of question objects
6. Questions should be challenging but fair
7. Focus on practical, real-world scenarios

Return only valid JSON in this exact format:
[
  {question object 1},
  {question object 2},
  {question object 3},
  {question object 4},
  {question object 5}
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonStr = jsonMatch[0];
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Validate the parsed data
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      const validQuestions = parsed.filter(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        q.correctAnswer && 
        q.options.includes(q.correctAnswer) &&
        q.explanation
      );

      if (validQuestions.length < 2) {
        throw new Error('Not enough valid questions');
      }

      return validQuestions;
    } catch (parseError) {
      console.error('Failed to parse quiz response:', parseError);
      throw new Error('Failed to parse quiz data');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // Return fallback questions related to the career path
    return [
      {
        question: `What is a key principle of ${careerPath}?`,
        options: [
          "Problem solving",
          "Documentation",
          "Testing",
          "All of the above"
        ],
        correctAnswer: "All of the above",
        explanation: `${careerPath} requires a combination of problem-solving skills, proper documentation, and thorough testing to ensure quality outcomes.`
      },
      {
        question: "Which skill is most important for career growth?",
        options: [
          "Continuous learning",
          "Working alone",
          "Avoiding challenges",
          "Following orders"
        ],
        correctAnswer: "Continuous learning",
        explanation: "Success in any technical field requires continuous learning and adaptation to new technologies and methodologies."
      },
      {
        question: "What is the best approach to complex problems?",
        options: [
          "Solving everything at once",
          "Breaking down into smaller parts",
          "Ignoring the complexity",
          "Delegating to others"
        ],
        correctAnswer: "Breaking down into smaller parts",
        explanation: "Breaking complex problems into smaller, manageable parts is a fundamental problem-solving strategy."
      },
      {
        question: "How should you handle project deadlines?",
        options: [
          "Rush to complete everything",
          "Ignore the deadline",
          "Plan and prioritize tasks",
          "Work only on easy tasks"
        ],
        correctAnswer: "Plan and prioritize tasks",
        explanation: "Effective planning and prioritization are essential for meeting deadlines while maintaining quality."
      },
      {
        question: "What is the best way to improve technical skills?",
        options: [
          "Practical projects",
          "Reading only",
          "Watching videos only",
          "Memorizing facts"
        ],
        correctAnswer: "Practical projects",
        explanation: "Hands-on experience through practical projects is the most effective way to develop and reinforce technical skills."
      }
    ];
  }
}

export async function evaluateResponse(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Evaluate this technical quiz response:
    Question: ${question}
    User's Answer: ${userAnswer}
    Correct Answer: ${correctAnswer}
    
    Provide a brief, encouraging feedback that:
    1. Explains why the answer is correct or incorrect
    2. Offers a specific tip for improvement if wrong
    3. Maintains a positive, constructive tone
    
    Keep the response under 100 words and focus on being helpful and encouraging.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || 'Great effort! Keep practicing to improve your understanding.';
  } catch (error) {
    console.error('Error evaluating response:', error);
    return userAnswer === correctAnswer 
      ? "Excellent work! You've demonstrated a good understanding of this concept."
      : "Good try! Review this topic and try again. Remember that practice makes perfect!";
  }
}

export async function generateConsultation(
  formData: any,
  quizScore: number,
  previousMessages: any[],
  userMessage: string
): Promise<{ message: string; thought: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const context = `
User Profile:
- Name: ${formData.fullName}
- Career Interest: ${formData.careerPath}
- Education: ${formData.educationLevel}
- Technical Quiz Score: ${quizScore}%
- Skills: ${formData.skillsCertifications || 'Not specified'}
- Short-term Goals: ${formData.shortTermGoals}
- Long-term Goals: ${formData.longTermGoals}

Previous messages:
${previousMessages.map(m => `${m.sender}: ${m.text}`).join('\n')}

User's latest message: ${userMessage}

Instructions:
1. Act as a friendly career consultant
2. Keep responses concise (max 4 sentences) and if needed, provide additional context
3. Be encouraging but realistic
4. Focus on actionable advice
5. Consider the user's background and goals
6. Maintain a conversational tone

Also generate a brief thought (max 10 words) that shows what you're considering before responding.

Response format:
{
  "thought": "Brief thought about user's situation",
  "message": "Your actual response to the user"
}`;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text);
      return {
        thought: parsed.thought || "Hmm, let me think about that...",
        message: parsed.message || text
      };
    } catch {
      // If parsing fails, try to extract thought and message using regex
      const thoughtMatch = text.match(/thought[":]?\s*["']([^"']+)["']/i);
      const messageMatch = text.match(/message[":]?\s*["']([^"']+)["']/i);
      
      return {
        thought: thoughtMatch?.[1] || "Hmm, let me think about that...",
        message: messageMatch?.[1] || text
      };
    }
  } catch (error) {
    console.error('Error generating consultation:', error);
    return {
      thought: "Let me provide a general response...",
      message: "I understand your situation. Based on your interests and experience, I'd recommend focusing on building practical skills through projects and considering additional certifications in your field."
    };
  }
}