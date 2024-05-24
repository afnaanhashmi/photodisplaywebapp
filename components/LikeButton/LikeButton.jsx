import React from 'react';
import {
    Button
  } from '@mui/material';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class LikeButton extends React.Component {
  constructor(props) {
    super(props);
      
    this.state = {
      click_to_like: true,
    };
  }

  setValue = (truth_val) => {
    this.setState({click_to_like: truth_val});
  };
   
  handleBtnClick = () => {
    if (!this.props.liked_users.includes(this.props.loggedInUserId)) {
        axios.post('/likePhoto/', {photo_id: this.props.currPhotoId, user_id: this.props.loggedInUserId}).then(
            () => {
                console.log("photo was liked!");
                console.log(this.state.click_to_like);
                this.setValue(false);
            }
        ).catch(function (error) {
            console.log("problem liking", error);
        });
    }
    else {
        axios.post('/dislikePhoto', {photo_id: this.props.currPhotoId, user_id: this.props.loggedInUserId}).then(
            () => {
                console.log("photo was disliked");
                this.setValue(true);
            }
        ).catch(function (error) {
            console.log("problem disliking", error);
        });
    }
  };



  render() {
    let display_msg = (!this.props.liked_users.includes(this.props.loggedInUserId)) ? "Like" : "Dislike";
    return (
      <div>
        <Button variant="outlined" onClick={this.handleBtnClick}>{display_msg}</Button>
      </div>
    );
  }
}

export default LikeButton;
