import { z } from 'zod';

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Safe validation wrapper
 */
export function validateInput<T>(
  schema: z.ZodSchema,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: result.data as T,
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        _general: ['Validation failed'],
      },
    };
  }
}

/**
 * Batch validation for multiple schemas
 */
export function validateBatch<T extends Record<string, any>>(
  schemas: Record<keyof T, z.ZodSchema>,
  data: T
): ValidationResult<T> {
  const errors: Record<string, string[]> = {};
  const validatedData: any = {};

  for (const [key, schema] of Object.entries(schemas)) {
    const result = validateInput(schema, data[key as keyof T]);

    if (!result.success && result.errors) {
      errors[key] = result.errors[key] || ['Validation failed'];
    } else if (result.data !== undefined) {
      validatedData[key] = result.data;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: validatedData as T,
  };
}
