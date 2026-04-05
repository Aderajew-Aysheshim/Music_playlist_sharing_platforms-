import { Trash2, UserPlus } from 'lucide-react';

function PlaylistCollaborators({
  collaborators,
  draft,
  onDraftChange,
  onAdd,
  onRoleChange,
  onRemove,
}) {
  return (
    <section className="detail-panel">
      <div className="detail-panel-header">
        <div>
          <p className="section-kicker">Collaborators</p>
          <h4>Invite and manage roles</h4>
        </div>
      </div>

      <div className="inline-form">
        <input
          className="form-input"
          placeholder="username"
          value={draft.username}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              username: event.target.value,
            })
          }
        />
        <select
          className="form-input"
          value={draft.role}
          onChange={(event) =>
            onDraftChange({
              ...draft,
              role: event.target.value,
            })
          }
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button className="btn-primary compact" onClick={onAdd}>
          <UserPlus size={16} />
          Add
        </button>
      </div>

      <div className="inline-list">
        {collaborators.length ? (
          collaborators.map((collaborator) => (
            <div key={collaborator.id} className="mini-row">
              <div>
                <strong>{collaborator.user.username}</strong>
                <span>{collaborator.user.email || collaborator.role}</span>
              </div>
              <div className="mini-row-actions">
                <select
                  className="form-input small"
                  value={collaborator.role}
                  onChange={(event) => onRoleChange(collaborator.id, event.target.value)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button className="icon-button danger" onClick={() => onRemove(collaborator.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-inline">No collaborators yet.</div>
        )}
      </div>
    </section>
  );
}

export default PlaylistCollaborators;
