import { Navigate, Outlet, useLocation } from "react-router-dom";

const LOGIN_PATH = "/";
const TOKEN_KEY = "adminToken";
const EMAIL_KEY = "adminEmail";


function getValidToken() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const { exp } = JSON.parse(atob(base64));

        if (!exp || exp * 1000 > Date.now()) return token;
    } catch {

    }


    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    return null;
}

function PrivateRoute({ children }) {
    const location = useLocation();

    if (!getValidToken()) {        
        return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
    }

    return children ?? <Outlet />;
}

export default PrivateRoute;