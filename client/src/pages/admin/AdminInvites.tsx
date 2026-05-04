import { useEffect, useState } from "react";

import { createAdminInvite, getAdminInvites } from "../../services/adminService";

type Invite = {
  id: string;
  email: string;
  name: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

const SUPER_ADMIN_EMAIL = "alfredmakura6@gmail.com";

export default function AdminInvites() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchInvites = async () => {
    setLoading(true);

    try {
      const data = await getAdminInvites();
      setInvites(data);
    } catch (error) {
      console.error("Failed to load invites:", error);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const data = await createAdminInvite({ email, name });
      const invite = data.invite as Invite;
      const inviteLink = `${window.location.origin}/register?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;

      setMessage(`Invite created for ${invite.email}. The link has been copied to your clipboard.`);
      setEmail("");
      setName("");
      await fetchInvites();

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      }
    } catch (error) {
      console.error("Failed to create invite:", error);
      setMessage("Could not create the invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <span className="section-chip">Admin access</span>
          <h1 className="page-title page-title-brand">
            <span className="brand-with-icon">
              <img src="/logo.png" alt="" aria-hidden="true" className="brand-icon" />
              <span>Admin invites</span>
            </span>
          </h1>
          <p className="page-subtitle">
            Only {SUPER_ADMIN_EMAIL} can create admin invitations and grant access to the panel.
          </p>
        </section>

        <div className="page-grid" style={{ gridTemplateColumns: "1fr" }}>
          <form className="info-card content-stack" onSubmit={handleSubmit}>
            <h2 className="info-title">Create invite</h2>
            <p className="muted-copy leading-7 text-slate-600">
              Send an invite link to someone who should join the admin panel.
            </p>

            <input
              className="register-input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              className="register-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button className="register-button" type="submit" disabled={submitting}>
              {submitting ? "Creating invite..." : "Create invite link"}
            </button>

            {message && <p className="info-copy">{message}</p>}
          </form>

          <section className="info-card content-stack">
            <h2 className="info-title">Recent invites</h2>

            {loading ? (
              <p className="muted-copy leading-7 text-slate-600">Loading invites...</p>
            ) : invites.length === 0 ? (
              <p className="muted-copy leading-7 text-slate-600">No invites have been created yet.</p>
            ) : (
              invites.map((invite) => {
                const inviteLink = `${window.location.origin}/register?invite=${invite.token}&email=${encodeURIComponent(invite.email)}`;

                return (
                  <article key={invite.id} className="application-card">
                    <div className="application-card-heading">
                      <div>
                        <h3 className="application-name">{invite.email}</h3>
                        <p className="application-email">{invite.name || "No name provided"}</p>
                      </div>
                      <div className="application-meta-row">
                        <span className="application-status-pill application-status-pending">
                          {invite.usedAt ? "Accepted" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="application-body">
                      <p className="application-copy">{inviteLink}</p>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
