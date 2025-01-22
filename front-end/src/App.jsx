import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import '../node_modules/bulma/css/bulma.css'
import Home from './Home'
import NotFound from './NotFound';
import About from './About'

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/about' Component={About} />
        <Route path='*' Component={NotFound} />
      </Routes>
    </Router>
  )
}

export default App
