import React from 'react';
import {
  List,
  ListItem,
  Typography,
}
from '@mui/material';
import './userList.css';
import {
  HashRouter, Link
} from 'react-router-dom';
import axios from 'axios';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userModel: [],
    };
  }
  setUserModel = (newModel) => {
    this.setState({userModel: newModel});
  };

  componentDidMount() {
    axios.get("http://localhost:3000/user/list/activities").then((res) => {
      this.setUserModel(res.data);

    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (Object.keys(this.props.curr_logged_in).length !==0) {
        axios.get("http://localhost:3000/user/list/activities").then((res) => {
          this.setUserModel(res.data);
        }).catch(function (error) {
        console.log("Problem getting user data", error);
      });
    }
  }
  }
  

  static make_activity_list(user_pair) {
    if (!user_pair.activity) {
      return(<div>{user_pair.user.first_name} {user_pair.user.last_name}. No recent activities</div>);
    }
    if (user_pair.activity !== "no recent activities") {
        if (user_pair.activity.activity_type === "Photo Upload") {
          
                return(<div className='textbox'><div className='photoColor'><div>{user_pair.user.first_name} {user_pair.user.last_name}</div><div>Most recent activity: At {new Date(user_pair.activity.date_time).toGMTString()}, {user_pair.activity.user_name} engaged in a {user_pair.activity.activity_type}: </div><div className='centering'><img style={{height: "100px", weight: "auto"}} src={"../images/" + user_pair.activity.data.file_name} alt={user_pair.activity.data.file_name}/></div></div></div>);
        }
        else if (user_pair.activity.activity_type === "New Comment") {
            return(
            <div className='commentColor'><div>{user_pair.user.first_name} {user_pair.user.last_name}. Most recent activity: At {new Date(user_pair.activity.date_time).toGMTString()}, {user_pair.activity.user_name} engaged in a {user_pair.activity.activity_type} on the following image.</div>
            <img style={{height: "100px", weight: "auto"}} src={"../images/" + user_pair.activity.data.file_name} alt={user_pair.activity.data.file_name}/>
            </div>
            );
        }
        else {
            return(
            <div className='userColor'><div>{user_pair.user.first_name} {user_pair.user.last_name}. Most recent activity: At {new Date(user_pair.activity.date_time).toGMTString()}, {user_pair.activity.user_name} {user_pair.activity.activity_type}</div></div>
            );
        }
      }
      else {
        return(<div className='otherColor'>{user_pair.user.first_name} {user_pair.user.last_name}. No recent activities</div>);
      }
}

//{userId.user.first_name} {userId.user.last_name}
  render() {
    return (
      <div>
        <HashRouter>
        <Typography variant="body1">
          USER LIST:
        </Typography>
        <List component="nav">
         {this.state.userModel.map((userId) =>  <Link to={"/users/" + userId.user._id} key={userId.user._id}> <ListItem id="listofuser"> {UserList.make_activity_list(userId)} </ListItem></Link>)}
        </List>
        </HashRouter>
      </div>
      
    );
  }
}

export default UserList;
