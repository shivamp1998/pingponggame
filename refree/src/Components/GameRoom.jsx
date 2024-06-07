import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useSnackbar } from 'notistack'

const GameRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { player, attackId, sb } = location.state;
  const [defenseArray, setDefenseArray] = useState([]);
  const [attackNo, setAttackNo] = useState();
  const [attackerId, setAttackerId] = useState();
  const [points, setPoints] = useState();
  const [scoreBoard, setScoreBoard] = useState({});
  const [winner, setWinner] = useState(null);
  const [socket, setSocket] = useState();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setAttackerId(attackId);
  }, [attackId]);

  useEffect(() => {
    setScoreBoard(sb);
  }, [sb]);

  useEffect(() => {
    const playerSocket = io("http://localhost:2000", {
      path: "/myapp/socket.io",
    });
    playerSocket.on("connect", (socket) => {
      console.log("Room Socket connected");
    });
    playerSocket.emit("roomJoin", id);
    playerSocket.on("attack", (data) => {
      setAttackNo(data.attackValue);
      setAttackerId(data.attackerId);
    });
    playerSocket.on("defend", (data) => {
      setDefenseArray(data.defenseArray);
    });

    playerSocket.on("changeAttacker", (data) => {
      setTimeout(() => {
        setAttackerId(data);
        setAttackNo(null);
        setDefenseArray([]);
      }, 2000);
    });
    playerSocket.on("noChange", (data) => {
      setTimeout(() => {
        setAttackNo(null);
        setDefenseArray([]);
      }, 2000);
    });
    playerSocket.on("scoreBoard", (data) => {
      setScoreBoard(data);
    });
    playerSocket.on("winner", (data) => {
      setTimeout(() => {
        setWinner(data);
        if (player.name !== data) {
          playerSocket.emit("removePlayer", player);
          playerSocket.emit("addReport", `${player.name} has lost`)
        } else {
          playerSocket.emit("pJoin", {
            id: player.id,
            name: player.name,
            defensiveSetSize: player.defenseSetLength,
          });
          playerSocket.emit("admin", {eventName: "gameEnd", Message: false});
          playerSocket.emit("checkWin")
          playerSocket.emit("addReport", `${player.name} has Won`)
          navigate("/player?waiting=true");
        }
      }, 1000);
    });
    setSocket(playerSocket);
  }, []);

  const handleAttack = async () => {
    const response = await axios.get("http://localhost:2000/attack");
    setAttackNo(response.data.data);
    socket.emit("sendRoomMessage", {
      roomName: id,
      eventName: "attack",
      message: { attackValue: response.data.data, attackerId: player.id },
    });
  };

  const handleDefense = async () => {
    const response = await axios.get(
      `http://localhost:2000/defense?set=${player.defenseLength}`
    );
    setDefenseArray(response.data.data);
    socket.emit("sendRoomMessage", {
      roomName: id,
      eventName: "defend",
      message: { defenseArray: response.data.data },
    });
    socket.emit("calculateResult", {
      roomName: id,
      attackNumber: attackNo,
      defenseArray: response.data.data,
      defender: player.id,
      attacker: attackerId,
    });
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", marginTop: "4rem" }}>
      <Box
        sx={{
          padding: "2rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {!winner ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Game Room
            </Typography>
            <Typography variant="h6" component="h6" gutterBottom>
              {player.name}
            </Typography>
            <Paper elevation={3} sx={{ padding: "1rem", marginBottom: "1rem" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(scoreBoard)?.length > 0 &&
                    Object.keys(scoreBoard).map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data}</TableCell>
                        <TableCell>{scoreBoard[data]}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Paper>
            {attackerId === player.id ? (
              <Box>
                {attackNo && <Typography>Attack No: {attackNo}</Typography>}
                {defenseArray?.length > 0 && (
                  <Typography>
                    Opponent has defended, waiting for results.
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAttack}
                  sx={{ marginTop: "1rem" }}
                >
                  Attack
                </Button>
              </Box>
            ) : (
              <Box>
                {attackNo && (
                  <Typography>
                    Opponent has attacked! Press defense button.
                  </Typography>
                )}
                {defenseArray?.length > 0 && (
                  <Typography>
                    Defense Array: {JSON.stringify(defenseArray)}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDefense}
                  sx={{ marginTop: "1rem" }}
                >
                  Defend
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="h4" component="h1" gutterBottom>
            {winner} has won the match
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default GameRoom;
