"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this exists or I'll create it
import { cn } from "@/lib/utils";

interface MainSearchBarProps {
    placeholder?: string;
    className?: string;
}

export function MainSearchBar({ 
    placeholder = "Find something delicious...", 
    className 
}: MainSearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Get initial value from URL
    const initialSearch = searchParams?.get("search") || "";
    const [inputValue, setInputValue] = useState(initialSearch);
    const [isSearching, setIsSearching] = useState(false);
    
    const debouncedSearch = useDebounce(inputValue, 500);

    // Sync with URL changes (e.g. if filters clear the search)
    useEffect(() => {
        setInputValue(searchParams?.get("search") || "");
    }, [searchParams]);

    // Handle search update
    useEffect(() => {
        const currentSearch = searchParams?.get("search") || "";
        
        // Only update if the value has actually changed to avoid unnecessary re-renders
        if (debouncedSearch === currentSearch) {
            setIsSearching(false);
            return;
        }

        const params = new URLSearchParams(searchParams?.toString() || "");
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        
        // Always reset to page 1 when searching
        params.set("page", "1");
        
        setIsSearching(false);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [debouncedSearch, pathname, router, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setIsSearching(true);
    };

    const handleClear = () => {
        setInputValue("");
        setIsSearching(true);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // On mobile, scroll the search bar to the top so the keyboard doesn't hide it
        if (window.innerWidth < 768) {
            const target = e.currentTarget.closest('.search-container-root');
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300); // Small delay for keyboard to start appearing
            }
        }
    };

    return (
        <div className={cn("relative flex-1 group search-container-root scroll-mt-24 sm:scroll-mt-28", className)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                {isSearching ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
            </div>
            
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                className="w-full pl-12 pr-12 py-3 sm:py-4 bg-transparent focus:outline-none font-bold text-xs sm:text-sm text-gray-900 placeholder:text-gray-300 rounded-xl sm:rounded-2xl transition-all"
            />

            {inputValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
