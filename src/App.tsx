import React, { useState, useEffect, useRef } from 'react';
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression, LatLng } from 'leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Иконка для маркеров
const customMarker = new L.Icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Тип данных для метки
interface MarkerData {
	position: LatLngExpression;
	description: string;
	category: string;
	image?: string | null;
	createdAt: string; // Дата создания метки
}

const AddMarkerToClick = ({
	addMarker,
}: {
	addMarker: (latlng: LatLng) => void;
}) => {
	useMapEvents({
		click(e) {
			addMarker(e.latlng);
		},
	});
	return null;
};

const App: React.FC = () => {
	const initialMarkers = () => {
		const savedMarkers = localStorage.getItem('markers');
		return savedMarkers ? JSON.parse(savedMarkers) : [];
	};

	const [markers, setMarkers] = useState<MarkerData[]>(initialMarkers);
	const [selectedMarker, setSelectedMarker] = useState<LatLngExpression | null>(
		null
	);
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('Достопримечательность');
	const [filter, setFilter] = useState('Все');
	const [image, setImage] = useState<string | null>(null);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState(''); // Поле для текста поиска

	const mapRef = useRef<any>(null); // Ссылка на карту для доступа к методам карты

	const position: LatLngExpression = [51.1694, 71.4491];

	// Сохраняем метки в LocalStorage при каждом обновлении markers
	useEffect(() => {
		localStorage.setItem('markers', JSON.stringify(markers));
	}, [markers]);

	// Функция для добавления метки
	const addMarker = (latlng: LatLng) => {
		setSelectedMarker(latlng);
		setEditingIndex(null);
		setDescription('');
		setCategory('Достопримечательность');
		setImage(null);
	};

	// Функция для сохранения новой метки или обновления существующей
	const saveMarker = () => {
		if (selectedMarker && description && category) {
			const newMarker: MarkerData = {
				position: selectedMarker,
				description,
				category,
				image,
				createdAt: new Date().toLocaleString(), // Дата создания
			};
			if (editingIndex !== null) {
				const updatedMarkers = [...markers];
				updatedMarkers[editingIndex] = newMarker;
				setMarkers(updatedMarkers);
			} else {
				setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
			}
			setSelectedMarker(null);
			setDescription('');
			setCategory('Достопримечательность');
			setImage(null);
			setEditingIndex(null);
		}
	};

	// Обработчик для загрузки изображения
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// Функция для редактирования метки
	const editMarker = (index: number) => {
		const marker = markers[index];
		setSelectedMarker(marker.position);
		setDescription(marker.description);
		setCategory(marker.category);
		setImage(marker.image || null);
		setEditingIndex(index);
		flyToMarker(marker.position); // Центрируем карту на выбранной метке
	};

	// Функция для удаления метки
	const deleteMarker = (index: number) => {
		const updatedMarkers = markers.filter((_, i) => i !== index);
		setMarkers(updatedMarkers);
	};

	// Фильтр меток по категории и текстовому запросу
	const filteredMarkers = markers.filter(
		(marker) =>
			(filter === 'Все' || marker.category === filter) &&
			marker.description.toLowerCase().includes(searchQuery.toLowerCase()) // Фильтрация по описанию
	);

	// Функция для центрирования карты на выбранной метке
	const flyToMarker = (position: LatLngExpression) => {
		if (mapRef.current) {
			mapRef.current.flyTo(position, 15);
		}
	};

	return (
		<div style={{ display: 'flex', height: '100vh' }}>
			{/* Панель управления метками */}
			<div
				style={{
					width: '300px',
					overflowY: 'auto',
					backgroundColor: '#f7f7f7',
					padding: '10px',
				}}
			>
				<h3>Метки</h3>
				{/* Поле для поиска */}
				<input
					type="text"
					placeholder="Поиск по описанию..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{ width: '100%', marginBottom: '10px' }}
				/>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th>Описание</th>
							<th>Категория</th>
							<th>Дата</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredMarkers.map((marker, index) => (
							<tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
								<td>{marker.description}</td>
								<td>{marker.category}</td>
								<td>{marker.createdAt}</td>
								<td>
									<button onClick={() => editMarker(index)}>✏️</button>
									<button onClick={() => deleteMarker(index)}>🗑️</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Карта */}
			<div style={{ flex: 1 }}>
				<MapContainer
					center={position}
					zoom={13}
					style={{ height: '100%' }}
					ref={mapRef} // Привязываем карту к ссылке
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>

					<AddMarkerToClick addMarker={addMarker} />

					{filteredMarkers.map((marker, index) => (
						<Marker key={index} position={marker.position} icon={customMarker}>
							<Popup>
								<b>{marker.category}</b>
								<br />
								{marker.description}
								<br />
								{marker.image && (
									<img
										src={marker.image}
										alt="uploaded"
										style={{ width: '100px', height: '100px' }}
									/>
								)}
							</Popup>
						</Marker>
					))}

					{selectedMarker && (
						<Marker position={selectedMarker} icon={customMarker}>
							<Popup>
								<div>
									<h3>
										{editingIndex !== null
											? 'Редактировать метку'
											: 'Добавить новое место'}
									</h3>
									<input
										type="text"
										placeholder="Описание места"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
									<br />
									<label>
										Категория:
										<select
											value={category}
											onChange={(e) => setCategory(e.target.value)}
										>
											<option value="Достопримечательность">
												Достопримечательность
											</option>
											<option value="Ресторан">Ресторан</option>
											<option value="Природа">Природа</option>
										</select>
									</label>
									<br />
									<label>
										Загрузить изображение:
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
										/>
									</label>
									<br />
									<button onClick={saveMarker}>
										{editingIndex !== null
											? 'Сохранить изменения'
											: 'Сохранить метку'}
									</button>
								</div>
							</Popup>
						</Marker>
					)}
				</MapContainer>
			</div>
		</div>
	);
};

export default App;
