import React from 'react';
import {
  Link
} from 'react-router-dom';
import {
    TextField
  } from '@mui/material';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class Registration extends React.Component {
  constructor(props) {
    super(props);
      
    this.state = {
      inputted_text: "",
      inputted_password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      occupation: "",
      location: "",
      description: "", 
    };
  }
   
  handleBtnClick = () => {
    if (this.state.inputted_password !== this.state.confirm_password) {
        console.error(400,"Passwords don't match");
        return;
    }

    axios.post('/user', 
    {login_name: this.state.inputted_text, password: this.state.inputted_password, first_name: this.state.first_name, last_name: this.state.last_name, occupation: this.state.occupation, location: this.state.location, description: this.state.description}).then(
         (res) => {
            this.props.onNewInfo(this.state.inputted_text);
            this.props.newUser(res.data);
            console.log("Created a new User!");
            axios.post('/activityUser', {user_id: res.data._id, activity_type: "Registered as a new user"}).then(() => {
              console.log("new user logged in activity");
              axios.get('/activity/list/total').then((res1) => {
                this.props.onNewActivity(res1.data.length);
              }).catch(function (error) {
                console.log("Problem posting the log out", error);
              });
          });
    }).catch(function (error) {
        console.log("Problem creating a new user", error);
      });
  };

  render() {
    return (
      <div>
        CREATE A NEW USER
        <div className='stacking'>
            <div>Username:</div>
        <TextField id="username" value={this.state.inputted_text} onChange={(e) => (this.setState({inputted_text:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Password:</div>
        <TextField type='password' id="pwd" value={this.state.inputted_password} onChange={(e) => (this.setState({inputted_password:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Confirm Password:</div>
        <TextField type='password' value={this.state.confirm_password} onChange={(e) => (this.setState({confirm_password:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>First Name:</div>
        <TextField value={this.state.first_name} onChange={(e) => (this.setState({first_name:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Last Name:</div>
        <TextField value={this.state.last_name} onChange={(e) => (this.setState({last_name:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Occupation:</div>
        <TextField value={this.state.occupation} onChange={(e) => (this.setState({occupation:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Location:</div>
        <TextField value={this.state.location} onChange={(e) => (this.setState({location:e.target.value}))}></TextField>
        </div>

        <div className='stacking'>
            <div>Description:</div>
        <TextField value={this.state.description} onChange={(e) => (this.setState({description:e.target.value}))}></TextField>
        </div>

        <button onClick={this.handleBtnClick}>CREATE NEW USER</button>
        <div><Link to={"/login-register"}>LOG IN AN EXISTING NEW USER</Link></div>
      </div>
    );
  }
}

export default Registration;
