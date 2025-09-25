'use client';

import { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronDown, ChevronRight, HelpCircle, MessageCircle, FileText } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a new thread?',
      answer: 'To create a new thread, navigate to any category page and click the "New Post" button. Fill in your title and content, then click "Create Thread".'
    },
    {
      id: '2',
      question: 'How do I upload images or videos?',
      answer: 'When creating a post or reply, you can click the "Add Image" or "Add Video" buttons to upload media files directly from your device.'
    },
    {
      id: '3',
      question: 'What are verified users?',
      answer: 'Verified users are trusted community members who can post in the News section. They are identified by a green checkmark next to their username.'
    },
    {
      id: '4',
      question: 'How do I like or comment on posts?',
      answer: 'Click the heart icon to like a post, or click the comment icon to expand the comments section where you can add your own comment.'
    },
    {
      id: '5',
      question: 'Can I edit my posts after publishing?',
      answer: 'Currently, post editing is not available. Please double-check your content before publishing.'
    },
    {
      id: '6',
      question: 'How do I report inappropriate content?',
      answer: 'Use the "Contact Support" feature to report any inappropriate content or behavior. Our moderation team will review it promptly.'
    }
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle support form submission
    alert('Support request submitted! We\'ll get back to you soon.');
    setSupportForm({ subject: '', message: '' });
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'guidelines', label: 'Guidelines', icon: FileText },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-400">Find answers to common questions about using the Bitcoin Forum.</p>
            </div>
            
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-zinc-800 rounded-lg">
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-white font-medium">{item.question}</span>
                    {expandedFAQ === item.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === item.id && (
                    <div className="px-4 pb-4 border-t border-zinc-800">
                      <p className="text-gray-300 pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'guidelines':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Community Guidelines</h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">1. Be Respectful</h4>
                  <p>Treat all community members with respect. No harassment, hate speech, or personal attacks.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">2. Stay On Topic</h4>
                  <p>Keep discussions relevant to Bitcoin and cryptocurrency. Off-topic posts may be moved or removed.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">3. No Spam or Self-Promotion</h4>
                  <p>Avoid excessive self-promotion, spam, or repetitive content. Quality over quantity.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">4. Verify Information</h4>
                  <p>When sharing news or information, try to use reliable sources. Misinformation can be harmful.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">5. No Financial Advice</h4>
                  <p>Don't provide financial advice. Share educational content and personal opinions, but not investment recommendations.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">6. Report Issues</h4>
                  <p>If you see content that violates these guidelines, please report it to our moderation team.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
              <p className="text-gray-400 mb-6">Need help? Send us a message and we'll get back to you as soon as possible.</p>
            </div>
            
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <textarea
                  id="message"
                  rows={6}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Send Message
              </Button>
            </form>
            
            <div className="border-t border-zinc-800 pt-6">
              <h4 className="font-medium text-white mb-2">Other Ways to Get Help</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Check our FAQ section above for quick answers</p>
                <p>• Join community discussions for peer support</p>
                <p>• Follow our guidelines to avoid common issues</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Support" size="lg">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-zinc-800 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 max-h-[70vh] overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}
