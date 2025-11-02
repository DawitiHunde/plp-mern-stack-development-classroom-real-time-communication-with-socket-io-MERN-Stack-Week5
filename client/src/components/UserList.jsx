import './UserList.css';

function UserList({ users, onUserClick, currentUserId }) {
  return (
    <div className="user-list">
      {users.length === 0 ? (
        <p className="no-users">No users online</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${user.id === currentUserId ? 'current-user' : ''}`}
            onClick={() => onUserClick(user)}
          >
            <span className="user-avatar">👤</span>
            <span className="user-name">{user.username}</span>
            {user.id === currentUserId && <span className="you-badge">(You)</span>}
          </div>
        ))
      )}
    </div>
  );
}

export default UserList;


