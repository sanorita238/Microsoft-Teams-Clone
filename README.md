# Microsoft-Teams-Clone
The Engagement and Mentorship Program to build a Microsoft Teams clone with Acehacker, in Microsoft Engage 2021.

## Introduction

The aim of the project is to build a Microsoft Teams clone with at least one mandatory functionality - a minimum of two participants should be 
able to connect with each other to have a video conversation.

### https://microsoftteamsclonesanorita.herokuapp.com/

![frontpage](https://user-images.githubusercontent.com/60384181/125184342-7727a700-e23a-11eb-8b04-2f5c7c59c4cf.png)

## Demo

 ## Online Demo
Follow the below steps:-
-	```Open``` [https://microsoftteamsclone2021.herokuapp.com](https://microsoftteamsclone2021.herokuapp.com)
-	```Sign in``` using your google account.
-	Enter the details in ```create newroom``` or ```join room by invite``` and enter room.
-	```Allow``` access to use microphone and camera.
-	```Share``` the room URL and wait for someone to join for video conferencing.


## Local Setup

### Quick Start
-	You need to have Node.js installed to execute this project.
-	Download this repo.

### Setup Turn
- Not mandatory but recommended.
- Create an account on http://numb.viagenie.ca/ and get your username and password.
- Fill your Username and Password in source/public/js/main.js, in getIceServer() function. 

### Install dependencies 
```
npm install
```

### Start the server
- In the terminal move to source folder and then run the app.js file.
```
cd source
nodemon app.js
```
- Open http://localhost:3000 in browser. 

## Features

-	Multipeer connection: the application can have unlimited number of conference rooms and is able to connect more than 2 users at the 
 	same time.
-	Google authentication: user has to ```sign in``` by their google account to access the call. 
-	Video and audio stream: the prototype is able to stream user’s video and audio and also see other participant streams too.
-	Invite: invite other participants to join room. There are 2 invite options available for this:
    - ```Share invite```: send mail (or copy URL then share), the mail contains the invitation message and the invite link.
    - ```Invite by whatsapp```: invite by whatsapp is also given as option to the user.
-	Screen share option: ```screen share``` button provides 3 options to user, share ```entire screen```, ```window``` and ```chrome tab```. User 
  can select either of them and share their screen.
-	Recording option: provides 3 options, ```record audio```, ```record screen``` and ```close recording```. To start recording (audio or screen), select 
  that option and the recording starts, to stop the recording click again record button, the recording stops and the recorded file is 
  downloaded on our device.
-	Chat option: to ```chat``` with other participants,user can type your message and see others too with their username and timing. Users are notified if any participant drop a message in chat box.
-	Mute mic: to mute your own mic select ```mute mic```.
- Hide video: to ```hide video``` your own video, select this option.
-	Full screen mode and mute mode: ```full screen``` and ```mute other participant``` option is available on participant’s video.
-	Leave: on clicking ```leave``` button, redirects user to the newroom page, user ```sign out``` from here and redirect back to front page.


## Programming Languages Used
- HTML
- CSS
- JavaScript

### To know more about the project, click [here](https://drive.google.com/file/d/1zkFRRLLbiInkhMC8toI167W6u3DPeU-g/view?usp=sharing)

## References

-	https://developers.google.com/identity/sign-in/web/backend-auth 
-	https://webrtc.org/getting-started/overview 
-	https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity 







 
 
