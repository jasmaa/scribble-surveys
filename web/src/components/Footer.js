export default function Footer() {
  return (
    <footer className="py-4" style={{ color: 'gray', backgroundColor: 'black' }}>
      <div className="container">
        <div className="row">
          <div className="col-8">
            <h5>Scribble Surveys</h5>
            <p>Fast surveys for collecting drawings</p>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <div>
              <h5>Links</h5>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/surveys">Surveys</a></li>
                <li><a href="/create">Create</a></li>
                <li><a href="/export">Export</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}