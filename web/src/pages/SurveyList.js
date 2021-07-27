import { useEffect, useState } from 'react';
import client from '../client';

export default function SurveyList() {

  const [surveys, setSurveys] = useState(null);

  useEffect(() => {
    const getSurveys = async () => {
      try {
        const res = await client.get('/survey');
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
    <div>
      <ul>
        {surveys.map(survey => (
          <li>
            <a href={`/survey/${survey.surveyID}`}>{survey.surveyID}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}