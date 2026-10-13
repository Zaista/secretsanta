const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

// fills {{key}} placeholders in an email template with HTML-escaped values;
// the replacer function keeps $ patterns in the values from being expanded
export function fillTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (placeholder, key) =>
    key in values ? escapeHtml(values[key]) : placeholder
  );
}
