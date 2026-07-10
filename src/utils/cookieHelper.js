export const setSSOCookie = (name, value, days = 7) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	const hostname = window.location.hostname;
	const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

	let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
	if (!isLocal) {
		cookieString += `; domain=.pro-invest.pe`;
	}
	document.cookie = cookieString;
};

export const getSSOCookie = (name) => {
	const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
	if (match) return decodeURIComponent(match[2]);
	return null;
};

export const removeSSOCookie = (name) => {
	const hostname = window.location.hostname;
	const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
	let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
	if (!isLocal) {
		cookieString += `; domain=.pro-invest.pe`;
	}
	document.cookie = cookieString;
};
