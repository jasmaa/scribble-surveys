import Demo from './Demo';
import style from './style.module.css';

export default function Home() {
  return (
    <div>
      <div className={`${style['section']} ${style['section-primary']}`}>
        <h1 className="text-center mb-3">Welcome to Scribble Surveys!</h1>
        <h5 className="text-center">Fast surveys for collecting drawings</h5>
        <Demo timeDelta={50} />
      </div>
      <div className={`${style['section']} ${style['section-secondary']}`}>
        <h1 className="mb-5">Get Started</h1>
        <div>
          <a className="btn btn-primary mx-1" href="/surveys">Take Surveys</a>
          <a className="btn btn-info mx-1" href="/create">Create a Survey</a>
        </div>
      </div>
    </div>
  );
}