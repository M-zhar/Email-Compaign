import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

function normalizePlaceholders(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = key.trim().toLowerCase();
    return `{${normalizedKey}}`;
  });
}

export async function processTemplate(file: File): Promise<{ subject: string; content: string }> {
  if (file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const lines = result.value.split('\n');
    
    // Normalize placeholders to lowercase
    const subject = normalizePlaceholders(lines[0].replace(/<[^>]*>/g, '').trim());
    const content = normalizePlaceholders(lines.slice(1).join('\n'));
    
    return { subject, content };
  } else if (file.name.endsWith('.xlsx')) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    
    const subject = normalizePlaceholders(data[0]?.[0] || 'No Subject');
    const content = normalizePlaceholders(data.slice(1).map(row => {
      return row.map(cell => cell?.toString() || '').join(' ');
    }).join('\n'));
    
    return { subject, content };
  }
  throw new Error('Unsupported file format');
}

export async function processRecipients(file: File): Promise<Array<{ [key: string]: string }>> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert sheet to JSON with header row as keys
  const recipients = XLSX.utils.sheet_to_json(worksheet);
  
  // Process recipients and normalize field names
  return recipients.map(recipient => {
    const processedRecipient: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(recipient)) {
      // Convert all keys to lowercase and normalize common field names
      const normalizedKey = normalizeFieldName(key.trim().toLowerCase());
      processedRecipient[normalizedKey] = value?.toString().trim() || '';
    }
    return processedRecipient;
  });
}

function normalizeFieldName(key: string): string {
  // Map common variations of field names to standardized versions
  const fieldMappings: { [key: string]: string } = {
    'firstname': 'firstName',
    'first_name': 'firstName',
    'first name': 'firstName',
    'lastname': 'lastName',
    'last_name': 'lastName',
    'last name': 'lastName',
    'email': 'email',
    'emailaddress': 'email',
    'email_address': 'email',
    'email address': 'email',
    'username': 'username',
    'user_name': 'username',
    'user name': 'username'
  };

  return fieldMappings[key] || key;
}

function normalizeFieldValue(value: string): string {
  return value.trim();
}

function normalizeFieldKey(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

function normalizeFieldPair(key: string, value: string): [string, string] {
  return [normalizeFieldKey(key), normalizeFieldValue(value)];
}

export function getAttachmentType(file: File): 'image' | 'document' | 'other' {
  if (file.type.startsWith('image/')) return 'image';
  if (
    file.name.endsWith('.pdf') ||
    file.name.endsWith('.doc') ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.xls') ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.ppt') ||
    file.name.endsWith('.pptx')
  ) return 'document';
  return 'other';
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function normalizeKey(key: string): string {
  // Remove curly braces and trim whitespace
  key = key.replace(/[{}]/g, '').trim().toLowerCase();
  
  // Map common field name variations
  const fieldMappings: { [key: string]: string } = {
    'firstname': 'firstName',
    'first_name': 'firstName',
    'first name': 'firstName',
    'fname': 'firstName',
    'lastname': 'lastName',
    'last_name': 'lastName',
    'last name': 'lastName',
    'lname': 'lastName',
    'email': 'email',
    'mail': 'email',
    'emailaddress': 'email',
    'email_address': 'email'
  };

  return fieldMappings[key] || key;
}

function normalizeValue(value: string | undefined): string {
  return value?.toString().trim() || '';
}

function normalizeData(data: { [key: string]: string }): { [key: string]: string } {
  const normalized: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = normalizeKey(key);
    normalized[normalizedKey] = normalizeValue(value);
  }
  return normalized;
}

function normalizeText(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return `{${normalizedKey}}`;
  });
}

export function replacePlaceholders(text: string, data: { [key: string]: string }): string {
  const normalizedText = normalizeText(text);
  const normalizedData = normalizeData(data);
  
  return normalizedText.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return normalizedData[normalizedKey] || match;
  });
}

function normalizeFieldNames(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return `{${normalizedKey}}`;
  });
}

function normalizeFieldValues(text: string): string {
  return text.trim();
}

function normalizeFieldPairs(text: string, data: { [key: string]: string }): string {
  const normalizedData = normalizeData(data);
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return normalizedData[normalizedKey] || match;
  });
}

function normalizeFieldContent(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return `{${normalizedKey}}`;
  });
}

function normalizeFieldData(data: { [key: string]: string }): { [key: string]: string } {
  const normalized: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = normalizeKey(key);
    normalized[normalizedKey] = normalizeValue(value);
  }
  return normalized;
}

function normalizeFieldText(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return `{${normalizedKey}}`;
  });
}

function normalizeFieldReplacements(text: string, data: { [key: string]: string }): string {
  const normalizedData = normalizeFieldData(data);
  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    const normalizedKey = normalizeKey(key);
    return normalizedData[normalizedKey] || match;
  });
}

function normalizeFieldMatches(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldExtraction(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldList(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldArray(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldSet(text: string): Set<string> {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return new Set(matches.map(match => normalizeKey(match.slice(1, -1))));
}

function normalizeFieldCollection(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldGroup(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldSequence(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldItems(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldElements(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldMembers(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldEntries(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldRecords(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldRows(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldColumns(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldFields(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldProperties(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

function normalizeFieldAttributes(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches.map(match => normalizeKey(match.slice(1, -1))))];
}

export function extractPlaceholders(text: string): string[] {
  return normalizeFieldAttributes(text);
}