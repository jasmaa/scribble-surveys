import style from './style.module.css';

export default function Home() {
  return (
    <div>
      <div className={`${style['section']} ${style['section-primary']}`}>
        <h1 className="mb-5">Welcome to Scribble Surveys!</h1>
        <a className="btn btn-primary" href="/surveys">Take surveys</a>
      </div>
      <div className={`${style['section']} ${style['section-secondary']}`}>
        <h1 className="mb-5">Create surveys and export submissions</h1>
        <div>
          <a className="btn btn-info mx-1" href="/create">Create</a>
          <a className="btn btn-success mx-1" href="/export">Export</a>
        </div>
      </div>
    </div>
  );
}