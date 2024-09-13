import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Map from './pages/Map';

export default function Router() {
	return (
		<Routes>
			<Route index element={<LoginPage />} />
			<Route path="map" element={<Map />} />
		</Routes>
	);
}
