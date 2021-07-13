import helpers from "./main.js";



window.addEventListener("load", () => {
  let joinRoom;
  //If the user has already room invite, 
  //they can directly join the room
  function joinRoomFunc()
  {
     joinRoom = document.querySelector("#nroom").value;
     document.getElementById("join-room").href=joinRoom;
  
  }
  document.getElementById("join-room").addEventListener("click",()=>{
    joinRoomFunc();
  })



  // When user creates new room and joins
  document.getElementById("enter-room").addEventListener("click", (e) => {
    e.preventDefault();

    
     let meetingName = document.querySelector("#meeting-name").value;
     let userName = document.querySelector("#user-name").value;
     
     
     
    //If Details are filled
    if (meetingName && userName) {
      //Remove error messages, if present
      document.querySelector("#error-msg").innerHTML = "";

      //Storing data of current session
      sessionStorage.setItem("username", userName);

      //Creating random MeetLink
      let MeetLink = `${location.origin}/entercall?room=${meetingName
        .trim()
        .replace(" ", "_")}_${helpers.randomStringMeetName()}`;

      //Show MeetLink and enter the meet
      document.querySelector(
        "#newroom-created"
      ).innerHTML = `Room successfully created! Enter the <a href='${MeetLink}'>room</a>!`;

     
    
      //Clear the values when filled once
      document.querySelector("#meeting-name").value = "";
      document.querySelector("#user-name").value = "";
    }
    //Details not filled
    else 
     {
       document.querySelector("#error-msg").innerHTML = "All fields are mandatory.";
     }
  });


  //Setting Videos 
  document.addEventListener("click", (e) => {
    //Video full screen mode
    if (e.target && e.target.classList.contains("remote-video-expand")) {
      helpers.maximiseStream(e);
      //Mute mic of the participant
    } else if (e.target && e.target.classList.contains("mute-remote-mic")) {
      helpers.singleStreamToggleMute(e);
    }
  });
});

