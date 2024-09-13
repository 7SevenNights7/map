import { MarkerData } from '../../types/marker';
import FindButton from '../Button/FindButton';

import s from './MarkerCard.module.scss';

interface MarkerCardProps {
	marker?: MarkerData;
	variant?: 'editing' | 'default';
	description?: string;
	setDescription?: (value: string) => void;
	category?: string;
	setCategory?: (value: string) => void;
	handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	saveMarker?: () => void;
}

export default function MarkerCard({
	marker,
	variant = 'default',
	description,
	setDescription,
	category,
	setCategory,
	handleImageUpload,
	saveMarker,
}: MarkerCardProps) {
	return (
		<div className={s.container}>
			{variant === 'default' && marker && (
				<>
					<h3 className={s.title}>{marker.category}</h3>
					<span className={s.description}>{marker.description}</span>
					{marker.image && (
						<div className={s.imageWrapper}>
							<img className={s.image} src={marker.image} alt="uploaded" />
						</div>
					)}
				</>
			)}
			{variant === 'editing' && setDescription && setCategory && (
				<>
					<h3 className={s.title}>
						{marker ? 'Edit marker' : 'Create marker'}
					</h3>
					<input
						className={s.inputText}
						type="text"
						placeholder="Place description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<div className={s.imageActions}>
						<span>Select category:</span>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							<option value="All">All</option>
							<option value="Sight">Sight</option>
							<option value="Restaurant">Restaurant</option>
							<option value="Nature">Nature</option>
							<option value="Others">Others</option>
						</select>
					</div>

					<div className={s.imageActions}>
						<span>Upload image:</span>
						<label className={s.fileActions}>
							{marker?.image ? 'Change file' : 'Select file'}
							<input
								className={s.inputFile}
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								placeholder="Select file"
							/>
						</label>
					</div>
					<button
						className={s.button}
						onClick={saveMarker}
						onMouseUp={(e) => e.preventDefault()}
					>
						{marker ? 'Save changes' : 'Save'}
					</button>
				</>
			)}
		</div>
	);
}
