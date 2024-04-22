import { useNavigate } from "@remix-run/react";

export default function ContactForm({
    first,
    last,
    twitter,
    avatar,
    notes,
}: {
    first?: string;
    last?: string;
    twitter?: string;
    avatar?: string;
    notes?: string;
}) {
  const navigate = useNavigate();

  return (
    <div id="contact-form">
      <p>
        <span>Name</span>
        <input
          defaultValue={first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(-1)}>Cancel</button>
      </p>
    </div>
  );
}
