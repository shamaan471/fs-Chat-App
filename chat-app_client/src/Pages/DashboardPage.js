import React from "react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
import makeToast from "../Toaster";

const DashboardPage = (props) => {

  const [chatrooms, setChatrooms] = React.useState([]);
  const chatRoomRef = React.useRef();

  const getChatrooms = () => {
    axios
      .get("http://localhost:8000/chatroom", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("CC_Token"),
        },
      })
      .then((response) => {
        setChatrooms(response.data);
      })
      .catch((err) => {
        setTimeout(getChatrooms, 3000);
      });
  };

  React.useEffect(() => {
    getChatrooms();
    // eslint-disable-next-line
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("CC_Token");
    makeToast("success", "Logged Out");
    if(props.socket){
      //get disconnected from socket
      props.socket.disconnect();
    }
    props.history.push("/login");
  }

  const createChatroomHandler = async() => {
    const roomName = chatRoomRef.current.value;
    // axios
    //   .post("http://localhost:8000/chatroom", {
    //     headers: {
    //       Authorization: "Bearer " + localStorage.getItem("CC_Token"),
    //     },
    //     data: {
    //       name: roomName
    //     }
    //   })
    //   .then((response) => {
    //     makeToast("success", response.data.message);
    //     getChatrooms();
    //   })
    //   .catch((err) => {
    //     if (
    //       err &&
    //       err.response &&
    //       err.response.data &&
    //       err.response.data.message
    //     )
    //       makeToast("error", err.response.data.message);      
    // });
    axios({
      headers: {
          Authorization: "Bearer " + localStorage.getItem("CC_Token"),
      },
      method: 'POST',
      withCredentials: true,
      url: 'http://localhost:8000/chatroom',
      data: {
          name: roomName
      }
      }).then (response => {
        makeToast("success", response.data.message);
        getChatrooms();
        
      }).catch(err => {
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.message
        )
        makeToast("error", err.response.data.message);       
    });
    
  }

  return (
    <div className="card">
      <div className="cardHeader">Chatrooms</div>
      <div className="cardBody">
        <div className="inputGroup">
          <label htmlFor="chatroomName">Chatroom Name</label>
          <input
            type="text"
            name="chatroomName"
            id="chatroomName"
            placeholder="Enter name here"
            ref={chatRoomRef}
          />
        </div>
      </div>
      <button onClick= {createChatroomHandler}>Create Chatroom</button>
      <div className="chatrooms">
        {chatrooms.map((chatroom) => (
          <div key={chatroom._id} className="chatroom">
            <div>{chatroom.name}</div>
            <Link to={"/chatroom/" + chatroom._id}>
              <div className="join">Join</div>
            </Link>
          </div>
        ))}
      </div>

      <button onClick = {logoutHandler}>Logout</button>
    </div>
  );
};

export default withRouter(DashboardPage);