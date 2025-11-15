let username="";
let isRecording=false;
let mediaRecorder, audioChunks=[];

/* WebSocket */
const socket = new WebSocket('ws://localhost:3000');

/* Mock Users */
const users=["Abdullah","Friend","Ali","Sara"];
const chatList=document.getElementById("chatList");
users.forEach(u=>{
    const div=document.createElement("div");
    div.className="chat-item";
    div.onclick=()=>openChat(u);
    div.innerHTML=`<img src="assets/user1.png"><div class="chat-info"><strong>${u}</strong><small>Online</small></div>`;
    chatList.appendChild(div);
});

/* Open Chat */
function openChat(name){
    username=name;
    document.getElementById("chatName").innerText=name;
    document.getElementById("messages").innerHTML="";
    document.getElementById("status").innerText="Online";
}

/* Send Message */
function sendMsg(){
    let text=document.getElementById("msgText").value;
    if(text.trim()==="") return;
    const data={type:'text',username:username,content:text};
    socket.send(JSON.stringify(data));
    document.getElementById("msgText").value="";
}

/* Receive Message */
socket.onmessage=function(event){
    const data=JSON.parse(event.data);
    const msg=document.createElement("div");
    msg.className=data.username===username?"msg msg-right":"msg msg-left";
    if(data.type==='text'){
        msg.innerText=`${data.username}: ${data.content}`;
    } else if(data.type==='file'){
        msg.innerHTML=`${data.username} sent: <strong>${data.filename}</strong>`;
    }
    document.getElementById("messages").appendChild(msg);
    document.getElementById("messages").scrollTop=document.getElementById("messages").scrollHeight;
}

/* File send */
function sendFile(event){
    const file=event.target.files[0];
    const data={type:'file',username:username,filename:file.name};
    socket.send(JSON.stringify(data));
}

/* Voice Record */
function startRecording(){
    if(isRecording){
        mediaRecorder.stop();
        isRecording=false;
    } else {
        navigator.mediaDevices.getUserMedia({ audio:true }).then(stream=>{
            mediaRecorder=new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording=true;
            audioChunks=[];
            mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
            mediaRecorder.onstop=()=>{
                const audioBlob=new Blob(audioChunks);
                const audioUrl=URL.createObjectURL(audioBlob);
                const audio=document.createElement("audio");
                audio.controls=true;
                audio.src=audioUrl;
                const msg=document.createElement("div");
                msg.className="msg msg-right";
                msg.appendChild(audio);
                document.getElementById("messages").appendChild(msg);
            };
        });
    }
}

/* Dark Mode */
function toggleDark(){
    document.body.classList.toggle("dark-mode");
}

/* Emoji */
function openEmoji(){
    const picker=document.getElementById("emojiPicker");
    picker.style.display=(picker.style.display==="none")?"block":"none";
    picker.addEventListener('emoji-click', e=>{
        document.getElementById("msgText").value+=e.detail.unicode;
    });
}
