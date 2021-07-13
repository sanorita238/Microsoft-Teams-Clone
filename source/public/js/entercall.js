import help from "./main.js";

window.addEventListener("load", () => {
  //When the chat icon is clicked, select chat and video sections
  document.querySelector("#toggle-chatButton").addEventListener("click", (e) => {
    let chatElement = document.querySelector("#chat-section");
    let mainSecElement = document.querySelector("#main-video-section");
    //If opened
    if (chatElement.classList.contains("chat-opened")) {
     
      mainSecElement.classList.remove("col-md-9");
      mainSecElement.classList.add("col-md-12");
      chatElement.classList.remove("chat-opened");
    } 
    else {
      mainSecElement.classList.remove("col-md-12");
      mainSecElement.classList.add("col-md-9");
      chatElement.classList.add("chat-opened");
    }

    //Remove the 'New' written on chat icon, if once opened
    setTimeout(() => {
      if (
        document.querySelector("#chat-section").classList.contains("chat-opened")
      ) {
       help.toggleChatNotificationBadge();
      }
    }, 300);
  });

 

  //When newuser click 'Enter room', handle this user(same way as newroom.js)
  document.getElementById("enter-room").addEventListener("click", (e) => {
    e.preventDefault();

    let name = document.querySelector("#username").value;
   
    if (name) {
      //Remove error message, if any
      document.querySelector("#error-msg-username").innerHTML = "";

      //Save the user's name in sessionStorage
      sessionStorage.setItem("username", name);

      //Reload room
      location.reload();
    } else {
      document.querySelector("#error-msg-username").innerHTML =
        "Please enter your name.";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("remote-video-expand")) {
     help.maximiseStream(e);
    } else if (e.target && e.target.classList.contains("mute-remote-mic")) {
     help.singleStreamToggleMute(e);
    }
  });

  //Recording handled
  document.getElementById("close-recording").addEventListener("click", () => {
   help.toggleModal("recording-all-options", false);
  });
});
