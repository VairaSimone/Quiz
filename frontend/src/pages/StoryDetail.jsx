import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/client';
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';

function RenderFormattedText({ text }) {
  if (!text) return null;
  if (typeof text === 'string') return <span>{text}</span>;

  if (Array.isArray(text)) {
    return (
      <>
        {text.map((part, index) => {
          if (typeof part === 'string') return <span key={index}>{part}</span>;
          if (typeof part === 'object' && part !== null) {
            const content = part.text || '';
            switch (part.type) {
              case 'bold':
                return <strong key={index} className="font-bold">{content}</strong>;
              case 'italic':
                return <em key={index} className="italic">{content}</em>;
              case 'strikethrough':
                return <s key={index} className="line-through">{content}</s>;
              case 'code':
                return <code key={index} className="bg-slate-900/60 px-1 py-0.5 rounded font-mono text-xs">{content}</code>;
              case 'underline':
                return <u key={index} className="underline">{content}</u>;
              default:
                return <span key={index}>{content}</span>;
            }
          }
          return null;
        })}
      </>
    );
  }

  return null;
}

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/stories/${id}`);
        setStory(res.data.data);
      } catch (err) {
        console.error('Errore caricamento racconto:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-400">
        <Sparkles className="w-8 h-8 animate-spin" />
        <span className="ml-2 font-medium">Caricamento conversazione...</span>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center text-rose-400">
        Racconto non trovato!
      </div>
    );
  }

let messages = [];
if (story.messages) {
  messages = story.messages;
} else if (Array.isArray(story.content)) {
  messages = story.content; // Se il JSON di Telegram è un array diretto
} else if (story.content?.messages) {
  messages = story.content.messages;
}
  const participants = Array.from(new Set(messages.map(m => m.from))).filter(Boolean);
  const leftParticipant = participants[0] || '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/stories" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-4 font-semibold transition">
        <ArrowLeft className="w-4 h-4" /> Torna ai racconti
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">{story.title}</h1>
          {story.description && <p className="text-slate-400 text-xs">{story.description}</p>}
        </div>
        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold">
          <MessageSquare className="w-4 h-4" />
          <span>{messages.length} Messaggi</span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-4 md:p-6 shadow-2xl space-y-3.5 min-h-[500px]">
        {messages.map((msg, index) => {
          const isLeft = msg.from === leftParticipant;

          return (
            <div key={index} className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}>
              <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                {msg.from}
              </span>

              <div
                className={`max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                  isLeft
                    ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                    : 'bg-indigo-600 text-white rounded-tr-xs shadow-indigo-600/10'
                }`}
              >
                <RenderFormattedText text={msg.text} />

                {msg.date && (
                  <span className={`block text-[9px] mt-1.5 text-right font-mono ${isLeft ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {typeof msg.date === 'string' ? msg.date : new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}