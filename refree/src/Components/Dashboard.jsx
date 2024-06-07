import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', marginTop: '4rem' }}>
            <Box sx={{ padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to the Ping Pong Game.
                </Typography>
                <Stack  justifyContent="center" alignItems="center">
                    <Button variant="contained" color="primary" sx={{ marginTop: '2rem' }} onClick={() => navigate('/admin')}>
                        Join Admin
                    </Button>
                    <Button variant="contained" color="primary" sx={{ marginTop: '2rem' }} onClick={() => navigate('/player')}>
                        Join Player
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
}

export default Dashboard;
