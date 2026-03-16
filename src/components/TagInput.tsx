import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    availableTags: string[];
    placeholder?: string;
    className?: string;
}

export function TagInput({ selectedTags, onTagsChange, availableTags, placeholder = "Add tags...", className = "" }: TagInputProps) {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const suggestions = useMemo(() => {
        if (!input) return [];
        return availableTags.filter(tag =>
            tag.toLowerCase().includes(input.toLowerCase()) &&
            !selectedTags.includes(tag)
        );
    }, [input, availableTags, selectedTags]);

    const handleAddTag = (tag: string) => {
        const normalizedTag = tag.trim().toLowerCase();
        if (normalizedTag && !selectedTags.includes(normalizedTag)) {
            onTagsChange([...selectedTags, normalizedTag]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tag: string) => {
        onTagsChange(selectedTags.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                handleAddTag(input.trim());
            }
        } else if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
            handleRemoveTag(selectedTags[selectedTags.length - 1]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gray-100 focus-within:border-gray-400 transition-all">
                {selectedTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#1B1B19]/5 text-[#1B1B19] rounded-md text-xs font-bold border border-[#1B1B19]/10">
                        {tag}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-black transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedTags.length === 0 ? placeholder : ''}
                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] py-0.5"
                />
            </div>

            {showSuggestions && (suggestions.length > 0 || (input.trim() && !selectedTags.includes(input.trim()))) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fadeIn max-h-48 overflow-y-auto">
                    {suggestions.map(suggestion => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleAddTag(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#1B1B19]/5 transition-all flex items-center justify-between group"
                        >
                            <span className="font-medium text-gray-700">{suggestion}</span>
                            <Plus size={14} className="text-gray-300 group-hover:text-[#1B1B19]" />
                        </button>
                    ))}
                    {input.trim() && !availableTags.some(t => t.toLowerCase() === input.trim().toLowerCase()) && (
                        <button
                            type="button"
                            onClick={() => handleAddTag(input)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#1B1B19]/10 transition-all flex items-center gap-2 text-[#1B1B19] bg-[#1B1B19]/5"
                        >
                            <Plus size={14} />
                            <span className="font-bold">Create "{input.trim()}"</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
