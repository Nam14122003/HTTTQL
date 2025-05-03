import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <form>
            {/* ...existing form fields... */}
            <div>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            {/* ...existing code... */}
        </form>
    );
};

export default Login;