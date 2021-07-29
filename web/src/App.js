import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from 'components/Footer';
import Home from './pages/Home';
import SurveyList from './pages/SurveyList';
import Survey from './pages/Survey';
import Create from 'pages/Create';
import Export from './pages/Export';
import './App.css';

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '35em' }}>
        <Router>
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-4 offset-lg-4">
                <Switch>
                  <Route exact path="/surveys" component={SurveyList} />
                  <Route exact path="/surveys/:surveyID" render={props => <Survey key={props.match.params.surveyID} />} />
                  <Route exact path="/create" component={Create} />
                  <Route exact path="/export" component={Export} />
                </Switch>
              </div>

            </div>
          </div>
          <Route exact path="/" component={Home} />
        </Router>
      </div>
      <Footer />
    </div>
  );
}

export default App;
