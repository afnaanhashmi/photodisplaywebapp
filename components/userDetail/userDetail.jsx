import React from 'react';
import './userDetail.css';
import {
  Link
} from 'react-router-dom';
import {
  Button,
}
from '@mui/material';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userModel: {},
      recent_pic: {},
      most_commented_pic: {},
    };
  }
  setUserModel = (newModel) => {
    this.setState({userModel: newModel});
  };

  setRecentPic = (newPic) => {
    this.setState({recent_pic: newPic});
  };

  setCommentedPic = (newPic) => {
    this.setState({most_commented_pic: newPic});
  };



  componentDidMount() {
    axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((res) => {
      this.setUserModel(res.data);
      this.props.onNewInfo("Details: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
    }).catch(function (error) {
      console.log("Problem getting user data AA", error);
    });
    axios.get("http://localhost:3000/mostRecentPhoto/" + this.props.match.params.userId).then((res) => {
      this.setRecentPic(res.data);
      if (res.data === []) {
        this.setRecentPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

    axios.get("http://localhost:3000/mostCommentedPhoto/" + this.props.match.params.userId).then((res) => {
      this.setCommentedPic(res.data);
      if (res.data === []) {
        this.setCommentedPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((res) => {
      this.setUserModel(res.data);
      this.props.onNewInfo("Details: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });
    axios.get("http://localhost:3000/mostRecentPhoto/" + this.props.match.params.userId).then((res) => {
      this.setRecentPic(res.data);
      if (res.data === []) {
        this.setRecentPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

    axios.get("http://localhost:3000/mostCommentedPhoto/" + this.props.match.params.userId).then((res) => {
      this.setCommentedPic(res.data);
      if (res.data === []) {
        this.setCommentedPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });
    }
    //this.props.onNewInfo("Details: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
  }


  handleBtnClick = () => {
    axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((res) => {
      this.setUserModel(res.data);
      this.props.onNewInfo("Details: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
    }).catch(function (error) {
      console.log("Problem getting user data AA", error);
    });
    axios.get("http://localhost:3000/mostRecentPhoto/" + this.props.match.params.userId).then((res) => {
      this.setRecentPic(res.data);
      if (res.data === []) {
        this.setRecentPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

    axios.get("http://localhost:3000/mostCommentedPhoto/" + this.props.match.params.userId).then((res) => {
      this.setCommentedPic(res.data);
      if (res.data === []) {
        this.setCommentedPic([]);
      }
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });
  };

  render() {
    let comment_count = (!this.state.most_commented_pic.comments) ? 0 : this.state.most_commented_pic.comments.length;
    let commented_pic = (this.state.most_commented_pic.length === 0 || Object.keys(this.state.most_commented_pic).length === 0) ? (<div>No pictures available</div>) : (<div> <div>Most Commented Picture with {comment_count} comments:</div><Link to={"/photos/" + this.props.match.params.userId}><img style={{height: "100px", weight: "auto"}} src={"../images/" + this.state.most_commented_pic.file_name} alt={this.state.most_commented_pic.file_name}/></Link></div>);
    let recent_pic = (this.state.recent_pic.length === 0 || Object.keys(this.state.recent_pic).length === 0) ? (<div>No pictures available</div>) : <div><div>Most Recent Picture: Uploaded on {new Date(this.state.recent_pic.date_time).toGMTString()} </div><Link to={"/photos/" + this.props.match.params.userId}><img style={{height: "100px", weight: "auto"}} src={"../images/" + this.state.recent_pic.file_name} alt={this.state.recent_pic.file_name}/></Link></div>;
    return (
      <div>
        <Button onClick={this.handleBtnClick}>REFRESH</Button>
        <h2>
          USER: {this.state.userModel.first_name} {this.state.userModel.last_name} ({this.state.userModel.occupation})
        </h2>
        <div>ID: {this.props.match.params.userId}</div>
        <h3>
        From: {this.state.userModel.location}
        </h3>
        <h3>
        
        </h3>
        <div>Bio: {this.state.userModel.description}</div>
        <div><Link to={"/photos/" + this.props.match.params.userId}> View Photos </Link> </div>
        {recent_pic}
        {commented_pic}
      </div>
    );
  }
}

export default UserDetail;
