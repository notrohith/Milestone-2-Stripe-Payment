import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming this utility exists, otherwise omit

export function LocationAutocomplete({
    value,
    onChange,
    placeholder,
    className,
    icon: Icon = MapPin,
    cityBias = '', // Optional bounding city for waypoints
    ...props
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 3 || !showDropdown) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                // Construct query, bias towards the city if provided
                const query = cityBias ? `${value}, ${cityBias}` : value;
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=en&email=contact@ridewithme.com`);
                const data = await res.json();

                // Format the suggestions making them more readable
                const formatted = (data || []).map(f => {
                    const address = f.address || {};
                    // Gather useful address parts, filter out empty ones
                    const parts = [
                        address.neighbourhood,
                        address.suburb,
                        address.city_district,
                        address.city || address.town,
                        address.state
                    ].filter(Boolean);

                    const displayName = parts.length > 0 ? parts.slice(0, 3).join(', ') : f.display_name;

                    return {
                        id: f.place_id || Math.random().toString(),
                        name: displayName,
                        raw: f
                    };
                });

                // Remove duplicates by name
                const unique = Array.from(new Map(formatted.map(item => [item.name, item])).values());

                setSuggestions(unique);
            } catch (err) {
                console.error("Error fetching locations:", err);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 1000); // 1000ms debounce
        return () => clearTimeout(timeoutId);
    }, [value, cityBias, showDropdown]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (suggestion) => {
        onChange(suggestion.name);
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
                    className={cn(Icon ? "pl-10" : "", className)}
                    {...props}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-purple-500 z-10" />
                )}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-purple-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.id}
                                onClick={() => handleSelect(suggestion)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 cursor-pointer transition-colors line-clamp-2"
                            >
                                {suggestion.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* "No results" indicator when searching but empty */}
            {showDropdown && !isLoading && value && value.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-purple-200 rounded-md shadow-lg p-3 text-sm text-gray-500 text-center">
                    No matching locations found
                </div>
            )}
        </div>
    );
}
