"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { searchAddresses, debounce, AddressSuggestion, isValidAddress } from "@/lib/address"
import { MapPin, Loader2, CheckCircle2 } from "lucide-react"

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, suggestion?: AddressSuggestion) => void
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address...",
  label = "Address",
  error,
  required,
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null)
  const [isValid, setIsValid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
    setIsValid(isValidAddress(value))
  }, [value])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const result = await searchAddresses(query)
      
      if (result.error) {
        console.error(result.error)
      } else {
        setSuggestions(result.suggestions)
        setShowSuggestions(result.suggestions.length > 0)
      }
      
      setIsLoading(false)
    }, 300),
    []
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedSuggestion(null)
    setIsValid(isValidAddress(newValue))
    
    // Clear suggestions if input is too short
    if (newValue.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
    } else {
      debouncedSearch(newValue)
    }
    
    // Notify parent of change
    onChange(newValue)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.fullAddress)
    setSelectedSuggestion(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    setIsValid(true)
    onChange(suggestion.fullAddress, suggestion)
    
    // Focus back on input
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${error ? "border-red-500" : ""}`}
          autoComplete="off"
        />
        
        {/* Loading or Valid indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isValid && inputValue.length > 0 ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      
      {/* Validation hint */}
      {!isValid && inputValue.length > 0 && !error && (
        <p className="text-sm text-muted-foreground mt-1">
          Select a suggestion for best results
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="font-medium text-sm">{suggestion.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {suggestion.city && <span>{suggestion.city}</span>}
                {suggestion.state && <span>, {suggestion.state}</span>}
                {suggestion.postcode && <span> {suggestion.postcode}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected location info (optional) */}
      {selectedSuggestion && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>Validated address • {selectedSuggestion.lat.toFixed(4)}, {selectedSuggestion.lon.toFixed(4)}</span>
        </div>
      )}
    </div>
  )
}
