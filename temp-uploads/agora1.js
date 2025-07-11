const APP_ID = "405c1437f7be41398388e1a7c35fe5c6";
const TOKEN = "007eJxTYPh54uvMIBV7cb7jS8Q2y6q8CZDM3nJu1eO9r+1rqlU/iL5VYDAxME02NDE2TzNPSjUxNLa0MLawSDVMNE82Nk1LNU02e7AiJKMhkJGBgauIlZEBAkF8FobcxMw8BgYAY70fJg==";
const CHANNEL = "main";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};
let userCount = 0;

// Función para decodificar un token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing token:", e);
    return null;
  }
}

// Obtener el nombre de usuario del token
function getUsernameFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) {
    console.error("Token inválido o no se pudo decodificar.");
    return "Usuario desconocido";
  }

  const username = decoded.username;
  if (!username) {
    console.warn("El token no contiene un campo 'username'.");
    return "Usuario desconocido";
  }

  return username;
}

// Actualizar contador de cámaras
function updateCameraCount() {
  document.getElementById("camera-count").textContent = `(${userCount})`;
}

// Crear un contenedor de video
function createVideoContainer(uid, isLocal = false, username = "Usuario desconocido") {
  const div = document.createElement("div");
  div.className = "position-relative";
  div.id = `user-container-${uid}`;
  div.style = "width: 100%; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; margin-bottom: 10px;";

  div.innerHTML = `
    <div class="video-player w-100 h-100 bg-dark" id="user-${uid}"></div>
    <div class="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between align-items-center" 
         style="background: rgba(0,0,0,0.4);">
      <span class="text-white small">${isLocal ? "Tú" : username}</span>
      <div>
        <i class="fas fa-microphone text-white me-2" id="mic-icon-${uid}"></i>
        <i class="fas fa-video text-white" id="video-icon-${uid}"></i>
      </div>
    </div>`;
  
  return div;
}

// Función para unirse al canal y mostrar el stream local
let joinAndDisplayLocalStream = async () => {
  try {
    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);

    const UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

    const token = localStorage.getItem("token");
    const username = getUsernameFromToken(token);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    const videoStreams = document.getElementById("video-streams");
    const playerContainer = createVideoContainer(UID, true, username);
    videoStreams.appendChild(playerContainer);

    localTracks[1].play(`user-${UID}`);

    userCount++;
    updateCameraCount();

    await client.publish(localTracks);

    document.getElementById("join-btn").style.display = "none";
    document.getElementById("mic-btn").style.display = "inline-block";
    document.getElementById("camera-btn").style.display = "inline-block";
    document.getElementById("leave-btn").style.display = "inline-block";
  } catch (error) {
    console.error("Error al unirse al stream:", error);
    alert("Error al acceder a la cámara o micrófono. Por favor, verifica los permisos.");
  }
};

// Manejar publicación de usuarios remotos
let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  const remoteToken = TOKEN; // Reemplazar con token dinámico en producción
  const username = getUsernameFromToken(remoteToken);

  if (mediaType === "video") {
    const videoStreams = document.getElementById("video-streams");
    let player = document.getElementById(`user-container-${user.uid}`);
    if (!player) {
      player = createVideoContainer(user.uid, false, username);
      videoStreams.appendChild(player);
    }
    user.videoTrack.play(`user-${user.uid}`);
    userCount++;
    updateCameraCount();
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

// Manejar salida de usuarios
let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  const container = document.getElementById(`user-container-${user.uid}`);
  if (container) {
    container.remove();
    userCount--;
    updateCameraCount();
  }
};

// Salir del canal y limpiar el stream local
let leaveAndRemoveLocalStream = async () => {
  for (let track of localTracks) {
    track.stop();
    track.close();
  }

  await client.leave();
  document.getElementById("video-streams").innerHTML = "";

  document.getElementById("join-btn").style.display = "inline-block";
  document.getElementById("mic-btn").style.display = "none";
  document.getElementById("camera-btn").style.display = "none";
  document.getElementById("leave-btn").style.display = "none";

  userCount = 0;
  updateCameraCount();
};

// Alternar micrófono
let toggleMic = async () => {
  if (localTracks[0]) {
    await localTracks[0].setMuted(!localTracks[0].muted);
    const micBtn = document.getElementById("mic-btn");
    micBtn.innerHTML = localTracks[0].muted
      ? '<i class="fas fa-microphone-slash"></i>'
      : '<i class="fas fa-microphone"></i>';
    micBtn.classList.toggle("btn-danger", localTracks[0].muted);
  }
};

// Alternar cámara
let toggleCamera = async () => {
  if (localTracks[1]) {
    await localTracks[1].setMuted(!localTracks[1].muted);
    const cameraBtn = document.getElementById("camera-btn");
    cameraBtn.innerHTML = localTracks[1].muted
      ? '<i class="fas fa-video-slash"></i>'
      : '<i class="fas fa-video"></i>';
    cameraBtn.classList.toggle("btn-danger", localTracks[1].muted);
  }
};

// Listeners iniciales
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mic-btn").style.display = "none";
  document.getElementById("camera-btn").style.display = "none";
  document.getElementById("leave-btn").style.display = "none";

  document.getElementById("join-btn").addEventListener("click", joinAndDisplayLocalStream);
  document.getElementById("leave-btn").addEventListener("click", leaveAndRemoveLocalStream);
  document.getElementById("mic-btn").addEventListener("click", toggleMic);
  document.getElementById("camera-btn").addEventListener("click", toggleCamera);
});
