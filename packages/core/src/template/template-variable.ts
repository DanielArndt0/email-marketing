export type TemplateVariable = {
  key: string;
  label?: string | undefined;
  required?: boolean | undefined;
  description?: string | undefined;
  example?: string | undefined;
};

export type TemplateVariableValidation = {
  isValid: boolean;
  declaredVariables: string[];
  detectedVariables: string[];
  undeclaredVariables: string[];
  unusedDeclaredVariables: string[];
};

const TEMPLATE_VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractTemplateVariablesFromContent(
  contents: Array<string | null | undefined>,
): string[] {
  const variables = new Set<string>();

  for (const content of contents) {
    if (!content) {
      continue;
    }

    for (const match of content.matchAll(TEMPLATE_VARIABLE_PATTERN)) {
      const key = match[1];

      if (key) {
        variables.add(key);
      }
    }
  }

  return Array.from(variables).sort();
}

export function validateTemplateVariables(input: {
  declaredVariables: TemplateVariable[];
  detectedVariables: string[];
}): TemplateVariableValidation {
  const declared = new Set(
    input.declaredVariables.map((variable) => variable.key).filter(Boolean),
  );
  const detected = new Set(input.detectedVariables.filter(Boolean));

  const undeclaredVariables = Array.from(detected)
    .filter((key) => !declared.has(key))
    .sort();

  const unusedDeclaredVariables = Array.from(declared)
    .filter((key) => !detected.has(key))
    .sort();

  return {
    isValid: undeclaredVariables.length === 0,
    declaredVariables: Array.from(declared).sort(),
    detectedVariables: Array.from(detected).sort(),
    undeclaredVariables,
    unusedDeclaredVariables,
  };
}
