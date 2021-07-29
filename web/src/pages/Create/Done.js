import * as FileDownload from 'js-file-download';
import { useState } from 'react';

export default function Done({ surveyID, secretToken }) {

  const [secretTokenInputType, setSecretTokenInputType] = useState('password');

  const downloadCredentials = () => {
    FileDownload(JSON.stringify({ surveyID, secretToken }, null, 2), 'credentials.json');
  }

  const copySecretToken = evt => {
    const el = document.getElementById('secretTokenInput');
    el.type = 'text';
    el.select();
    document.execCommand('copy');
    el.type = 'password';
  }

  return (
    <div className="container">
      <div className="row">
        <div className="d-flex flex-column align-items-center">
          <h1 className="my-4">Survey successfully created!</h1>
          <p>Please copy or download your credentials:</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 offset-lg-3 my-4">
          <div className="form-group">
            <label htmlFor="surveyIDInput">Survey ID</label>
            <input id="surveyIDInput" className="form-control" value={surveyID} />
          </div>
          <div className="form-group mt-4">
            <label htmlFor="secretTokenInput">Secret Token</label>

            <div className="input-group">
              <input
                id="secretTokenInput"
                className="form-control"
                type={secretTokenInputType}
                value={secretToken}
                onMouseOver={evt => {
                  setSecretTokenInputType('text');
                }}
                onMouseOut={evt => {
                  setSecretTokenInputType('password');
                }}
                onClick={copySecretToken}
              />
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" onClick={copySecretToken}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="d-flex flex-column align-items-center mt-4">
          <button className="btn btn-primary" onClick={downloadCredentials}>Download</button>
        </div>
      </div>
    </div>
  );
}