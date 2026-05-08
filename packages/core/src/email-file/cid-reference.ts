const CID_REFERENCE_REGEX = /\bcid:([^"'\s>)]+)/gi;

export type TemplateCidValidation = {
  isValid: boolean;
  referencedCids: string[];
  availableCids: string[];
  missingCids: string[];
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function normalizeContentId(value: string): string {
  const withoutPrefix = value.trim().replace(/^cid:/i, "");

  return withoutPrefix.replace(/^<|>$/g, "").trim();
}

export function extractCidReferencesFromHtml(
  htmlContent: string | null | undefined,
): string[] {
  if (!htmlContent) {
    return [];
  }

  const cids: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = CID_REFERENCE_REGEX.exec(htmlContent)) !== null) {
    const rawCid = match[1];

    if (!rawCid) {
      continue;
    }

    const cid = normalizeContentId(rawCid);

    if (cid.length > 0) {
      cids.push(cid);
    }
  }

  return unique(cids);
}

export function validateTemplateCidReferences(input: {
  htmlContent: string | null | undefined;
  availableCids: string[];
}): TemplateCidValidation {
  const referencedCids = extractCidReferencesFromHtml(input.htmlContent);
  const availableCids = unique(input.availableCids.map(normalizeContentId));
  const availableCidSet = new Set(availableCids);
  const missingCids = referencedCids.filter((cid) => !availableCidSet.has(cid));

  return {
    isValid: missingCids.length === 0,
    referencedCids,
    availableCids,
    missingCids,
  };
}
