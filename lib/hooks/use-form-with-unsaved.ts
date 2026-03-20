"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useForm, UseFormProps, UseFormReturn, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface UseFormWithUnsavedOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  onUnsavedChange?: (hasUnsavedChanges: boolean) => void
  confirmMessage?: string
}

interface UseFormWithUnsavedReturn<T extends FieldValues> extends UseFormReturn<T> {
  hasUnsavedChanges: boolean
  isSubmitting: boolean
  submitError: string | null
  handleFormSubmit: () => Promise<void>
  resetForm: () => void
  markAsSaved: () => void
}

const DEFAULT_CONFIRM_MESSAGE = "You have unsaved changes. Are you sure you want to leave?"

/**
 * Enhanced form hook with:
 * - Zod validation
 * - Dirty/pristine tracking
 * - Unsaved changes warning
 * - Submit error handling
 * - Auto-save support
 */
export function useFormWithUnsaved<T extends FieldValues>(
  options: UseFormWithUnsavedOptions<T>
): UseFormWithUnsavedReturn<T> {
  const {
    schema,
    onSubmit,
    onUnsavedChange,
    confirmMessage = DEFAULT_CONFIRM_MESSAGE,
    ...formOptions
  } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialValuesRef = useRef<T | null>(null)

  const form = useForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const { formState, watch, handleSubmit, reset } = form
  const { isDirty, isValid } = formState

  // Track form values for comparison
  const currentValues = watch()

  // Update unsaved changes state
  useEffect(() => {
    const hasChanges = isDirty && isValid
    if (hasChanges !== hasUnsavedChanges) {
      setHasUnsavedChanges(hasChanges)
      onUnsavedChange?.(hasChanges)
    }
  }, [isDirty, isValid, hasUnsavedChanges, onUnsavedChange])

  // Store initial values on mount
  useEffect(() => {
    if (!initialValuesRef.current && formOptions.defaultValues) {
      initialValuesRef.current = formOptions.defaultValues as T
    }
  }, [formOptions.defaultValues])

  // Handle beforeunload event for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = confirmMessage
        return confirmMessage
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, confirmMessage])

  // Handle form submission
  const handleFormSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await handleSubmit(async (data) => {
        await onSubmit(data)
        // Reset form to new values after successful submit
        reset(data)
        setHasUnsavedChanges(false)
        onUnsavedChange?.(false)
      })()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save changes"
      setSubmitError(message)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [handleSubmit, onSubmit, reset, onUnsavedChange])

  // Reset form to initial values
  const resetForm = useCallback(() => {
    if (initialValuesRef.current) {
      reset(initialValuesRef.current)
    } else {
      reset()
    }
    setHasUnsavedChanges(false)
    setSubmitError(null)
    onUnsavedChange?.(false)
  }, [reset, onUnsavedChange])

  // Mark form as saved (e.g., after auto-save)
  const markAsSaved = useCallback(() => {
    reset(currentValues)
    setHasUnsavedChanges(false)
    setSubmitError(null)
    onUnsavedChange?.(false)
  }, [currentValues, reset, onUnsavedChange])

  return {
    ...form,
    hasUnsavedChanges,
    isSubmitting,
    submitError,
    handleFormSubmit,
    resetForm,
    markAsSaved,
  }
}

/**
 * Hook for tracking unsaved changes without a form
 */
export function useUnsavedChanges(
  hasChanges: boolean,
  confirmMessage: string = DEFAULT_CONFIRM_MESSAGE
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = confirmMessage
        return confirmMessage
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges, confirmMessage])
}

/**
 * Hook for auto-save functionality
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: {
    debounceMs?: number
    enabled?: boolean
    onSave?: () => void
    onError?: (error: Error) => void
  } = {}
) {
  const { debounceMs = 3000, enabled = true, onSave, onError } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      setSaveError(null)

      try {
        await saveFn(data)
        setLastSaved(new Date())
        onSave?.()
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setSaveError(err)
        onError?.(err)
      } finally {
        setIsSaving(false)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, saveFn, debounceMs, enabled, onSave, onError])

  return { isSaving, lastSaved, saveError }
}
