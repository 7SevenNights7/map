import { useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';
import { useNavigate } from 'react-router-dom';

import s from './LoginPage.module.scss';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

interface LoginPageProps {}

export default function LoginPage({}: LoginPageProps) {
	const [isRegister, setIsRegister] = useState(false); // Переключатель между входом и регистрацией
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleToggle = () => {
		setIsRegister(!isRegister);
		setUsername('');
		setPassword('');
	};

	const handleSubmit = () => {
		if (isRegister) {
			// Регистрация
			if (username && password) {
				// Сохраняем новые данные пользователя в localStorage
				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(password, salt);
				localStorage.setItem('username', username);

				localStorage.setItem('password', hashedPassword);
				alert('Registration successful! You can now log in.');
				setIsRegister(false);
				setUsername('');
				setPassword('');
			} else {
				alert('Please fill out all fields.');
			}
		} else {
			// Вход
			const storedUsername = localStorage.getItem('username');
			const storedHashedPassword = localStorage.getItem('password');

			if (storedUsername && storedHashedPassword) {
				if (
					username === storedUsername &&
					bcrypt.compareSync(password, storedHashedPassword)
				) {
					dispatch(login({ username }));
					alert('Successful login!');
					navigate('/map');
				} else {
					alert('Invalid login or password.');
				}
			} else {
				alert('User not found. Please register.');
			}
		}
	};

	return (
		<div className={s.login}>
			<h2>{isRegister ? 'Registration' : 'Login'}</h2>
			<input
				className={s.inputText}
				type="text"
				placeholder="Login"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				className={s.inputText}
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button className={s.button} onClick={handleSubmit}>
				{isRegister ? 'Registration' : 'Login'}
			</button>
			<p className={s.switch}>
				{isRegister ? 'Already have an account?' : "Don't have an account?"}
				<span className={s.link} onClick={handleToggle}>
					{isRegister ? 'Login' : 'Registration'}
				</span>
			</p>
		</div>
	);
}
