import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { postService } from '../services/postService';

interface PostInputProps {
  roomId: string;
  onPostCreated: () => void;
}

export default function PostInput({ roomId, onPostCreated }: PostInputProps) {
  const { t } = useTranslation();
  // const { user } = useAuth(); // Will be used for room ownership check
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if current user is the room owner (to be implemented based on room ownership)
  // const isOwner = user?.roomIds?.includes(roomId) || user?.ownedRoomIds?.includes(roomId);
  const isOwner = true; // Temporarily set to true until room ownership is implemented

  if (!isOwner) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError(t('post_input.empty_content', { defaultValue: '请输入内容' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await postService.createPost(roomId, content.trim());
      setContent('');
      onPostCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || t('post_input.error', { defaultValue: '发送失败' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('post_input.placeholder', { defaultValue: '分享你的想法... (支持识别链接)' })}
          className="w-full min-h-[80px] p-3 bg-background border border-border focus:border-neon-cyan outline-none text-sm text-foreground placeholder:text-foreground/30 transition-all resize-none"
          disabled={isSubmitting}
        />
        {error && (
          <p className="text-[10px] font-bold text-neon-red uppercase tracking-widest">{error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              isSubmitting || !content.trim()
                ? 'bg-muted text-foreground/30 cursor-not-allowed'
                : 'bg-neon-cyan text-midnight-950 hover:bg-neon-cyan/80 shadow-neon-cyan'
            }`}
          >
            {isSubmitting
              ? t('post_input.sending', { defaultValue: '发送中...' })
              : t('post_input.send', { defaultValue: '发送' })
            }
          </button>
        </div>
      </form>
    </div>
  );
}
