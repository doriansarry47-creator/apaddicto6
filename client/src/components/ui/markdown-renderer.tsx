import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    if (!text) return "";
    
    let html = text;
    
    // Headers avec styles améliorés
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-blue-800 border-l-4 border-blue-300 pl-4">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-blue-900 border-l-4 border-blue-500 pl-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-6 text-blue-950 border-l-4 border-blue-700 pl-4">$1</h1>');
    
    // Bold et Italic avec couleurs thérapeutiques
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-700 bg-green-50 px-1 rounded">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-blue-600">$1</em>');
    
    // Code inline avec style distinctif
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-purple-700 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Links avec style thérapeutique
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors" target="_blank" rel="noopener noreferrer">🔗 $1</a>');
    
    // Citations avec style apaisant
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-teal-400 bg-teal-50 pl-4 py-2 my-4 italic text-teal-800 rounded-r-lg">💭 $1</blockquote>');
    
    // Listes avec puces personnalisées
    html = html.replace(/^- (.*$)/gm, '<li class="ml-6 mb-2 text-gray-700 relative"><span class="absolute -ml-6 text-green-500 font-bold">✓</span> $1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-2 text-gray-700 relative"><span class="absolute -ml-6 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">$1</span> $1</li>');
    
    // Ajout de classes pour les paragraphes
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
      if (p.trim() && !p.startsWith('<h') && !p.startsWith('<li') && !p.startsWith('<blockquote')) {
        return `<p class="mb-4 text-gray-700 leading-relaxed">${p}</p>`;
      }
      return p;
    }).join('\n\n');
    
    // Remplacer les sauts de ligne simples par des <br>
    html = html.replace(/\n(?!\n)/g, '<br>');
    
    return html;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}