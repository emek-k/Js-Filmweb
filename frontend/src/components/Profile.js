import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import '../css/profile.css';
import {Button, FloatingLabel, Form} from "react-bootstrap";
import UserInfoContext from "./UserInfoContext";
import { useNavigate } from 'react-router-dom';

const Profile = ({ userInfo }) => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [updateData, setUpdateData] = useState({
    username: userInfo?.Username || '',
    email: userInfo?.Email || ''
  });
  const [editMode, setEditMode] = useState(false);
  const isLoggedIn = useContext(UserInfoContext);

  useEffect(() => {
    if (userInfo) {
      setUpdateData({
        username: userInfo.Username,
        email: userInfo.Email
      });
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
  };


  const fetchFavoriteMovies = async () => {
    if (userInfo && userInfo.Id) {
      try {
        const response = await axios.get(`http://localhost:3001/ulubione/${userInfo.Id}`);
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching favorite movies:', error);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating user data:", updateData);
      const response = await axios.put(`http://localhost:3001/uzytkownicy/${userInfo.Id}`, updateData);
      console.log(response.data);
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };


  useEffect(() => {
    fetchFavoriteMovies();
  }, [userInfo]);

  const handleNext = () => {
    setCurrentMovieIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const handlePrevious = () => {
    setCurrentMovieIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length);
  };

  const currentMovie = movies[currentMovieIndex];


  const removeFromFavorites = async (movieId) => {
    try {
      console.log(`Attempting to remove movie ID: ${movieId} for user ID: ${userInfo.Id}`);
      await axios.delete(`http://localhost:3001/ulubione/${userInfo.Id}`, { data: { IDFilm: movieId } });
      window.location.reload();
      await fetchFavoriteMovies();
    } catch (error) {
      console.error('Error removing movie from favorites:', error);
    }
  };

  if(!isLoggedIn){
    return (
        <div className="profile-container">
          <h1>LOG IN TO SEE THIS PAGE!</h1>
          <Button variant="outline-secondary" className="login-button ms-2" onClick={() => navigate('/login')}>Login</Button>
          <Button variant="outline-info" className="signup-button ms-2" onClick={() => navigate('/signup')}>Sign Up</Button>
        </div>
    )
  }


  return (
      <div className="profile-container">
        <h1 className="my-5">Profile Page</h1>
        <p className="user-info"><strong>User information</strong></p>
        <div className={editMode ? "form-container" : ""}>
        {editMode ? (
          <Form className="profile-form" onSubmit={handleUpdate}>
            <h2>Update Profile</h2>
            <Form.Group className="mb-3">
              <FloatingLabel label="Username" className="mb-3">
                <Form.Control
                  type="text"
                  name="username"
                  value={updateData.username}
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group className="mb-3">
              <FloatingLabel label="Email" className="mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  value={updateData.email}
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="secondary" onClick={() => setEditMode(false)} className="ms-2">Cancel</Button>
          </Form>
        ) : (
          <div>
            <p><strong>Username:</strong> {userInfo?.Username}</p>
            <p><strong>Email:</strong> {userInfo?.Email}</p>
            <Button variant="secondary" onClick={() => setEditMode(true)}>Edit Data</Button>
          </div>
        )}
        </div>

        <h2 className="my-5">Your Favorite Movies</h2>
        {currentMovie && (
          <div className="movie-feature">
            <div className="movie-carousel">
              <Button variant="outline-secondary" onClick={handlePrevious}>&lt;</Button>
              <img src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`} alt={currentMovie.title} />
              <Button variant="outline-secondary" onClick={handleNext}>&gt;</Button>
            </div>
            <h3>{currentMovie.title}</h3>
            <Button className="mt-3" variant="outline-danger" onClick={() => removeFromFavorites(currentMovie.id)}>Remove from favourite</Button>
          </div>
        )}
      </div>
  );
};

export default Profile;
