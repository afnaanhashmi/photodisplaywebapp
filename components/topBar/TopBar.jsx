import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import {
  Link
} from 'react-router-dom';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleBtnClick = () => {
    console.log('logging out');
    axios.post('/admin/logout').then(
         (res) => {
            this.props.onNewInfo({});
            this.props.changefullname("");
            this.forceUpdate();
            axios.post('/activityUser', {user_id: res.data, activity_type: "Logged Out"}).then(() => {
              console.log("new user logged in activity");
                ///activity/list/total  
          }).catch(function (error) {
        console.log("Problem posting the log out", error);
      });
    }).catch(function (error) {
        console.log("Problem posting the log out", error);
      });
  };

  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      // console.log('dom form');
      // console.log(domForm.file);
      // console.log(this.uploadInput.files);
      axios.post('/photos/new', domForm)
        .then((res) => {
          // console.log(res.data);
          // console.log('in then');
          axios.post('/activityPhoto', {photo: res.data}).then(() => {
            console.log("activity logged");
            axios.get('/activity/list/total').then((res1) => {
              this.props.onNewActivity(res1.data.length);
            }).catch(function (error) {
              console.log("Problem logging new activity", error);
            });
          });
          
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  render() {
    let loginprompt;
    if (!this.props.logged_in_user) {
      loginprompt = <div> Afnaan Hashmi: Please log in</div >;
    }
    else {
      loginprompt = <div><Typography variant="h5" color="inherit">Hi {this.props.usersname.first_name + " " + this.props.usersname.last_name}</Typography><Link to={"/registration"}><button onClick={this.handleBtnClick}>LOGOUT</button></Link><input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} /><button onClick={this.handleUploadButtonClicked}>UPLOAD PHOTO</button></div>;
    }
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className='top'>
          
          {loginprompt}
          <div className='buffer'> </div>
          
          <div className='rightside'>
          <div><Link to={"/activityDisplay"}>Recent Activity</Link></div>
          <Typography>Version: {this.props.v_num}  </Typography>
          {!this.props.logged_in_user ? <div></div> : <Typography >{this.props.topbar_displaydata}</Typography>}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
