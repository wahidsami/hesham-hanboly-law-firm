import React from 'react';
import { slugify } from '../content/utils';

const parseInline = (text: string) => {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={`${match.index}-em`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a key={`${match.index}-link`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-[#A56A1E] underline">
            {linkMatch[1]}
          </a>,
        );
      } else {
        parts.push(token);
      }
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={`${match.index}-code`} className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.95em]">
          {token.slice(1, -1)}
        </code>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};

export interface MarkdownHeading {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

export const extractMarkdownHeadings = (value: string): MarkdownHeading[] =>
  value
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      if (block.startsWith('### ')) {
        return [{ id: slugify(block.slice(4)), level: 3 as const, text: block.slice(4) }];
      }

      if (block.startsWith('## ')) {
        return [{ id: slugify(block.slice(3)), level: 2 as const, text: block.slice(3) }];
      }

      if (block.startsWith('# ')) {
        return [{ id: slugify(block.slice(2)), level: 1 as const, text: block.slice(2) }];
      }

      return [];
    });

export default function MarkdownRenderer({ value }: { value: string }) {
  const blocks = value
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.startsWith('### ')) {
          return (
            <h3 key={index} id={slugify(block.slice(4))} className="scroll-mt-28 text-xl font-bold text-[#1E1E1E]">
              {parseInline(block.slice(4))}
            </h3>
          );
        }

        if (block.startsWith('## ')) {
          return (
            <h2 key={index} id={slugify(block.slice(3))} className="scroll-mt-28 text-2xl font-extrabold text-[#1E1E1E]">
              {parseInline(block.slice(3))}
            </h2>
          );
        }

        if (block.startsWith('# ')) {
          return (
            <h1 key={index} id={slugify(block.slice(2))} className="scroll-mt-28 text-3xl font-extrabold text-[#1E1E1E]">
              {parseInline(block.slice(2))}
            </h1>
          );
        }

        if (/^(- |\* )/m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^(- |\* )/, '').trim());
          return (
            <ul key={index} className="list-disc space-y-2 ps-5 text-[#4B4B4B] leading-8">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s/m.test(block)) {
          const items = block.split('\n').map((line) => line.replace(/^\d+\.\s/, '').trim());
          return (
            <ol key={index} className="list-decimal space-y-2 ps-5 text-[#4B4B4B] leading-8">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-s-4 border-[#A56A1E] bg-[#F8F5EF] px-4 py-3 italic text-[#4B4B4B]">
              {parseInline(block.slice(2))}
            </blockquote>
          );
        }

        return (
          <p key={index} className="text-[#4B4B4B] leading-8">
            {parseInline(block)}
          </p>
        );
      })}
    </div>
  );
}
