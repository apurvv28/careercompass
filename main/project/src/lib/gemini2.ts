import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  relatedFields?: string[];
}

const fallbackQuestions: QuizQuestion[] = [
  {
    question: "Which aspect of problem-solving do you find most rewarding?",
    options: [
      "Finding creative solutions",
      "Analyzing complex data",
      "Optimizing existing systems",
      "Collaborating with others"
    ],
    correctAnswer: "Finding creative solutions",
    explanation: "A preference for creative problem-solving indicates strong potential in innovation-driven roles.",
    category: "Problem-Solving",
    relatedFields: ["Innovation Management", "Product Design", "Research & Development"]
  },
  {
    question: "How do you prefer to learn new concepts?",
    options: [
      "Hands-on experimentation",
      "Reading documentation",
      "Video tutorials",
      "Group discussions"
    ],
    correctAnswer: "Hands-on experimentation",
    explanation: "Practical learning style suggests strength in applied fields and technical roles.",
    category: "Learning Style",
    relatedFields: ["Technical Implementation", "Research", "Product Development"]
  },
  {
    question: "What type of projects interest you most?",
    options: [
      "Building new solutions",
      "Improving existing systems",
      "Solving user problems",
      "Managing technical teams"
    ],
    correctAnswer: "Building new solutions",
    explanation: "Interest in creating new solutions indicates potential in development and engineering roles.",
    category: "Core Interests",
    relatedFields: ["Software Development", "Systems Architecture", "Product Engineering"]
  },
  {
    question: "Which work environment do you prefer?",
    options: [
      "Fast-paced startup",
      "Established corporation",
      "Research institution",
      "Consulting firm"
    ],
    correctAnswer: "Fast-paced startup",
    explanation: "Preference for dynamic environments suggests adaptability and innovation potential.",
    category: "Work Environment",
    relatedFields: ["Startup Roles", "Innovation Labs", "Product Management"]
  },
  {
    question: "What motivates you most in your work?",
    options: [
      "Technical challenges",
      "User impact",
      "Business growth",
      "Team success"
    ],
    correctAnswer: "Technical challenges",
    explanation: "Focus on technical challenges indicates strong potential in specialized technical roles.",
    category: "Career Values",
    relatedFields: ["Technical Architecture", "Specialized Engineering", "Research"]
  }
];

export async function generateQuiz(interests: string[], careerPath: string, otherCareerPath: string): Promise<QuizQuestion[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const effectiveCareerPath = careerPath === 'Other' ? otherCareerPath : careerPath;

  const prompt = `Create a personalized career assessment with 10 questions to evaluate interests and suggest alternative career paths.

The assessment should analyze the user's interests in ${effectiveCareerPath} and these areas: ${interests.join(', ')}.

Return a JSON array of exactly 10 questions. Each question must follow this exact format:
{
  "question": "Clear question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Must match one of the options exactly",
  "explanation": "Brief explanation of why this answer is best",
  "category": "One of: Core Interests, Technical Knowledge, Soft Skills, Problem-Solving, Career Values, Learning Style, Work Environment, Related Fields, Future Goals, Innovation",
  "relatedFields": ["Field 1", "Field 2", "Field 3"]
}

Requirements:
1. Questions should evaluate both technical knowledge and career interests
2. Include questions about ${interests.join(' and ')}
3. Each question must suggest related career fields
4. Focus on identifying transferable skills
5. Help discover alternative career paths
6. Return only valid JSON array
7. Questions should be personalized to ${effectiveCareerPath}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.warn('No valid JSON array found in response, using fallback questions');
      return fallbackQuestions;
    }

    const jsonStr = jsonMatch[0];
    
    try {
      const parsed = JSON.parse(jsonStr);
      
      if (!Array.isArray(parsed)) {
        console.warn('Response is not an array, using fallback questions');
        return fallbackQuestions;
      }

      const validQuestions = parsed.filter(q => {
        try {
          return (
            typeof q.question === 'string' && q.question.length > 0 &&
            Array.isArray(q.options) && q.options.length === 4 &&
            q.options.every((opt: string) => typeof opt === 'string' && opt.length > 0) &&
            typeof q.correctAnswer === 'string' && q.options.includes(q.correctAnswer) &&
            typeof q.explanation === 'string' && q.explanation.length > 0 &&
            typeof q.category === 'string' && q.category.length > 0 &&
            (!q.relatedFields || Array.isArray(q.relatedFields))
          );
        } catch {
          return false;
        }
      });

      if (validQuestions.length >= 5) {
        return validQuestions.slice(0, 10);
      }
      
      console.warn('Not enough valid questions, using fallback questions');
      return fallbackQuestions;
    } catch (parseError) {
      console.warn('Failed to parse quiz response:', parseError);
      return fallbackQuestions;
    }
  } catch (error) {
    console.warn('Error generating quiz:', error);
    return fallbackQuestions;
  }
}

export async function generateConsultation(
  formData: any,
  quizScore: number,
  previousMessages: any[],
  userMessage: string,
  relatedFields?: string[]
): Promise<{ message: string; thought: string; suggestedFields?: string[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const context = `
User Profile:
- Name: ${formData.fullName}
- Current Career Interest: ${formData.careerPath === 'Other' ? formData.otherCareerPath : formData.careerPath}
- Education: ${formData.educationLevel}
- Assessment Score: ${quizScore}%
- Skills: ${formData.skills || 'Not specified'}
- Short-term Goals: ${formData.shortTermGoals}
- Long-term Goals: ${formData.longTermGoals}
${relatedFields ? `- Related Fields Identified: ${relatedFields.join(', ')}` : ''}

Previous messages:
${previousMessages.map(m => `${m.sender}: ${m.text}`).join('\n')}

User's latest message: ${userMessage}

Instructions:
1. Act as a friendly career consultant
2. Keep responses concise (max 4 sentences) and if needed, provide additional context
3. Be encouraging and specific
4. Suggest alternative career paths based on identified interests
5. Consider both technical skills and soft skills
6. Reference assessment results and trends
7. Provide actionable next steps
8. Consider both traditional and emerging career paths
9. Focus on growth potential
10. Highlight transferable skills

Return a JSON object with this format:
{
  "thought": "Brief analysis of user's situation (max 10 words)",
  "message": "Your response to the user (max 3 sentences)",
  "suggestedFields": ["Field 1", "Field 2", "Field 3"]
}`;

  try {
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text().trim();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.thought && parsed.message) {
          return {
            thought: parsed.thought,
            message: parsed.message,
            suggestedFields: parsed.suggestedFields || []
          };
        }
      }
      
      // Fallback parsing for non-JSON responses
      const thoughtMatch = text.match(/["']thought["']:\s*["']([^"']+)["']/i);
      const messageMatch = text.match(/["']message["']:\s*["']([^"']+)["']/i);
      
      return {
        thought: thoughtMatch?.[1] || "Analyzing career interests and potential paths...",
        message: messageMatch?.[1] || text,
        suggestedFields: []
      };
    } catch (parseError) {
      console.warn('Failed to parse consultation response:', parseError);
      return {
        thought: "Analyzing career options...",
        message: text.slice(0, 200),
        suggestedFields: []
      };
    }
  } catch (error) {
    console.warn('Error generating consultation:', error);
    return {
      thought: "Providing career guidance based on assessment...",
      message: "Based on your interests and skills, I recommend exploring both your current path and related fields that match your strengths. Let's discuss specific areas where you can leverage your abilities.",
      suggestedFields: []
    };
  }
}