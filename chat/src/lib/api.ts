import { Message } from "./types";
import { Doctor } from "./doctors";

// Simplified implementation - in a real app, you would call the actual Anthropic API
export async function sendMessage(doctor: Doctor | null, messages: Message[]): Promise<Message> {
  // Extract doctor name for generating a personalized response
  const doctorName = doctor && typeof doctor === 'object' ? doctor.name : 'Doctor';
  const specialty = doctor && typeof doctor === 'object' ? doctor.specialty : 'medicine';
  
  // Simulated AI response with randomized delay (0.5 to 2 seconds)
  return new Promise((resolve) => {
    const delay = 500 + Math.random() * 1500;
    
    setTimeout(() => {
      // Get the last user message content
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      
      // Generate a doctor-like response
      const responses = [
        `Я понимаю вашу обеспокоенность. В области ${specialty} это распространенный вопрос. Давайте разберемся с вашей ситуацией.`,
        `Спасибо за ваш вопрос. Как специалист в ${specialty}, я могу сказать, что это важная тема.`,
        `Исходя из моего опыта в ${specialty}, могу предложить несколько рекомендаций по вашему вопросу.`,
        `Хороший вопрос. В ${specialty} мы часто сталкиваемся с подобными ситуациями.`,
        `Я бы рекомендовал(а) обратить внимание на следующие аспекты вашего вопроса...`
      ];
      
      const responseIndex = Math.floor(Math.random() * responses.length);
      
      resolve({
        id: crypto.randomUUID(),
        role: "assistant",
        content: responses[responseIndex],
        timestamp: new Date(),
      });
    }, delay);
  });
}