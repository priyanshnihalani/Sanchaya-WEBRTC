class WebRTCConnection {

constructor(socket, files = null, setCompleted, setChunkData, writableRef = null, updatePercent, setEstimatedTimes, setHasError) {

    this.socket = socket;
    this.files = files;
    this.setCompleted = setCompleted;
    this.setChunkData = setChunkData;
    this.writableRef = writableRef;
    this.updatePercent = updatePercent;
    this.setEstimatedTimes = setEstimatedTimes;
    this.setHasError = setHasError;

    this.currentFileName = null;
    this.currentFileSize = 0;
    this.recvSize = 0;
    this.recvTotal = 0;

    this.pendingCandidates = [];
    this.remoteDescriptionSet = false;

    this.dataChannel = null;

    this.onAckReceived = null;
    this.connectionAlive = true;

    this.turnFallbackTimer = null;

    this.networkWatcher = () => {
        if (!navigator.onLine) {
            console.warn("Browser offline detected");
            this.failTransfer("offline");
        }
    };

    window.addEventListener("offline", this.networkWatcher);

    this.createPeerConnection(false);
    this.startTurnFallbackTimer();
}

createPeerConnection(forceRelay = false) {

    const config = {
        iceServers: [
            {
                urls: [
                    "turn:turn.sanchaya.space:3478?transport=udp",
                    "turn:turn.sanchaya.space:3478?transport=tcp"
                ],
                username: "priyansh",
                credential: "myturnserver"
            },
            {
                urls: ["stun:stun.l.google.com:19302"]
            }
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: forceRelay ? "relay" : "all"
    };

    this.pc = new RTCPeerConnection(config);

    this.pc.onicecandidate = (event) => {
        if (event.candidate) {
            this.socket.emit("webrtc-candidate", {
                candidate: event.candidate,
                to: this.remoteId
            });
        }
    };

    this.pc.oniceconnectionstatechange = () => {

        const state = this.pc.iceConnectionState;
        console.log("ICE State:", state);

        if (state === "connected" || state === "completed") {

            clearTimeout(this.turnFallbackTimer);
            this.setCompleted(true);

        }

        if (state === "failed") {

            console.warn("ICE failed → forcing TURN");

            this.recreatePeerConnectionWithRelay();

        }

        if (state === "disconnected") {

            console.warn("ICE temporarily disconnected");

        }

        if (state === "closed") {

            this.failTransfer("closed");

        }
    };
}

startTurnFallbackTimer() {

    this.turnFallbackTimer = setTimeout(() => {

        const state = this.pc.iceConnectionState;

        if (state !== "connected" && state !== "completed") {

            console.warn("Fallback to TURN relay");

            this.recreatePeerConnectionWithRelay();

        }

    }, 6000);
}

recreatePeerConnectionWithRelay() {

    try {
        this.pc.close();
    } catch {}

    console.log("Recreating PeerConnection with TURN only");

    this.createPeerConnection(true);
}

async createOffer(senderId, remoteId) {

    this.remoteId = remoteId;

    this.dataChannel = this.pc.createDataChannel("fileTransfer");

    this.setupDataChannel();

    const offer = await this.pc.createOffer();

    await this.pc.setLocalDescription(offer);

    this.socket.emit("webrtc-offer", { offer, from: senderId, to: remoteId });
}

async handleOffer(offer, remoteId) {

    this.remoteId = remoteId;

    await this.pc.setRemoteDescription(offer);

    this.remoteDescriptionSet = true;

    this.flushPendingCandidates();

    this.pc.ondatachannel = (event) => {

        this.dataChannel = event.channel;

        this.setupDataChannel();

    };

    const answer = await this.pc.createAnswer();

    await this.pc.setLocalDescription(answer);

    this.socket.emit("webrtc-answer", { answer, to: remoteId });
}

async handleAnswer(answer) {

    await this.pc.setRemoteDescription(answer);

    this.remoteDescriptionSet = true;

    this.flushPendingCandidates();
}

async addIceCandidate(candidate) {

    if (this.remoteDescriptionSet) {

        await this.pc.addIceCandidate(candidate);

    } else {

        this.pendingCandidates.push(candidate);

    }
}

flushPendingCandidates() {

    this.pendingCandidates.forEach(candidate => {

        this.pc.addIceCandidate(candidate);

    });

    this.pendingCandidates = [];
}

setupDataChannel() {

    this.dataChannel.onopen = () => {

        console.log("DataChannel OPEN");

        if (this.files) {
            this.sendMetaData(this.files);
        }
    };

    this.dataChannel.onerror = () => {

        this.failTransfer("datachannel-error");

    };

    this.dataChannel.onclose = () => {

        this.failTransfer("datachannel-closed");

    };

    this.dataChannel.onmessage = (e) => {

        this.handleIncomingMessage(e.data);

    };
}

sendMetaData(files) {

    if (!this.dataChannel || this.dataChannel.readyState !== "open") return;

    const metaArray = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
    }));

    this.dataChannel.send(JSON.stringify({
        type: "meta",
        files: metaArray
    }));
}

async handleIncomingMessage(data) {

    if (typeof data === "string") {

        const msg = JSON.parse(data);

        if (msg.type === "meta") {

            this.receivedFileList = msg.files;

            return;

        }

        if (msg.type === "ack") {

            if (this.onAckReceived) {

                this.onAckReceived();

            }

            return;

        }
    }

    await this.handleReceiveMessage(data);
}

async handleReceiveMessage(data) {

    if (data === "EOF") {

        if (this.writableRef?.current) {

            await this.writableRef.current.close();

        }

        return;
    }

    if (!this.writableRef?.current) return;

    const chunk = new Uint8Array(data);

    await this.writableRef.current.write(chunk);

    this.recvSize += chunk.byteLength;
}

failTransfer(reason) {

    console.error("Transfer failed:", reason);

    const key = this.currentFileName || "__connection__";

    this.setHasError(prev => ({
        ...prev,
        [key]: true
    }));

    if (this.writableRef?.current?.abort) {

        this.writableRef.current.abort();

    }

    try {
        this.dataChannel?.close();
    } catch {}

    this.connectionAlive = false;
}

closeConnection() {

    window.removeEventListener("offline", this.networkWatcher);

    clearTimeout(this.turnFallbackTimer);

    try {
        this.dataChannel?.close();
        this.pc?.close();
    } catch {}

    console.log("WebRTC closed");
}

}

export default WebRTCConnection;