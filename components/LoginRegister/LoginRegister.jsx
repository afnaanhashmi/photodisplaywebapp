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
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
      
    this.state = {
      inputted_text: "",
      inputted_password: "",
    };
  }

   
  handleBtnClick = () => {
    axios.post('/admin/login', {login_name: this.state.inputted_text, password: this.state.inputted_password}).then(
         (res) => {
            this.props.onNewInfo(this.state.inputted_text);
            this.props.newUser(res.data);
            axios.post('/activityUser', {user_id: res.data._id, activity_type: "Logged In"}).then(() => {
                console.log("new user logged in activity");
                axios.get('/activity/list/total').then((res1) => {
                  this.props.onNewActivity(res1.data.length);
                }).catch(function (error) {
                  console.log("Problem posting the log out", error);
                });
            });
    }).catch(function (error) {
        console.log("Problem posting the log in", error);
      });
  };



  render() {
    return (
      <div>
        Please login.
        <div className='stacking'>
            <div>Username:</div>
        <TextField id="username" value={this.state.inputted_text} onChange={(e) => (this.setState({inputted_text:e.target.value}))}></TextField>
        </div>
        <div className='stacking'>
            <div>Password:</div>
        <TextField id="pwd" type='password' value={this.state.inputted_password} onChange={(e) => (this.setState({inputted_password:e.target.value}))}></TextField>
        </div>
        <button onClick={this.handleBtnClick}>LOG IN</button>
        <div><Link to={"/registration"}>REGISTER A NEW USER</Link></div>
      </div>
    );
  }
}

export default LoginRegister;
