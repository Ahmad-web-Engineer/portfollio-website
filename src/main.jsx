import {createRoot} from 'react-dom/client'
import App,{Boundary} from './App'
createRoot(document.getElementById('root')).render(<Boundary><App/></Boundary>)
