import { LatLngExpression } from 'leaflet';

export interface MarkerData {
	position: LatLngExpression;
	description: string;
	category: string;
	image?: string | null;
	createdAt: string;
}
