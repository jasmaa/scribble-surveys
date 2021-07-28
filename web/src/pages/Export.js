import { useState } from 'react';
import Flash from 'components/Flash';
import client from 'client';
import * as FileDownload from 'js-file-download';

export default function Export() {

  const [surveyID, setSurveyID] = useState('')
  const [secretToken, setSecretToken] = useState('');
  const [messages, setMessages] = useState([]);

  const downloadArchive = async evt => {
    evt.preventDefault();
    try {
      const res = await client.get(`/surveys/${surveyID}/export`, {
        params: { 'secretToken': secretToken },
        responseType: 'blob',
      });
      const fnameRe = /attachment; filename=\"(.+)\"/;
      const matches = res.headers['content-disposition'].match(fnameRe);
      const fname = matches[1] || 'submission.zip'
      FileDownload(res.data, fname);
    } catch (err) {
      const msg = JSON.parse(await err.response.data.text());
      setMessages([{
        type: 'error',
        message: msg.error,
      }])
    }
  }

  return (
    <div>
      <h1 className="mb-3">Export Submissions</h1>

      <Flash messages={messages} />

      <form onSubmit={downloadArchive}>
        <div className="form-group mb-3">
          <label for="surveyIDInput">Survey ID</label>
          <input id="surveyIDInput" className="form-control" type="text" onChange={evt => setSurveyID(evt.target.value)} />
        </div>
        <div className="form-group mb-3">
          <label for="secretTokenInput">Secret Token</label>
          <input id="secretTokenInput" className="form-control" type="password" onChange={evt => setSecretToken(evt.target.value)} />
        </div>
        <button className="btn btn-success" type="submit">Export</button>
      </form>
    </div>
  );

}