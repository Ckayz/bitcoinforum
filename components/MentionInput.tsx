'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MentionInput({ 
  value, 
  onChange, 
  onKeyDown,
  placeholder = "Type @ to mention users...",
  className = "",
  disabled = false
}: MentionInputProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users for suggestions
  const fetchUsers = async (query: string) => {
    try {
      // Show dropdown even with empty query (just typed @)
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .ilike('username', query ? `${query}%` : '%')
        .limit(5);

      if (!error && data) {
        setUsers(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setShowSuggestions(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Get cursor position and text before cursor
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    
    // Look for @ followed by word characters at the end of text before cursor
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1]; // Username being typed (can be empty)
      fetchUsers(query);
    } else {
      setShowSuggestions(false);
      setUsers([]);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && users.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % users.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectUser(users[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    
    onKeyDown?.(e);
  };

  // Select a user from suggestions
  const selectUser = (user: User) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Find the @ symbol position using regex
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (!mentionMatch) return;
    
    const mentionStart = cursorPos - mentionMatch[0].length;
    
    const newValue = 
      value.substring(0, mentionStart) + 
      `@${user.username} ` + 
      textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setUsers([]);
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = mentionStart + user.username.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        rows={3}
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && users.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {users.map((user, index) => (
            <div
              key={user.id}
              onClick={() => selectUser(user)}
              className={`px-3 py-2 cursor-pointer flex items-center space-x-2 ${
                index === selectedIndex 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'text-gray-300 hover:bg-zinc-700'
              }`}
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user.username[0]?.toUpperCase()}
              </div>
              <span>@{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
