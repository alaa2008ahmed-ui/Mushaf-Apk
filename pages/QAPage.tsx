import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { GoogleGenAI } from '@google/genai';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface QAPageProps {
    onBack: () => void;
}

const QAPage: React.FC<QAPageProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'مرحباً بك في قسم سؤال وجواب. يمكنك طرح أي سؤال، وسأقوم بالإجابة عليه بناءً على الكتب والمراجع المعتمدة المتاحة لدي فقط.',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [booksContext, setBooksContext] = useState<string>('');

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load books context (simulated for now, will load from public/books later)
    useEffect(() => {
        const loadBooks = async () => {
            try {
                // Fetch the context file from the public folder
                const response = await fetch('/books/context.txt');
                if (response.ok) {
                    const text = await response.text();
                    setBooksContext(text);
                } else {
                    setBooksContext('لم يتم العثور على محتوى الكتب بعد. سيتم إضافتها لاحقاً.');
                }
            } catch (error) {
                console.error('Error loading books:', error);
                setBooksContext('حدث خطأ أثناء تحميل محتوى الكتب.');
            }
        };
        loadBooks();
    }, []);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // Initialize Gemini API
            // Note: In a real production app, API keys should not be exposed in the client.
            // Since this is a client-side only app for now, we use the environment variable.
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            
            if (!apiKey) {
                throw new Error('مفتاح API غير متوفر. يرجى إضافته في إعدادات التطبيق.');
            }

            const ai = new GoogleGenAI({ apiKey: apiKey });
            
            const systemInstruction = `أنت مساعد إسلامي متخصص. مهمتك هي الإجابة على أسئلة المستخدم بناءً على النصوص والكتب المقدمة لك فقط. 
إذا كان السؤال خارج نطاق النصوص المقدمة، يجب أن تعتذر وتقول "عذراً، لا تتوفر لدي معلومات حول هذا الموضوع في الكتب المتاحة حالياً."
لا تقم بتأليف أي إجابات من خارج السياق المقدم.

السياق المتاح (محتوى الكتب):
${booksContext}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMsg.text,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.3, // Low temperature for more factual answers
                }
            });

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text || 'عذراً، حدث خطأ غير متوقع.',
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            console.error('Error generating response:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: error.message || 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-screen bg-[#efeae2] dark:bg-gray-900" dir="rtl">
            {/* Header */}
            <header 
                className="flex items-center p-4 text-white shadow-md z-10 flex-none"
                style={{ backgroundColor: theme.palette[0] || '#075e54' }}
            >
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors ml-2"
                >
                    <ArrowRight size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">سؤال وجواب</h1>
                        <p className="text-xs text-white/80">يجيب من الكتب المعتمدة فقط</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50"
                style={{ 
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")',
                    backgroundBlendMode: 'overlay'
                }}
            >
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] px-4 py-2 shadow-sm relative ${
                                msg.sender === 'user' 
                                    ? 'bg-[#dcf8c6] dark:bg-green-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-none' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-tr-none'
                            }`}
                        >
                            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                                {msg.text}
                            </p>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 text-left mt-1 flex justify-end items-center gap-1">
                                {formatTime(msg.timestamp)}
                                {msg.sender === 'user' && (
                                    <span className="text-blue-500">✓✓</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-gray-500" />
                            <span className="text-sm text-gray-500">جاري البحث في الكتب...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 flex-none pb-safe">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center min-h-[50px]">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="اكتب سؤالك هنا..."
                            className="flex-1 max-h-32 min-h-[50px] p-3 bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white outline-none"
                            rows={1}
                            dir="rtl"
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isLoading}
                        className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-none"
                        style={{ backgroundColor: theme.palette[0] || '#00897b' }}
                    >
                        <Send size={20} className="mr-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QAPage;
