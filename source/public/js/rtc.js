
import helps from "./main.js";

window.addEventListener("load", () => {
  const room = helps.meetInviteString(location.href, "room");
  const userName = sessionStorage.getItem("username");
  let navItem = document.querySelector(".features-nav");
  let userBar = document.querySelector('#newuser');
  //If room not created
  if (!room) {
    navItem.setAttribute("hidden", true);
    userBar.style.color = "white";
    document.body.style.backgroundColor = "rgb(82, 82, 197)";
    document
    .querySelector("#newroom-create")
    .attributes.removeNamedItem("hidden");
  }
  //If userName is not there 
  else if (!userName) {
    navItem.setAttribute("hidden", true);
    userBar.style.color = "white";
    document.body.style.backgroundColor = "rgb(82, 82, 197)";
    document
    .querySelector("#newuser")
    .attributes.removeNamedItem("hidden");
  } 
  //If both exists then handle connection
  else {
    var peerConnect = [];
   
    let socket = io("/stream");

    //Declare variables
    var socketId = "";
    var myStream = "";
    var screen = "";
    var recordedStream = [];
    var mediaRecorder = "";

    //Get and set user stream
    setUserStream();

    socket.on("connect", () => {
      //Set socketId
      socketId = socket.io.engine.id;

      socket.emit("joinRoom", {
        room: room,
        socketId: socketId,
      });
        //Handle this user and send it's broadcast
       //And push to peerConnect
      socket.on("new user", (data) => {
        socket.emit("newUserEnter", { to: data.socketId, sender: socketId });
        peerConnect.push(data.socketId);
        init(true, data.socketId);
      });

      socket.on("newUserEnter", (data) => {
        peerConnect.push(data.sender);
        init(false, data.sender);
      });

      socket.on("ice candidates", async (data) => {
        data.candidate
          ? await peerConnect[data.sender].addIceCandidate(
              new RTCIceCandidate(data.candidate)
            )
          : "";
      });

      socket.on("sdp", async (data) => {
        if (data.description.type === "offer") {
          data.description
            ? await peerConnect[data.sender].setRemoteDescription(
                new RTCSessionDescription(data.description)
              )
            : "";

            helps.getFullUserMedia()
            .then(async (stream) => {
              if (!document.getElementById("my-video").srcObject) {
                helps.setLocalStream(stream);
              }

              //Save myStream
              myStream = stream;

              stream.getTracks().forEach((track) => {
                peerConnect[data.sender].addTrack(track, stream);
              });

              let aPromise = await peerConnect[data.sender].createAnswer();

              await peerConnect[data.sender].setLocalDescription(aPromise);

              socket.emit("sdp", {
                description: peerConnect[data.sender].localDescription,
                to: data.sender,
                sender: socketId,
              });
            })
            .catch((e) => {
              console.error(e);
            });
        } else if (data.description.type === "answer") {
          await peerConnect[data.sender].setRemoteDescription(
            new RTCSessionDescription(data.description)
          );
        }
      });

      socket.on("chat", (data) => {
        helps.addChat(data, "remote");
      });
    });

    function setUserStream() {
      helps.getFullUserMedia()
        .then((stream) => {
          //save my stream
          myStream = stream;

          helps.setLocalStream(stream);
        })
        .catch((e) => {
          console.error(`stream error: ${e}`);
        });
    }

    //Function to send messages
    function sendMsg(msg) {
      let data = {
        room: room,
        msg: msg,
        sender: userName,
      };
     
      //Emit chat message
      socket.emit("chat", data);

      //Add localchat
      helps.addChat(data, "my-video");
    }

    function init(createOffer, connectionName) {
      peerConnect[connectionName] = new RTCPeerConnection(helps.getIceServer());
        
      //should trigger negotiationneeded event
      if (screen && screen.getTracks().length) {
        screen.getTracks().forEach((track) => {
          peerConnect[connectionName].addTrack(track, screen); 
        });
      } 
      else if (myStream) {
        myStream.getTracks().forEach((track) => {
          peerConnect[connectionName].addTrack(track, myStream); 
        });
      }
       else {
        helps.getFullUserMedia()
          .then((stream) => {
            //save my stream
            myStream = stream;

            stream.getTracks().forEach((track) => {
              peerConnect[connectionName].addTrack(track, stream); 
            });

            helps.setLocalStream(stream);
          })
          .catch((e) => {
            console.error(`Stream error occured: ${e}`);
          });
      }

      //create offer
      if (createOffer) {
        peerConnect[connectionName].onnegotiationneeded = async () => {
          let offer = await peerConnect[connectionName].createOffer();

          await peerConnect[connectionName].setLocalDescription(offer);

          socket.emit("sdp", {
            description: peerConnect[connectionName].localDescription,
            to: connectionName,
            sender: socketId,
          });
        };
      }

      //Send ice candidate to other connections
      peerConnect[connectionName].onicecandidate = ({ candidate }) => {
        socket.emit("ice candidates", {
          candidate: candidate,
          to: connectionName,
          sender: socketId,
        });
      };
      
      //Add this candidate
      peerConnect[connectionName].ontrack = (e) => {
        let str = e.streams[0];
        if (document.getElementById(`${connectionName}-video`)) {
          document.getElementById(`${connectionName}-video`).srcObject = str;
        }
         else {
          //Video element
          let newVid = document.createElement("video");
          newVid.id = `${connectionName}-video`;
          newVid.srcObject = str;
          newVid.autoplay = true;
          newVid.className = "remote-video";

          //Video controls elements
          let videoControlDiv = document.createElement("div");
          videoControlDiv.className = "remote-video-controls";
          videoControlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                        <i class="fa fa-expand text-white remote-video-expand" title="Expand"></i>`;
          // videoControlDiv.innerHTML = `<span style='text-white '`;

          //Create a new div for video
          let videoDiv = document.createElement("div");
          videoDiv.className = "card card-sm";
          videoDiv.id = connectionName;
          videoDiv.appendChild(newVid);
          videoDiv.appendChild(videoControlDiv);

          //Keep this div in main-video-section element
          document.getElementById("other-videos").appendChild(videoDiv);
          //Adjust video size
          helps.adjustAllVideoSize();
        }
      };
      //Handle disconnections
      peerConnect[connectionName].onconnectionstatechange = (d) => {
        switch (peerConnect[connectionName].iceConnectionState) {
          case "disconnected":
          case "failed":
            helps.closeVideoStream(connectionName);
            break;

          case "closed":
            helps.closeVideoStream(connectionName);
            break;
        }
      };

      peerConnect[connectionName].onsignalingstatechange = (d) => {
        switch (peerConnect[connectionName].signalingState) {
          case "closed":
            console.log("Signalling state:'closed'");
            helps.closeVideoStream(connectionName);
            break;
        }
      };
    }

    //Sharescreen
    function shareScreen() {
     
      helps.shareScreen()
        .then((stream) => {
          helps.toggleShareIcons(true);

          //Disable the video toggle buttons while sharing screen, to ensure buttons interferance
          //Buttons enabled, when screen sharing stops
          helps.toggleVideoBtnDisabled(true);

          //Save my screen stream
          screen = stream;

          //Share the new stream with all connections
          broadcastNewTracks(stream, "video", false);

          //Stop screen sharing when clicked
          screen.getVideoTracks()[0].addEventListener("ended", () => {
            stopSharingScreen();
          });
        })
        .catch((e) => {
          console.error(e);
        });
    }

      //Function to stop screen sharing
    function stopSharingScreen() {
        
      //Enable video toggle button
      helps.toggleVideoBtnDisabled(false);

      return new Promise((res, rej) => {
        screen.getTracks().length
          ? screen.getTracks().forEach((track) => track.stop())
          : "";

        res();
      })
        .then(() => {
          helps.toggleShareIcons(false);
          broadcastNewTracks(myStream, "video");
        })
        .catch((e) => {
          console.error(e);
        });
    }

    function broadcastNewTracks(stream, type, mirrorMode = true) {
      helps.setLocalStream(stream, mirrorMode);

      let track =
        type == "audio"
          ? stream.getAudioTracks()[0]
          : stream.getVideoTracks()[0];

      for (let pr in peerConnect) {
        let peerName = peerConnect[pr];

        if (typeof peerConnect[peerName] == "object") {
          helps.replaceTrack(track, peerConnect[peerName]);
        }
      }
    }

    //Recording option
    function toggleRecordingIcons(isRecording) {
      let e = document.getElementById("recording");
   
      //If recording starts
      if (isRecording) {

        e.setAttribute("title", "Stop recording");
        e.children[0].classList.add("text-danger");
        e.children[0].classList.remove("text-white");
      }
      else {
        
        e.setAttribute("title", "Record");
        e.children[0].classList.add("text-white");
        e.children[0].classList.remove("text-danger");
      }
    }
    //Start recording
    function startRecording(stream) {
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorder.start(1000);
      toggleRecordingIcons(true);

      mediaRecorder.ondataavailable = function (e) {
        recordedStream.push(e.data);
      };

      mediaRecorder.onstop = function () {
         
        toggleRecordingIcons(false);
        //Save this recording
        helps.saveRecordedStream(recordedStream, userName);

        setTimeout(() => {
          recordedStream = [];
        }, 3000);
      };

      mediaRecorder.onerror = function (e) {
        console.error(e);
      };
    }

    //Chat textarea
    document.getElementById("type-message").addEventListener("keypress", (e) => {
      if (e.which === 13 && e.target.value.trim()) {
        e.preventDefault();

        sendMsg(e.target.value);

        setTimeout(() => {
          e.target.value = "";
        }, 50);
      }
    });

    //Hide video, when video hide clicked
    document.getElementById("hide-video").addEventListener("click", (e) => {
      e.preventDefault();

      let elem = document.getElementById("hide-video");

      if (myStream.getVideoTracks()[0].enabled) {
        e.target.classList.remove("fa-video");
        e.target.classList.add("fa-video-slash");
        elem.setAttribute("title", "Show Video");

        myStream.getVideoTracks()[0].enabled = false;
      } else {
        e.target.classList.remove("fa-video-slash");
        e.target.classList.add("fa-video");
        elem.setAttribute("title", "Hide Video");

        myStream.getVideoTracks()[0].enabled = true;
      }

      broadcastNewTracks(myStream, "video");
    });

    //Mute mic, when mute icon is clicked
    document.getElementById("mute-mic").addEventListener("click", (e) => {
      e.preventDefault();

      let elem = document.getElementById("mute-mic");

      if (myStream.getAudioTracks()[0].enabled) {
        e.target.classList.remove("fa-microphone-alt");
        e.target.classList.add("fa-microphone-alt-slash");
        elem.setAttribute("title", "Unmute");

        myStream.getAudioTracks()[0].enabled = false;
      } 
      else {
        e.target.classList.remove("fa-microphone-alt-slash");
        e.target.classList.add("fa-microphone-alt");
        elem.setAttribute("title", "Mute");

        myStream.getAudioTracks()[0].enabled = true;
      }

      broadcastNewTracks(myStream, "audio");
    });

    //When user clicks the 'Share screen' button
    document.getElementById("share-screen").addEventListener("click", (e) => {
      e.preventDefault();

      if (
        screen &&
        screen.getVideoTracks().length &&
        screen.getVideoTracks()[0].readyState != "ended"
      ) {
        
        stopSharingScreen();
      } 
      else 
      {
        shareScreen();
      }
    });

    //When record button is clicked
    document.getElementById("recording").addEventListener("click", (e) => {
      
      //Ask user to select video or screen recording
      //Get that stream and start recording
      if (!mediaRecorder || mediaRecorder.state == "inactive") {
        helps.toggleModal("recording-all-options", true);
      } 
      else if (mediaRecorder.state == "paused") {
        mediaRecorder.resume();
      } 
      else if (mediaRecorder.state == "recording") {
        mediaRecorder.stop();
      }
    });

    //When user choose screen record option
    document.getElementById("screen-recording").addEventListener("click", () => {
      helps.toggleModal("recording-all-options", false);

      if (screen && screen.getVideoTracks().length) {
        startRecording(screen);
      } else {
        helps.shareScreen()
          .then((screenStream) => {
            startRecording(screenStream);
          })
          .catch(() => {});
      }
    });

    //When user choose video record option
    document.getElementById("video-recording").addEventListener("click", () => {
      helps.toggleModal("recording-all-options", false);

      if (myStream && myStream.getTracks().length) {
        startRecording(myStream);
      } else {
        helps.getFullUserMedia()
          .then((videoStream) => {
            startRecording(videoStream);
          })
          .catch(() => {});
      }
    });
  }
});

//Sharing invite link 
//By mail 
let shareData = {
  title: 'Invitation for joining meet!',
  text: 'Greetings from Microsoft Teams! You are invited! Please join the meet.',
  url:window.location.href,
}
const btn = document.querySelector('.share-link');
btn.addEventListener('click', () => {
  navigator.share(shareData)
});

//By whatsapp 
let postUrl = encodeURI(document.location.href);
let postTitle = encodeURI("Greetings from Microsoft Teams! You are invited! Please join the meet: ");
const whatsappBtn = document.querySelector(".whatsapp-btn");
whatsappBtn.addEventListener('click',()=>{
  whatsappBtn.setAttribute(
    "href",
    `https://wa.me/?text=${postTitle} ${postUrl}`
  );
})

