export const checkAuthToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("checkAuthToken: No token found, redirecting to login.");
        window.location.href = "/auth";
    }
}