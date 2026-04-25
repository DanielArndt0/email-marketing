export type LeadTemplateVariableMapping = {
  source: "lead";
  path: string;
  fallback?: string | undefined;
};

export type StaticTemplateVariableMapping = {
  source: "static";
  value: string;
};

export type TemplateVariableMapping =
  | LeadTemplateVariableMapping
  | StaticTemplateVariableMapping;

export type TemplateVariableMappings = Record<string, TemplateVariableMapping>;
