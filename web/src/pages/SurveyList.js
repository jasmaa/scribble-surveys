import { useEffect, useState } from 'react';
import client from 'client';

export default function SurveyList() {

  const [surveys, setSurveys] = useState(null);

  useEffect(() => {
    const getSurveys = async () => {
      try {
        const res = await client.get('/surveys');
        setSurveys(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    getSurveys()
  }, []);

  if (!surveys) {
    return <p>Loading...</p>
  }

  return (
    <div className="container">
      <h1 className="my-4">All Surveys</h1>
      <ul>
        {surveys.map(survey => (
          <li>
            <a href={`/surveys/${survey.surveyID}`}>{survey.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}