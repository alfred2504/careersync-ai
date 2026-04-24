export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="p-6">
      <h1>Welcome, {user?.name} 👋</h1>
      <p>This is your dashboard</p>
    </div>
  );
}