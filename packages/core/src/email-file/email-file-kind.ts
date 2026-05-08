export const emailFileKind = {
  templateInlineAsset: "template_inline_asset",
  templateAttachment: "template_attachment",
} as const;

export type EmailFileKind = (typeof emailFileKind)[keyof typeof emailFileKind];

export function isTemplateInlineAsset(kind: EmailFileKind): boolean {
  return kind === emailFileKind.templateInlineAsset;
}

export function isTemplateAttachment(kind: EmailFileKind): boolean {
  return kind === emailFileKind.templateAttachment;
}
