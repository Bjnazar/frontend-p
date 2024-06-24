import Navbar from '../common/Navbar';
import './sala_espera.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

function Sala_espera() {
  const { gameId } = useParams();
  const [players, setPlayers] = useState([]);
  const [tablero, setTablero] = useState(null); // Asegúrate de que el estado inicial sea null
  const navigate = useNavigate(); // Para redireccionar

  // useEffect(() => {
  //   const fetchPlayers = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:3000/games/showplayers/${gameId}`);
  //       setPlayers(response.data);
  //     } catch (error) {
  //       console.error('Error al obtener los jugadores:', error);
  //     }
  //   };

  //   fetchPlayers();
  // }, [gameId]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/games/showplayers/${gameId}`);
        setPlayers(response.data);
      } catch (error) {
        console.error('Error al obtener los jugadores:', error);
      }
    };

    // Hacer la primera llamada para obtener los jugadores
    fetchPlayers();

    const intervalId = setInterval(fetchPlayers, 5000); // 1 segundo = 1000

    return () => clearInterval(intervalId);
  }, [gameId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gameData = {
      game_id: gameId, // Use gameId instead of hardcoding the ID
    };

    try {

      const gameStatusResponse = await axios.get(`http://localhost:3000/games/findgame/${gameId}`);
      const gameStarted = gameStatusResponse.data.started;

      if (gameStarted) {
        // Si el juego ya empezó, redirigir directamente al tablero
        navigate(`/tablero/${gameId}`);
        return;
      }

      // Requests para partir el juego (solo se debe accionar una vez)
      const response1 = await axios.patch(`http://localhost:3000/games/startgame/${gameId}`);
      console.log('Respuesta del servidor 1:', response1.data);
      // Este endpoint cambiará el estado de started a true

      const response2 = await axios.post(`http://localhost:3000/games/addboard`, gameData);
      console.log('Respuesta del servidor 2:', response2.data);

      const response22 = await axios.get(`http://localhost:3000/games/findboardbygameid/${gameId}`);
      console.log('Respuesta del servidor 22:', response22.data);
      const tableroData = response22.data;
      setTablero(tableroData);

      console.log("id tablero:", tableroData.id);

      const response3 = await axios.post(`http://localhost:3000/properties/create/${tableroData.id}`);
      console.log('Respuesta del servidor 3:', response3.data);

      const response4 = await axios.post(`http://localhost:3000/metros/create/${tableroData.id}`);
      console.log('Respuesta del servidor 4:', response4.data);

      const response5 = await axios.post(`http://localhost:3000/cards/create/${tableroData.id}`);
      console.log('Respuesta del servidor 5:', response5.data);

      // Redireccionar a la ruta /tablero después de inicializar el juego
      navigate(`/tablero/${gameId}`);
      return;
    } catch (error) {
      console.error('Error en algo:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="sala_espera">
        <h2>Sala de Espera</h2>
        <p>Número de partida: {gameId}</p>
        <p> Debemos esperar a que hayan 4 jugadores. ¡Invita a tus amigos!</p>
        <h3>Jugadores en la partida:</h3>
        <ul>
          {players.map(player => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
        {players.length === 4 && (
          <div>
            <button onClick={handleSubmit}>Jugar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sala_espera;
