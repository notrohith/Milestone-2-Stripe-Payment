import React from 'react';

export function ImageWithFallback({ src, alt, className, ...props }) {
    // Simple fallback wrapper
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
            }}
            {...props}
        />
    );
}
