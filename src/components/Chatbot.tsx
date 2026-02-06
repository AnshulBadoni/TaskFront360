"use client"
import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! 👋 Welcome to our support center. How can I help you today?", sender: 'bot', timestamp: new Date() },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;

        // Add user message
        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Send message to your API endpoint
            const response = await fetch('http://localhost:3001/support/getSupport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputValue }),
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();
            console.log(data.data.response, "resp")

            // Add bot response from API
            const newBotMessage = {
                id: Date.now() + 1,
                text: data.data.response,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
            console.error('Error communicating with API:', error);

            // Fallback message if API fails
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm experiencing connection issues right now. Please try again in a moment or email us directly at support@company.com.",
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const quickReplies = [
        "How do I reset my password?",
        "Where can I find documentation?",
        "I need to contact support",
        "What are your business hours?"
    ];

    const handleQuickReply = (reply: string) => {
        setInputValue(reply);
        // Auto-submit the quick reply
        setTimeout(() => {
            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
            handleSendMessage(fakeEvent);
        }, 100);
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
                    style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center text-xs font-bold">1</span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[500px] transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center">
                    <div className="relative mr-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 absolute bottom-0 right-0 border-2 border-white z-10 animate-pulse"></div>
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-semibold">Support Assistant</h2>
                        <p className="text-xs text-indigo-100">{isTyping ? 'Typing...' : 'Online • We\'re here to help'}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-indigo-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10"
                        title="Minimize"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-indigo-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Welcome card */}
                {messages.length <= 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200">
                        <div className="flex items-start">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-full mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-1">Hello! I'm your support assistant</h3>
                                <p className="text-sm text-gray-600 mb-3">I can help you with account issues, technical problems, or answer general questions.</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {quickReplies.map((reply, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickReply(reply)}
                                            className="text-left text-sm bg-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 border border-gray-200 p-2 rounded-lg transition-all duration-200 hover:shadow-sm"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'user'
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none shadow-md'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'
                                    }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                                <div className="flex space-x-1 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    <span className="text-xs text-gray-500 ml-2">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1 border-0 bg-transparent rounded-lg py-3 px-4 focus:outline-none focus:ring-0 text-sm"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={isTyping || inputValue.trim() === ''}
                        className={`p-2 rounded-full transition-all duration-300 ${isTyping || inputValue.trim() === '' ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg'}`}
                        title="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                    Our support team is available 24/7 to assist you
                </div>
            </form>
        </div>
    );
};

export default ChatBot;