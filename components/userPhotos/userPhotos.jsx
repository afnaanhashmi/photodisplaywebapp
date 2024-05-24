import React from 'react';

import './userPhotos.css';
import {
  ListItem
}
from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LikeButton from '../LikeButton/LikeButton';
/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userModel: {},
      photo_info: [],
      new_comment: "",
    };
  }

  setUserModel = (newModel) => {
    this.setState({userModel: newModel});
  };

  setPhotos = (newPhotos) => {
    this.setState({photo_info: newPhotos});
  };




  componentDidMount() {
    axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((res) => {
      this.setUserModel(res.data);
      this.props.onNewInfo("Photos: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

    axios.get("http://localhost:3000/photosOfUserPlus/" + this.props.match.params.userId).then((res) => {
      this.setPhotos(res.data);
      //this.setLikes(this.state.photo_info.map((info) => ((info.like_count) ? info.like_count : 0)));
    }).catch(function (error) {
      console.log("Problem getting user photos", error);
    });
      
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((res) => {
      this.setUserModel(res.data);
      this.props.onNewInfo("Photos: " + this.state.userModel.first_name + " " + this.state.userModel.last_name);
    }).catch(function (error) {
      console.log("Problem getting user data", error);
    });

    axios.get("http://localhost:3000/photosOfUserPlus/" + this.props.match.params.userId).then((res) => {
      this.setPhotos(res.data);
      //this.setLikes(this.state.photo_info.map((info) => ((info.like_count) ? info.like_count : 0)));
    }).catch(function (error) {
      console.log("Problem getting user photos", error);
    });
    }
  }

  handleBtnClick = (imgid, image) => {
    if (this.state.new_comment === "") {
      return;
    }
    axios.post('/commentsOfPhoto/' + imgid, {comment: this.state.new_comment}).then(
         (res) => {
            console.log("successful posting");
            axios.post('/activityComment', {comment: res.data, photo: image}).then(() => {
                console.log('logged the activity');
                axios.get('/activity/list/total').then((res2) => {
                  this.props.onNewActivity(res2.data.length);
                }).catch(function (error) {
                  console.log("Problem posting the log out", error);
                });
            }).catch(function (error) {
              console.log("error:", error);
            });
    }).catch(function (error) {
        console.log("Problem posting the new comment", error);
      });
  };

  // getLikeCount = (img_id) => {
  //   console.log(img_id);
  //   axios.get('/getLikes', {photo_id: img_id}).then((res) => {
  //     console.log(res.data);
  //     return res.data;
  //   }).catch(function (error) {
  //     console.log("Problem getting ilke count", error);
  //   })
  // }

  render() {
    let getPhotos = this.state.photo_info;
    let display;
    if (this.state.photo_info.length === 0) {
      display = <div>NO PHOTOS</div>;
    }
    else {
      display = <div>{getPhotos?.map((image) => <ListItem className="post_box" key={image._id}>  <img src={"../images/" + image.file_name} alt={image.file_name}/><div className='stackelems'><LikeButton liked_users={image.likes} loggedInUserId={this.props.user_logged_in._id} currPhotoId={image._id}></LikeButton><div>Likes: {image.like_count}</div><div className="commentlist"> <input key={image._id + "textinput"} id={image._id + "-input-field"} value={this.state.new_comment} onChange={(e) => (this.setState({new_comment:e.target.value}))}></input> <button onClick={() => this.handleBtnClick(image._id, image)}>POST COMMENT</button> {image.comments?.map((curr_comment) => <div key={curr_comment._id} className="comment"> <Link to={"/users/" + curr_comment.user._id}> <b>{curr_comment.user.first_name + " " + curr_comment.user.last_name}</b></Link> at {curr_comment.date_time}: {curr_comment.comment}</div>)} </div></div></ListItem>)}</div>;
    }
    return (
      <div>
      {display}
      </div>
  );}
}

export default UserPhotos;
