import React from 'react';
import { Outlet } from 'react-router-dom';

const FullScreenLayout = () => {
    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <Outlet />
        </div>
    );
}

export default FullScreenLayout;