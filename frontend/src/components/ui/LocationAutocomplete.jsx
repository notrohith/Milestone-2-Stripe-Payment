import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './input';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { searchPlaces } from '../../lib/geocoding';

export function LocationAutocomplete({
    value,
    onChange,
    placeholder,
    className,
    icon: Icon = MapPin,
    cityBias = '',
    ...props
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);
    // Ref to cancel in-flight search when value changes quickly
    const cancelRef = useRef(false);

    // Debounced search using the shared geocoding service (serialised queue + cache)
    const runSearch = useCallback(async (query, bias) => {
        cancelRef.current = false;
        setIsLoading(true);
        try {
            const results = await searchPlaces(query, bias);
            // Only update state if this search wasn't superseded
            if (!cancelRef.current) {
                setSuggestions(results);
            }
        } catch (_) {
            if (!cancelRef.current) setSuggestions([]);
        } finally {
            if (!cancelRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!value || value.length < 3 || !showDropdown) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Cancel previous in-flight search
        cancelRef.current = true;

        // Debounce: wait for user to stop typing (1.5s)
        const timer = setTimeout(() => {
            runSearch(value, cityBias);
        }, 1500);

        return () => {
            clearTimeout(timer);
            cancelRef.current = true;
        };
    }, [value, cityBias, showDropdown, runSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion) => {
        onChange(suggestion.name, suggestion);
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400 z-10" />}
                <Input
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => {
                        if (value && value.length >= 3) setShowDropdown(true);
                    }}
                    placeholder={placeholder}
                    className={cn(Icon ? 'pl-10' : '', className)}
                    {...props}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-purple-500 z-10" />
                )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.id}
                                onMouseDown={(e) => {
                                    // Use mousedown so it fires before the input's blur
                                    e.preventDefault();
                                    handleSelect(suggestion);
                                }}
                                className="px-4 py-2 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors line-clamp-2"
                            >
                                {suggestion.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No results */}
            {showDropdown && !isLoading && value && value.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground text-center">
                    No matching locations found
                </div>
            )}
        </div>
    );
}
