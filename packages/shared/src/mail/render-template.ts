export type TemplateVariables = Record<string, string>;

export function renderTemplate(
  content: string,
  variables: TemplateVariables,
): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}
