import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Redirect, Route, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

// import necessary components
import axios from 'axios';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/LoginRegister';
import Registration from './components/Registration/Registration';
import ActivityDisplay from './components/ActivityDisplay/ActivityDisplay';



class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curr_info: "",
      curr_login_name: "",
      logged_in_user: {},
      version_number: "",
      num_activities: 0
    };
  }
  setInfo = (newInfo) => {
    this.setState({curr_info: newInfo});
  };

  setNumActivities = (newNum) => {
    this.setState({num_activities: newNum});
  };


  setLoggedIn = (newUser) => {
    this.setState({curr_login_name: newUser});
  };

  setUser = (newUser) => {
    this.setState({logged_in_user: newUser});
    window.location.replace('photo-share.html#/users/' + newUser._id);
  };

  setVNum = (newNum) => {
    this.setState({version_number: newNum});
  };

  userIsLoggedIn = () => {
    return this.state.curr_login_name !== "";
  };
  
  componentDidMount() {
    axios.get("http://localhost:3000/test/info").then((res) => {
      this.setVNum(res.data.__v);
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });
  }

  render() {
    let sidebar;
    if (this.state.curr_login_name === "") {
      sidebar = <div />;
    }
    else {
      // props => <UserDetail onNewInfo={this.setInfo} {...props} /> 
      sidebar = <UserList activity_count={this.state.num_activities} curr_logged_in={this.state.logged_in_user} onNewActivity={this.setNumActivities} num_activities={this.num_activities}/>;
    }
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar onNewActivity={this.setNumActivities} onNewInfo={this.setUser} changefullname={this.setLoggedIn} topbar_displaydata = {this.state.curr_info} logged_in_user = {this.state.curr_login_name} usersname = {this.state.logged_in_user} v_num={this.state.version_number}/>
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
        <Grid item sm={3}>
          <Paper className="cs142-main-grid-item">
            {sidebar}
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="cs142-main-grid-item">
            <Switch>
            ({this.userIsLoggedIn() ?
              <Route path="/users/:userId" render={ props => <UserDetail onNewInfo={this.setInfo} {...props} /> }/>
              :
              <Redirect path="/users/:userId" to="/login-register" />})

            {this.userIsLoggedIn() ?
              <Route path="/photos/:userId" render ={ props => <UserPhotos onNewActivity={this.setNumActivities} user_logged_in={this.state.logged_in_user} onNewInfo={this.setInfo} {...props} /> }/>
              :
            <Redirect path="/photos/:userId" to="/login-register" />}

            
            ({this.userIsLoggedIn() ?
              <Route path="/activityDisplay" render={ props => <ActivityDisplay {...props} /> }/>
              :
              <Redirect path="/activityDisplay" to="/login-register" />})



              <Route path="/login-register"
              render = {props => <LoginRegister onNewActivity={this.setNumActivities} onNewInfo={this.setLoggedIn} newUser={this.setUser} {...props} />}
              />
              <Route path="/registration"
              render = {props => <Registration onNewActivity={this.setNumActivities} onNewInfo={this.setLoggedIn} newUser={this.setUser} {...props} />}
              />

            <Redirect exact from="/" to="/login-register" />

          {this.userIsLoggedIn() ?
              <Route path="/users" component={UserList}  />
              :
            <Redirect path="/users" to="/login-register" />}
            </Switch>
          </Paper>
        </Grid>
      </Grid>
      </div>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
