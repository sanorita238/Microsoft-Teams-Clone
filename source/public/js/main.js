
export default {
    //Function to create random MeetLink
    randomStringMeetName() {
        const cryptoObj = window.crypto || window.msCrypto;
        let array = new Uint32Array(1);
        
        return cryptoObj.getRandomValues(array);
    },

    //Function to close the video stream and remove this participant
    closeVideoStream( elemId ) {
        if ( document.getElementById( elemId ) ) {
            document.getElementById( elemId ).remove();
            this.adjustAllVideoSize();
        }
    },


    pageHasFocus() {
        return !( document.hidden || document.onfocusout || window.onpagehide || window.onblur );
    },

    //Function to split Meet link url
    meetInviteString( url = '', returnKey = '' ) {
        url = url ? url : location.href;
        let tempString = decodeURIComponent( url ).split( '#', 2 )[0].split( '?', 2 )[1];

        if ( tempString ) {
            let splitMeetString = tempString.split( '&' );

            
            if ( splitMeetString.length ) {
                let tempStringObj= {};

                splitMeetString.forEach( function ( keyValuePair ) {
                    let keyValue = keyValuePair.split( '=', 2 );

                    if ( keyValue.length ) {
                        tempStringObj[keyValue[0]] = keyValue[1];
                    }
                } );
                
                return returnKey ? ( tempStringObj[returnKey] ? tempStringObj[returnKey] : null ) : tempStringObj;
            }
            //else return null
            return null;
        }

        return null;
    },


    userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },


    getFullUserMedia() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'Sorry user media is not available' );
        }
    },


    getUserAudio() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'Sorry user media is not available' );
        }
    },
    
     // To check the functionality of STUN/TURN servers visit:
     //https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
    //New RTCPeerConnection which will use a TURN server to negotiate connections
    getIceServer() {
        return {
            iceServers: [
                {
                    url: ["stun:stun.l.google.com:19302"]
                },
                {
                    username: " sanorita.student.civ19@itbhu.ac.in",
                    credential: "$@no@0112",
                    url: [
                        "turn:numb.viagenie.ca"
                      
                    ]
                }
            ]
        };
    },

//Declaring sharescreen function
    shareScreen() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getDisplayMedia( {
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            } );
        }

        else {
            throw new Error( 'Sorry user media not available' );
        }
    },


    

   //Chat settings
    addChat( data, senderType ) {
        //To me
        let chatMsgDiv = document.querySelector( '#chat-messages-display' );
        let contentAlign = 'justify-content-start';
        let senderName = 'You';
        let msgBg = 'bg-white';
        
        //To other connections
        if ( senderType === 'remote' ) {
            contentAlign = 'justify-content-end';
            senderName = data.sender;
            msgBg = 'bg-white';

            this.toggleChatNotificationBadge();
        }
        //Sender's info in chat
        let senderInfoDiv = document.createElement( 'div' );
        senderInfoDiv.className = 'sender-info';
        senderInfoDiv.innerHTML = `${ senderName } - ${ moment().format( 'Do MMMM, YYYY h:mm a' ) }`;

        let colMsgDiv = document.createElement( 'div' );
        colMsgDiv.className = `col-10 card chat-card rounded-0 msg ${ msgBg }`;
        colMsgDiv.innerHTML = xssFilters.inHTMLData( data.msg ).autoLink( { target: "_blank", rel: "nofollow"});

        let rowMsgDiv = document.createElement( 'div' );
        rowMsgDiv.className = `row ${ contentAlign } mb-2`;


        colMsgDiv.appendChild( senderInfoDiv );
        rowMsgDiv.appendChild( colMsgDiv );

        chatMsgDiv.appendChild( rowMsgDiv );

        
        //  Focus to the newly added message only if, page has focus and User has not moved scrollbar upward.
        //  This is to prevent moving the scroll position if user is reading previous messages.
        if ( this.pageHasFocus ) {
            rowMsgDiv.scrollIntoView();
        }
    },

    //Handling chat notification 
    toggleChatNotificationBadge() {
        if ( document.querySelector( '#chat-section' ).classList.contains( 'chat-opened' ) ) {
            document.querySelector( '#newchat-notification' ).setAttribute( 'hidden', true );
        }

        else {
            document.querySelector( '#newchat-notification' ).removeAttribute( 'hidden' );
        }
    },



    replaceTrack( stream, recipientPeer ) {
        let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;

        sender ? sender.replaceTrack( stream ) : '';
    },



    toggleShareIcons( share ) {
        let screeenShareElem = document.querySelector( '#share-screen' );

        if ( share ) {
            screeenShareElem.setAttribute( 'title', 'Stop sharing screen' );
            screeenShareElem.children[0].classList.add( 'text-primary' );
            screeenShareElem.children[0].classList.remove( 'text-white' );
        }

        else {
            screeenShareElem.setAttribute( 'title', 'Share screen' );
            screeenShareElem.children[0].classList.add( 'text-white' );
            screeenShareElem.children[0].classList.remove( 'text-primary' );
        }
    },


    toggleVideoBtnDisabled( disabled ) {
        document.getElementById( 'hide-video' ).disabled = disabled;
    },

    //Video full screen mode 
    maximiseStream( e ) {
        let elem = e.target.parentElement.previousElementSibling;

        elem.requestFullscreen() || elem.mozRequestFullScreen() || elem.webkitRequestFullscreen() || elem.msRequestFullscreen();
    },

    //Mute audio mode
    singleStreamToggleMute( e ) {
        if ( e.target.classList.contains( 'fa-microphone' ) ) {
            e.target.parentElement.previousElementSibling.muted = true;
            e.target.classList.add( 'fa-microphone-slash' );
            e.target.classList.remove( 'fa-microphone' );
        }

        else {
            e.target.parentElement.previousElementSibling.muted = false;
            e.target.classList.add( 'fa-microphone' );
            e.target.classList.remove( 'fa-microphone-slash' );
        }
    },

    //Saving recorded video/screen file
    saveRecordedStream( stream, user ) {
        let blob = new Blob( stream, { type: 'video/webm' } );
        let file = new File( [blob], `${ user }-${ moment().unix() }-record.webm` );

        saveAs( file );
    },


    toggleModal( id, show ) {
        let el = document.getElementById( id );

        if ( show ) {
            el.style.display = 'block';
            el.removeAttribute( 'aria-hidden' );
        }

        else {
            el.style.display = 'none';
            el.setAttribute( 'aria-hidden', true );
        }
    },


    //Handling user video(person who organises meet)
    setLocalStream( stream, mirrorMode = true ) {
        const myVideoElem = document.getElementById( 'my-video' );
        myVideoElem.style.marginTop = "20px";
        myVideoElem.srcObject = stream;
        mirrorMode ? myVideoElem.classList.add( 'mirror-mode' ) : myVideoElem.classList.remove( 'mirror-mode' );
    },

    //Adjusting video sizes as per participants number
    adjustAllVideoSize() {
        let elem = document.getElementsByClassName( 'card' );
        let totalVideosOnScreen = elem.length;
        //  let newWidth = (100 / totalRemoteVideoDesktop)+'%';/
        let newWidth = totalVideosOnScreen < 2 ? '100%' : (
            totalVideosOnScreen == 2 ? '49%':(
            totalVideosOnScreen == 3 ? '32.33%' : (
                totalVideosOnScreen <= 8 ? '24%' : (
                    totalVideosOnScreen <= 15 ? '19%' : (
                        totalVideosOnScreen <= 18 ? '15%' : (
                            totalVideosOnScreen <= 23 ? '14%' : (
                                totalVideosOnScreen <= 32 ? '11%' : '9%'
                            )
                        )
                    )
                )
            )
            )
        );


        for ( let i = 0; i < totalVideosOnScreen; i++ ) {
            if(totalVideosOnScreen==1)
        {
            elem[i].style.contentAlign = 'justify-content-center';
            elem[i].style.width = '90%';
            
        }
        else
        {
            elem[i].style.width = newWidth;
        }
            
        }
    },

    //Yhase krna hai
    createDemoRemotes( str, total = 6 ) {
        let i = 0;

        let testInterval = setInterval( () => {
            let newVid = document.createElement( 'video' );
            newVid.id = `demo-${ i }-video`;
            newVid.srcObject = str;
            newVid.autoplay = true;
            newVid.className = 'remote-video';

            //video controls elements
            let videoControlDiv = document.createElement( 'div' );
            videoControlDiv.className = 'remote-video-controls';
            videoControlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                <i class="fa fa-expand text-white remote-video-expand" title="Expand"></i>`;

            //create a new div for card
            let videoDiv = document.createElement( 'div' );
            videoDiv.className = 'card card-sm';
            videoDiv.id = `demo-${ i }`;
            videoDiv.appendChild( newVid );
            videoDiv.appendChild( videoControlDiv );

            //put div in main-video-section elem
            document.getElementById( 'other-videos' ).appendChild( videoDiv );

            this.adjustAllVideoSize();

            i++;

            if ( i == total ) {
                clearInterval( testInterval );
            }
        }, 2000 );
    }
};




