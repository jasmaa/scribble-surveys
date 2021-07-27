import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from './pages/Home';
import SurveyList from './pages/SurveyList';
import Survey from './pages/Survey';
import './App.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/surveys" component={SurveyList} />
        <Route exact path="/surveys/:surveyID" render={props => <Survey key={props.match.params.surveyID} />} />
        <Route exact path="/" component={Home} />
      </Switch>
    </Router>
  );
}

export default App;
