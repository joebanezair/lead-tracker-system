import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiMove, FiSave, FiUser } from 'react-icons/fi';
import PageHeader from '../components/layout/PageHeader.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readImage = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProfilePage({ user, onUserUpdated }) {
  const avatarInput = useRef(null);
  const coverInput = useRef(null);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: '',
    avatar: user?.avatar || '',
    coverPhoto: '',
    avatarPositionX: 50,
    avatarPositionY: 50
  });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lead-tracker-token');

    fetch(API + '/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setProfile(data))
      .catch(() => {});
  }, []);

  const chooseImage = async (event, key) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return alert('Please choose an image file.');
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('Please choose an image smaller than 5 MB.');
    }

    const image = await readImage(file);
    setProfile(current => ({ ...current, [key]: image }));
  };

  const moveAvatar = event => {
    if (!dragging || !profile.avatar) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

    setProfile(current => ({
      ...current,
      avatarPositionX: Math.round(x),
      avatarPositionY: Math.round(y)
    }));
  };

  const save = async () => {
    setSaving(true);
    const token = localStorage.getItem('lead-tracker-token');

    try {
      const response = await fetch(API + '/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(profile)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Could not save profile');

      setProfile(data);
      onUserUpdated?.(data);
      alert('Profile saved.');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your profile photo, cover photo and account information."
      />
      <section className="profile-card">
        <div
          className="profile-cover"
          style={profile.coverPhoto ? { backgroundImage: `url("${profile.coverPhoto}")` } : undefined}
        >
          <button type="button" className="cover-edit" onClick={() => coverInput.current?.click()}>
            <FiCamera /> Change cover
          </button>
          <input
            ref={coverInput}
            className="file-input"
            type="file"
            accept="image/*"
            onChange={event => chooseImage(event, 'coverPhoto')}
          />
        </div>

        <div className="profile-avatar-row">
          <div
            className={dragging ? 'profile-avatar dragging-avatar' : 'profile-avatar'}
            onPointerMove={moveAvatar}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                style={{
                  objectPosition: `${profile.avatarPositionX}% ${profile.avatarPositionY}%`
                }}
                draggable="false"
              />
            ) : (
              <FiUser size={44} />
            )}
          </div>
          <div className="profile-photo-actions">
            <button type="button" onClick={() => avatarInput.current?.click()}>
              <FiCamera /> Change photo
            </button>
            {profile.avatar && (
              <button
                type="button"
                className="secondary-button"
                onPointerDown={() => setDragging(true)}
              >
                <FiMove /> Hold then drag photo
              </button>
            )}
            <input
              ref={avatarInput}
              className="file-input"
              type="file"
              accept="image/*"
              onChange={event => chooseImage(event, 'avatar')}
            />
          </div>
        </div>

        <div className="profile-form">
          <label>
            Name
            <input
              value={profile.name}
              onChange={event => setProfile(current => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input value={user?.email || ''} disabled />
          </label>
          <label className="profile-bio">
            Bio
            <textarea
              rows="5"
              maxLength="500"
              value={profile.bio || ''}
              onChange={event => setProfile(current => ({ ...current, bio: event.target.value }))}
              placeholder="Tell people a little about yourself."
            />
          </label>
        </div>

        <div className="profile-save">
          <button type="button" onClick={save} disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>
    </>
  );
}
