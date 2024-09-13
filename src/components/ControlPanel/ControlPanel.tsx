import { LatLngExpression } from 'leaflet';
import s from './ControlPanel.module.scss';
import { MarkerData } from '../../types/marker';
import FindButton from '../Button/FindButton';

interface ControlPanelProps {
	filteredMarkers: MarkerData[];
	setSearchQuery: (value: string) => void;
	searchQuery: string;
	editMarker: (value: number) => void;
	deleteMarker: (value: number) => void;
	flyToMarker: (value: LatLngExpression) => void;
	filter: string;
	setFilter: (value: string) => void;
	locateUser: () => void;
}

export default function ControlPanel({
	setSearchQuery,
	searchQuery,
	filteredMarkers,
	editMarker,
	deleteMarker,
	flyToMarker,
	filter,
	setFilter,
	locateUser,
}: ControlPanelProps) {
	return (
		<div className={s.container}>
			<h3>Markers</h3>
			<input
				type="text"
				placeholder="Search by description..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				style={{ width: '100%', marginBottom: '10px' }}
			/>
			<select
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				style={{ width: '100%', marginBottom: '10px' }}
			>
				<option value="All">All</option>
				<option value="Sight">Sight</option>
				<option value="Restaurant">Restaurant</option>
				<option value="Nature">Nature</option>
				<option value="Others">Others</option>
			</select>
			<div className={s.cards}>
				{filteredMarkers.map((marker, index) => (
					<div
						key={index}
						className={s.card}
						onClick={() => flyToMarker(marker.position)}
					>
						<span className={s.cardTitle}>{marker.description}</span>
						<div className={s.cardActions}>
							<button
								onClick={(event) => {
									event.stopPropagation();
									editMarker(index);
								}}
							>
								✏️
							</button>
							<button
								onClick={(event) => {
									event.stopPropagation();
									deleteMarker(index);
								}}
							>
								🗑️
							</button>
						</div>
					</div>
				))}
			</div>
			<FindButton onClick={locateUser}>Find me!</FindButton>
		</div>
	);
}
