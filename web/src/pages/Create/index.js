import { useState } from "react";
import Flash from "components/Flash";
import Done from "./Done";
import client from "client";

export default function Create() {

  const [title, setTitle] = useState('My title');
  const [numQuestions, setNumQuestions] = useState(5);
  const [classes, setClasses] = useState(['dog', 'cat']);
  const [currClass, setCurrClass] = useState('');
  const [exitMessage, setExitMessage] = useState('Have a nice day!');
  const [messages, setMessages] = useState([]);
  const [doneData, setDoneData] = useState(null);

  const createSurvey = async evt => {
    evt.preventDefault();

    const params = new URLSearchParams();
    params.append('classes', JSON.stringify(classes));
    params.append('numQuestions', numQuestions)
    params.append('title', title);

    try {
      const res = await client.post('/surveys', params);
      setDoneData(res.data);
    } catch (err) {
      const msg = err.response.data;
      setMessages([{
        type: 'error',
        message: msg.error,
      }]);
    }
  }

  const addClass = evt => {
    evt.preventDefault()
    setClasses(prev => {
      setCurrClass('');
      return [...prev, currClass];
    });
  }

  const removeClass = i => {
    return evt => {
      evt.preventDefault();
      setClasses(prev => {
        const newClasses = [...prev];
        newClasses.splice(i, 1);
        return newClasses;
      });
    }
  }

  if (doneData) {
    return <Done surveyID={doneData.surveyID} secretToken={doneData.secretToken} />
  }

  return (
    <div className="container">
      <h1 className="my-4">Create Survey</h1>

      <Flash messages={messages} />

      <div>
        <div className="form-group mt-4">
          <h3>Title</h3>
          <input className="form-control" value={title} onChange={evt => setTitle(evt.target.value)} />
        </div>

        <div className="form-group mt-4">
          <h3>Classes</h3>
          {
            classes.map((v, i) => (
              <div key={`class-${i}`} className="d-flex align-items-center mb-3">
                <input disabled className="form-control" style={{ marginRight: '0.5em' }} value={v} />
                <button className="btn btn-danger" onClick={removeClass(i)}>-</button>
              </div>
            ))
          }
          <form className="d-flex align-items-center mb-3" onSubmit={addClass}>
            <input
              className="form-control"
              style={{ marginRight: '0.5em' }}
              value={currClass}
              onChange={evt => setCurrClass(evt.target.value)}

            />
            <button className="btn btn-primary">+</button>
          </form>
        </div>

        <div className="form-group mt-4">
          <h3># of Questions</h3>
          <input className="form-control" value={numQuestions} onChange={evt => setNumQuestions(evt.target.value)} />
        </div>

        <div className="form-group mt-4">
          <h3>Exit message</h3>
          <input className="form-control" value={exitMessage} onChange={evt => setExitMessage(evt.target.value)} />
        </div>

        <button className="btn btn-success mt-4" onClick={createSurvey}>Create</button>
      </div>
    </div>
  );
}