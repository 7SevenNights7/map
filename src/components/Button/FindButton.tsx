import s from './FindButton.module.scss';

interface ButtonProps {
	onClick: () => void;
	children: string;
}

export default function FindButton({ onClick, children }: ButtonProps) {
	return (
		<button onClick={onClick} className={s.button}>
			{children}
		</button>
	);
}
