export function extractMessageContent(message: any): string {
  if (!message) return '';
  
  // Direct string fields
  if (message.content && typeof message.content === 'string') return message.content;
  if (message.text && typeof message.text === 'string') return message.text;
  if (message.summary && typeof message.summary === 'string') return message.summary;
  
  // Nested message.content
  if (message.message?.content) {
    if (typeof message.message.content === 'string') {
      return message.message.content;
    }
    if (Array.isArray(message.message.content)) {
      return message.message.content
        .filter((item: any) => item?.type === 'text' && item?.text)
        .map((item: any) => item.text)
        .join(' ');
    }
  }
  
  // Fallback
  return '';
}