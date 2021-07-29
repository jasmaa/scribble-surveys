import Demo from './Demo';
import style from './style.module.css';

export default function Home() {
  return (
    <div>
      <div className={`${style['section']} ${style['section-primary']}`}>
        <h1 className="text-center display-1 mb-4">Welcome to Scribble Surveys!</h1>
        <h5 className="text-center display-6">Fast surveys for collecting drawings</h5>
        <div style={{ marginTop: '5em' }}>
          <Demo timeDelta={50} />
        </div>
      </div>
      <div className={`${style['section']} ${style['section-secondary']}`}>
        <h1 className="display-3 mb-5">Get Started</h1>
        <div>
          <a className="btn btn-primary mx-2" href="/surveys">Take Surveys</a>
          <a className="btn btn-info mx-2" href="/create">Create a Survey</a>
        </div>
      </div>
    </div>
  );
}