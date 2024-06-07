import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import players from "../assets/players.json";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack'

const PlayerRoom = () => {
  const [name, setName] = useState("");
  const [pSocket, setPSocket] = useState();
  const [waiting, setWaiting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const wait = new URLSearchParams(location.search).get('waiting');
    if (wait) setWaiting(wait === 'true' ? true : false);
  }, [location.search]);

  useEffect(() => {
    const playerSocket = io("http://localhost:2000/player", {
      path: "/myapp/socket.io",
    });

    playerSocket.on("connect", () => {
      console.log("Player connected:", playerSocket.id);
    });

    playerSocket.on("disconnect", () => {
      console.log("Player disconnected");
    });

    playerSocket.on("userWon", (data) => {
        enqueueSnackbar("You have Won the Game!",{success: 'true'})
        playerSocket.emit("clear")
        setTimeout(() => {
          navigate('/')
        }, 2000)
    })

    playerSocket.on("errMsg", (data) => {
      enqueueSnackbar(data, {variant: "error"})
    })

    playerSocket.on("waiting", (data) => {
      setWaiting(data);
    });
    setPSocket(playerSocket);
  }, []);

  const handlePlayerJoin = () => {
    const player = players.find((data) => data.name === name);
    if (!player) {
      enqueueSnackbar("No such player exists!", {variant: 'error'});
      return;
    }
    pSocket.emit("pJoin", {
      id: pSocket.id,
      name,
      defensiveSetSize: player.defenseSetLength,
    });

    pSocket.on("joinRoom", (data) => {
      const { id, player, attackerId, scoreBoard } = data;
      navigate(`/gameRoom/${data.room}`, {
        state: {
          attackId: attackerId,
          player,
          sb: scoreBoard,
        },
      });
    });
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', marginTop: '4rem' }}>
      <Box sx={{ padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        {!waiting ? (
          <>
            <Typography variant="h4" component="h2" gutterBottom>
              Enter Player Name
            </Typography>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              sx={{ marginBottom: '2rem' }}
              onChange={(e) => setName(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handlePlayerJoin}>
              Join
            </Button>
          </>
        ) : (
          <Typography variant="h4" component="h2" gutterBottom>
            In Lobby... Waiting for Game to Start
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default PlayerRoom;
