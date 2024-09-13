import React from 'react';

import './style/global.scss';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Router />
		</BrowserRouter>
	);
};

export default App;
