import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  Paper,
} from "@mui/material";
import { useNavigate } from 'react-router-dom'

const AdminRoom = () => {
  const [players, setPlayers] = useState([]);
  const [gameStart, setGameStart] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [reportData, setReportData] = useState([])
  const navigate = useNavigate();
  useEffect(() => {
    const adminSocket = io("http://localhost:2000/admin", {
      path: "/myapp/socket.io",
    });

    adminSocket.on("connect", () => {
      console.log("Admin connected:", adminSocket.id);
    });

    adminSocket.on("joinedPlayers", (data) => {
      setPlayers(data);
    });

    adminSocket.on("disconnect", () => {
      console.log("Admin disconnected");
    });

    adminSocket.on("gameEnd", (data) => {
      setGameStart(data);
    });

    adminSocket.on("userWon", (data) => {
      setWinnerName(data.name);
      setReportData([...data.reportData])
      adminSocket.emit("clear")
    });

    return () => {
      adminSocket.disconnect();
    };
  }, []);

  const handleStartGame = async () => {
    try {
      const response = await axios.get("http://localhost:2000/startGame");
      setGameStart(true);
    } catch (err) {
      console.log(err, "what is error");
    }
  };

  return !winnerName ? (
    <Container maxWidth="md" sx={{ textAlign: "center", marginTop: "4rem" }}>
      <Box
        sx={{
          padding: "2rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Players Joined: {players.length}
        </Typography>
        {players.length > 0 && (
          <Paper elevation={3} sx={{ padding: "1rem", marginBottom: "1rem" }}>
            <Typography variant="h5" component="h3">
              Player Names
            </Typography>
            <List>
              {players.map((data, index) => (
                <ListItem key={index}>{data.name}</ListItem>
              ))}
            </List>
          </Paper>
        )}
        {players.length % 2 === 0 && players.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            disabled={gameStart}
            onClick={handleStartGame}
          >
            Start Game
          </Button>
        )}
      </Box>
    </Container>
  ) : (
    <Container maxWidth="md" sx={{ textAlign: "center", marginTop: "4rem" }}>
      <Box
        sx={{
          padding: "0.1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      ></Box>
      <Paper elevation={3} sx={{ padding: "1rem", marginBottom: "1rem" }}>
        <Typography variant="h4" component="h3">
          {winnerName} has Won the game
        </Typography>
          {
            reportData.length > 0 && 
            reportData.map((data) => (
              <Typography variant="h6" component="h3">
                {data}
              </Typography>
            ))
          }
      </Paper>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
         Go to Dashboard
      </Button>
    </Container>
  );
};

export default AdminRoom;
