import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { formatTimestamp } from '../utils/formatting';
import { type Post, postService } from '../services/postService';

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onPostDeleted: () => void;
  onCommentAdded: () => void;
}

function PostContent({ text }: { text: string }) {
  // Process content to identify and format URLs
  const processContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return <>{processContent(text)}</>;
}

export default function PostCard({ post, isOwner, onPostDeleted, onCommentAdded }: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('post_card.confirm_delete', { defaultValue: '确定删除这条消息吗？' }))) {
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      onPostDeleted();
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await postService.addComment(post.id, commentText.trim());
      setCommentText('');
      onCommentAdded();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postService.deleteComment(commentId);
      onCommentAdded();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className={`bg-background border ${post.isPinned ? 'border-neon-cyan/30' : 'border-border'} hover:border-foreground/20 transition-all`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-start gap-3 p-4 cursor-pointer ${isExpanded ? 'border-b border-border' : ''}`}
      >
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-neon-cyan/20 border border-neon-cyan/50 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">
              {t('post_card.owner_post', { defaultValue: '群主' })}
            </span>
            {post.isPinned && (
              <span className="px-1.5 py-0.5 bg-neon-cyan/20 text-neon-cyan text-[8px] font-black uppercase tracking-widest">
                {t('post_card.pinned', { defaultValue: '置顶' })}
              </span>
            )}
            <span className="text-[9px] text-foreground/30">
              {formatTimestamp(post.createdAt, t)}
            </span>
          </div>

          <div className="text-sm text-foreground leading-relaxed">
            {isExpanded || post.content.length < 200 ? (
              <PostContent text={post.content} />
            ) : (
              <PostContent text={post.content.slice(0, 200) + '...'} />
            )}
          </div>

          {post.hasPolymarketLink && (
            <div className="mt-2 flex items-center gap-1 text-[9px] text-neon-green/60">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{t('post_card.contains_polymarket_link', { defaultValue: '包含 Polymarket 链接' })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-foreground/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Full content */}
          {post.content.length >= 200 && (
            <div className="text-sm text-foreground leading-relaxed">
              <PostContent text={post.content} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/50 hover:text-neon-cyan transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('post_card.comments', { defaultValue: '评论' })}
              {post.comments.length > 0 && (
                <span className="px-1.5 py-0.5 bg-muted text-[8px]">{post.comments.length}</span>
              )}
            </button>

            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-[10px] font-bold text-neon-red/60 hover:text-neon-red transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('post_card.delete', { defaultValue: '删除' })}
              </button>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Existing comments */}
              {post.comments.length > 0 && (
                <div className="space-y-2">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 p-2 bg-muted/30 rounded">
                      <div className="flex-shrink-0 w-6 h-6 bg-foreground/10 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground break-words">{comment.content}</p>
                        <p className="text-[8px] text-foreground/30 mt-0.5">
                          {formatTimestamp(comment.createdAt, t)}
                        </p>
                      </div>
                      {(user?.id === comment.userId || isOwner) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex-shrink-0 text-foreground/20 hover:text-neon-red transition-all"
                          title={t('post_card.delete_comment', { defaultValue: '删除评论' })}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('post_card.comment_placeholder', { defaultValue: '写下你的评论...' })}
                  className="flex-1 px-3 py-2 bg-background border border-border text-[11px] text-foreground placeholder:text-foreground/30 focus:border-neon-cyan outline-none"
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    isSubmittingComment || !commentText.trim()
                      ? 'bg-muted text-foreground/30 cursor-not-allowed'
                      : 'bg-neon-cyan text-midnight-950 hover:bg-neon-cyan/80'
                  }`}
                >
                  {isSubmittingComment
                    ? t('post_card.sending', { defaultValue: '发送中' })
                    : t('post_card.send', { defaultValue: '发送' })
                  }
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
