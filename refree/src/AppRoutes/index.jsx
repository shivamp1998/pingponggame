import React from 'react';
import { useRoutes } from 'react-router-dom';
import AdminRoom from '../Components/AdminRoom';
import PlayerRoom from '../Components/PlayerRoom';
import Dashboard from '../Components/Dashboard';
import GameRoom from '../Components/GameRoom';
import FullScreenLayout from '../Components/FullScreenLayout';

const Routes = [
    {
        path: '/',
        element: <Dashboard />,
    },
    {
        element: <FullScreenLayout />,
        children: [
            {
                path: 'admin',
                element: <AdminRoom />
            },
            {
                path: 'player',
                element: <PlayerRoom />
            },
            {
                path: 'gameRoom/:id',
                element: <GameRoom />
            }
        ]
    }
];

const AppRoutes = () => {
    return useRoutes(Routes);
};

export default AppRoutes;
