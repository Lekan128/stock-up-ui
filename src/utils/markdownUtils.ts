import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Converts markdown text (with **bold**, newlines, etc.) into safe HTML
 * that can be injected into the DOM.
 *
 * @param text - The markdown text to convert
 * @returns A sanitized HTML string safe for rendering with dangerouslySetInnerHTML
 */
export function renderMarkdownToHtml(text: string): string {
  if (!text) return "";

  // Convert markdown (e.g., **bold**, ### headings, etc.) to HTML
  //   const rawHtml = marked.parse(text);
  const rawHtml = marked.parse(text) as string;

  // Sanitize to prevent XSS or unsafe tags/scripts
  return DOMPurify.sanitize(rawHtml);
}
