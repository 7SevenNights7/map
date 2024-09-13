import s from './Map.module.scss';

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
import ControlPanel from '../../components/ControlPanel';

import userIconImg from '../../assets/userPng.png';

import FindButton from '../../components/Button';
import MarkerCard from '../../components/MarkerCard';
import { MarkerData } from '../../types/marker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { spawn } from 'child_process';
import LogoutIcon from '../../assets/icon/LogoutIcon';
import USerIcon from '../../assets/icon/USerIcon';

const customMarker = new L.Icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const userIcon = new L.Icon({
	iconUrl: userIconImg,
	iconSize: [30, 50],
	iconAnchor: [15, 50],
	popupAnchor: [0, -40],
});

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

interface MapProps {}

export default function Map({}: MapProps) {
	const initialMarkers = () => {
		const savedMarkers = localStorage.getItem('markers');
		return savedMarkers ? JSON.parse(savedMarkers) : [];
	};

	const [markers, setMarkers] = useState<MarkerData[]>(initialMarkers);
	const [selectedMarker, setSelectedMarker] = useState<LatLngExpression | null>(
		null
	);
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('All');
	const [filter, setFilter] = useState('All');
	const [image, setImage] = useState<string | null>(null);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [userLocation, setUserLocation] = useState<LatLngExpression | null>(
		null
	);

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const username = useSelector((state: RootState) => state.auth.username);

	const mapRef = useRef<any>(null);
	const markerRefs = useRef<(L.Marker | null)[]>([]);

	const position: LatLngExpression = [51.1694, 71.4491];

	useEffect(() => {
		localStorage.setItem('markers', JSON.stringify(markers));
	}, [markers]);

	const handleLogout = () => {
		// Удаляем данные пользователя из localStorage
		localStorage.removeItem('username');
		localStorage.removeItem('password');
		// Диспатчим действие выхода
		dispatch(logout());
		navigate('/');
	};

	const addMarker = (latlng: LatLng) => {
		setSelectedMarker(latlng);
		setEditingIndex(null);
		setDescription('');
		setCategory('All');
		setImage(null);
		setIsEditing(true);
	};

	const locateUser = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					console.log(position.coords);
					const userLatLng: LatLngExpression = [latitude, longitude];
					setUserLocation(userLatLng);
					flyToMarker(userLatLng);
				},
				(error) => {
					alert('Failed to get user location:');
				}
			);
		} else {
			alert('Geolocation is not supported by your browser');
		}
	};

	const saveMarker = () => {
		if (selectedMarker && description && category) {
			const newMarker: MarkerData = {
				position: selectedMarker,
				description,
				category,
				image,
				createdAt: new Date().toLocaleString(),
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
			setCategory('Sight');
			setImage(null);
			setEditingIndex(null);
			setIsEditing(false);
		}
	};

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

	const editMarker = (index: number) => {
		const marker = markers[index];
		setSelectedMarker(marker.position);
		setDescription(marker.description);
		setCategory(marker.category);
		setImage(marker.image || null);
		setEditingIndex(index);
		setIsEditing(true);
		flyToMarker(marker.position);

		const markerRef = markerRefs.current[index];
		if (markerRef) {
			markerRef.openPopup();
		}
		console.log(marker.position);
	};

	const deleteMarker = (index: number) => {
		const updatedMarkers = markers.filter((_, i) => i !== index);
		setMarkers(updatedMarkers);
	};

	const filteredMarkers = markers.filter(
		(marker) =>
			(filter === 'All' || marker.category === filter) &&
			marker.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const flyToMarker = (position: LatLngExpression) => {
		if (mapRef.current) {
			mapRef.current.flyTo(position, 15);
		}
	};
	return (
		<div className={s.container}>
			<ControlPanel
				deleteMarker={deleteMarker}
				editMarker={editMarker}
				filteredMarkers={filteredMarkers}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				flyToMarker={flyToMarker}
				filter={filter}
				setFilter={setFilter}
				locateUser={locateUser}
			/>

			<div style={{ flex: 1 }}>
				<MapContainer
					center={position}
					zoom={13}
					style={{ height: '100%' }}
					ref={mapRef}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>

					<AddMarkerToClick addMarker={addMarker} />

					{filteredMarkers.map((marker, index) => (
						<Marker
							key={index}
							position={marker.position}
							icon={customMarker}
							ref={(ref) => (markerRefs.current[index] = ref)}
						>
							<Popup>
								{isEditing && editingIndex === index ? (
									<MarkerCard
										marker={marker}
										variant="editing"
										saveMarker={saveMarker}
										category={category}
										description={description}
										handleImageUpload={handleImageUpload}
										setCategory={setCategory}
										setDescription={setDescription}
									/>
								) : (
									<MarkerCard marker={marker} />
								)}
							</Popup>
						</Marker>
					))}

					{selectedMarker && isEditing && (
						<Marker position={selectedMarker} icon={customMarker}>
							<Popup>
								<MarkerCard
									variant="editing"
									saveMarker={saveMarker}
									category={category}
									description={description}
									handleImageUpload={handleImageUpload}
									setCategory={setCategory}
									setDescription={setDescription}
								/>
							</Popup>
						</Marker>
					)}
					{userLocation && (
						<Marker position={userLocation} icon={userIcon}>
							<Popup>User Location</Popup>
						</Marker>
					)}
				</MapContainer>
				<div className={s.header}>
					<USerIcon width={25} height={25} />
					<span>{username}</span>
					<button onClick={handleLogout} className={s.exitButton}>
						<LogoutIcon width={25} height={25} />
					</button>
				</div>
			</div>
		</div>
	);
}
