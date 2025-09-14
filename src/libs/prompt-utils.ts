import type { ControlValues } from '../components/project-controls/types';

export interface PromptVariables extends ControlValues {
  // Image placeholders
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  [key: `image${number}`]: string | undefined;
}

/**
 * Replace template variables in a prompt template
 * Supports {{variableName}} syntax
 * @param template - The template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Processed prompt string
 */
export function replacePromptVariables(template: string, variables: PromptVariables): string {
  if (!template) return template;

  let result = template;

  // Replace all {{variable}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g;

  result = result.replace(variablePattern, (match, variableName) => {
    const cleanVariableName = variableName.trim();
    const value = variables[cleanVariableName];

    if (value !== undefined && value !== null) {
      return String(value);
    }

    // If variable not found, return the original placeholder
    return match;
  });

  return result;
}

/**
 * Extract all variable names from a prompt template
 * @param template - The template string
 * @returns Array of variable names found in the template
 */
export function extractPromptVariables(template: string): string[] {
  if (!template) return [];

  const variablePattern = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  match = variablePattern.exec(template);
  while (match !== null) {
    if (match[1]) {
      const variableName = match[1].trim();
      if (variableName && !variables.includes(variableName)) {
        variables.push(variableName);
      }
    }
    match = variablePattern.exec(template);
  }

  return variables;
}

/**
 * Validate that all required variables in the template are provided
 * @param template - The template string
 * @param variables - Object containing variable values
 * @returns Object with validation result and missing variables
 */
export function validatePromptVariables(
  template: string,
  variables: PromptVariables,
): {
  isValid: boolean;
  missingVariables: string[];
} {
  const requiredVariables = extractPromptVariables(template);
  const missingVariables: string[] = [];

  for (const variable of requiredVariables) {
    if (variables[variable] === undefined || variables[variable] === null || variables[variable] === '') {
      missingVariables.push(variable);
    }
  }

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Create image placeholders for multiple images
 * @param images - Array of image URLs or filenames
 * @returns Object with image1, image2, etc. properties
 */
export function createImagePlaceholders(images: string[]): PromptVariables {
  const placeholders: PromptVariables = {};

  images.forEach((image, index) => {
    placeholders[`image${index + 1}`] = image;
  });

  return placeholders;
}

/**
 * Build complete prompt variables from control values and images
 * @param controlValues - Values from control components
 * @param images - Array of image URLs
 * @returns Combined variables object
 */
export function buildPromptVariables(controlValues: ControlValues, images: string[]): PromptVariables {
  return {
    ...controlValues,
    ...createImagePlaceholders(images),
  };
}
