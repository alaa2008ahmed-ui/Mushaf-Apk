import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface QAPageProps {
    onBack: () => void;
}

interface Hadith {
    id: number;
    idInBook: number;
    chapterId: number;
    bookId: number;
    arabic: string;
    english: {
        narrator: string;
        text: string;
    };
}

const removeTashkeel = (text: string) => {
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
};

const QAPage: React.FC<QAPageProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'مرحباً بك في قسم سؤال وجواب (البحث المتقدم). يمكنك البحث عن أي كلمة أو عبارة، وسأقوم بالبحث عنها في مسند الإمام أحمد بن حنبل وعرض النتائج المطابقة.',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [hadithsData, setHadithsData] = useState<Hadith[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load ahmed.json data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsDataLoading(true);
                const response = await fetch('/ahmed.json');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.hadiths) {
                        setHadithsData(data.hadiths);
                    }
                } else {
                    console.error('Failed to load ahmed.json');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsDataLoading(false);
            }
        };
        loadData();
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

        // Simulate a slight delay for better UX
        setTimeout(() => {
            try {
                const query = removeTashkeel(userMsg.text.trim());
                const queryWords = query.split(/\s+/).filter(w => w.length > 0);
                
                if (queryWords.length === 0) {
                    throw new Error("يرجى إدخال كلمات للبحث.");
                }

                // Simple scoring search
                const results = hadithsData.map(hadith => {
                    const normalizedArabic = removeTashkeel(hadith.arabic);
                    let score = 0;
                    
                    // Exact phrase match gets highest score
                    if (normalizedArabic.includes(query)) {
                        score += 100;
                    }
                    
                    // Word matches
                    let matchedWords = 0;
                    for (const word of queryWords) {
                        if (normalizedArabic.includes(word)) {
                            matchedWords++;
                            score += 10;
                        }
                    }
                    
                    // Boost score if all words match
                    if (matchedWords === queryWords.length && queryWords.length > 1) {
                        score += 50;
                    }

                    return { hadith, score };
                }).filter(item => item.score > 0)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5); // Get top 5 results

                let botResponseText = '';

                if (results.length > 0) {
                    botResponseText = `وجدت ${results.length} نتائج مطابقة في مسند الإمام أحمد:\n\n`;
                    results.forEach((res, index) => {
                        botResponseText += `${index + 1}. ${res.hadith.arabic}\n\n`;
                    });
                } else {
                    botResponseText = 'عذراً، لم يتم العثور على نتائج مطابقة لبحثك في مسند الإمام أحمد.';
                }

                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: botResponseText.trim(),
                    sender: 'bot',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMsg]);
            } catch (error: any) {
                console.error('Error searching:', error);
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: error.message || 'عذراً، حدث خطأ أثناء البحث.',
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        }, 300);
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
                        <h1 className="font-bold text-lg leading-tight">البحث المتقدم</h1>
                        <p className="text-xs text-white/80">
                            {isDataLoading ? 'جاري تحميل مسند الإمام أحمد...' : 'يبحث في مسند الإمام أحمد (بدون إنترنت)'}
                        </p>
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
                            <span className="text-sm text-gray-500">جاري البحث...</span>
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
                            placeholder={isDataLoading ? "جاري تحميل البيانات..." : "اكتب كلمة أو عبارة للبحث..."}
                            className="flex-1 max-h-32 min-h-[50px] p-3 bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white outline-none"
                            rows={1}
                            dir="rtl"
                            disabled={isDataLoading}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isLoading || isDataLoading}
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
