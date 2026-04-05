import { MessageSquare, Trash2 } from 'lucide-react';

function PlaylistComments({
  comments,
  draft,
  currentUserId,
  ownerUsername,
  currentUsername,
  onDraftChange,
  onSubmit,
  onDelete,
}) {
  return (
    <section className="detail-panel">
      <div className="detail-panel-header">
        <div>
          <p className="section-kicker">Comments</p>
          <h4>Conversation around this playlist</h4>
        </div>
      </div>

      <div className="inline-form">
        <textarea
          className="form-input"
          placeholder="Share a note or suggestion"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        <button className="btn-primary compact" onClick={onSubmit}>
          <MessageSquare size={16} />
          Post comment
        </button>
      </div>

      <div className="inline-list">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <div className="comment-card-header">
                <strong>{comment.user.username}</strong>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p>{comment.content}</p>
              {(comment.user.id === currentUserId || ownerUsername === currentUsername) ? (
                <button className="icon-button danger" onClick={() => onDelete(comment.id)}>
                  <Trash2 size={14} />
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="empty-inline">No comments yet.</div>
        )}
      </div>
    </section>
  );
}

export default PlaylistComments;
