export default function Done({ exitMessage }) {
  return (
    <div>
      <h1>{exitMessage}</h1>
      <p>You may now close this page or take <a href="/surveys">another survey</a>.</p>
    </div>
  );
}