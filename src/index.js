import 'regenerator-runtime'

import React from 'react'
import * as ReactDOM from 'react-dom'
import App from './comps/app'
import connect from './services/connection'

ReactDOM.render(<App />, document.getElementById('app'))
connect()
