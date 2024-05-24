import React from 'react';
import {
    List,
    ListItem,
    Button,
  }
  from '@mui/material';
import './ActivityDisplay.css';
import axios from 'axios';

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class ActivityDisplay extends React.Component {
  constructor(props) {
    super(props);
      
    this.state = {
        activityList: [],
    };
  }

   
  handleBtnClick = () => {
    axios.get("/activity/list").then((res) => {
        this.setActivityList(res.data);
      }).catch(function (error) {
        console.log("Problem getting activity data", error);
      });
  };

  //new Date(user_pair.activity.date_time).toGMTString()
make_activity_list() {
    let styled_activities = [];
    console.log(this.state.activityList);
    for (let i = 0; i < this.state.activityList.length; i++) {
        if (this.state.activityList[i].activity_type === "Photo Upload") {
            styled_activities.push(
                <ListItem key={i}>
                    <div className='container'>
                    <div>At {new Date(this.state.activityList[i].date_time).toGMTString()}, {this.state.activityList[i].user_name} engaged in a {this.state.activityList[i].activity_type}: </div>
                    <div className='centering'>
                    <img style={{height: "100px", weight: "auto"}} src={"../images/" + this.state.activityList[i].data.file_name} alt={this.state.activityList[i].data.file_name}/>
                    </div>
                    </div>
                </ListItem>
            );
        }
        else if (this.state.activityList[i].activity_type === "New Comment") {
            styled_activities.push(
            <ListItem className="commentColor" key={i}><div>At {new Date(this.state.activityList[i].date_time).toGMTString()}, {this.state.activityList[i].user_name} engaged in a {this.state.activityList[i].activity_type} on the following image.</div>
            <img style={{height: "100px", weight: "auto"}} src={"../images/" + this.state.activityList[i].data.file_name} alt={this.state.activityList[i].data.file_name}/>
            </ListItem>
            );
        }
        else {
            styled_activities.push(
            <ListItem className='userColor' key={i}><div>At {new Date(this.state.activityList[i].date_time).toGMTString()}, {this.state.activityList[i].user_name} {this.state.activityList[i].activity_type}</div></ListItem>
            );
        }
    }
    return styled_activities;
}




setActivityList = (newList) => {
    this.setState({activityList: newList});
  };

  componentDidMount() {
    axios.get("/activity/list").then((res) => {
      this.setActivityList(res.data);
    }).catch(function (error) {
      console.log("Problem getting activity data", error);
    });
  }

//{this.state.activityList.map((activity) => <ListItem>{activity.activity_type}</ListItem>)}

  render() {
    return (
      <div>
        <div className='stackelems'>
        <Button onClick={this.handleBtnClick}>REFRESH</Button>
        5 Most Recent Activities on the App:
        </div>
        
        <List>
            {this.make_activity_list()}
            
        </List>
      </div>
    );
  }
}

export default ActivityDisplay;
