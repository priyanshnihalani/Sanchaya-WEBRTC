class WebRTCConnection {
    constructor(socket, files = null, setCompleted, setChunkData, writableRef = null, updatePercent, setEstimatedTimes, setHasError) {
        this.socket = socket;
        this.files = files;
        this.writableRef = writableRef;
        this.updatePercent = updatePercent;
        this.setEstimatedTimes = setEstimatedTimes;
        this.setHasError = setHasError;
        this.setChunkData = setChunkData;

        this.currentFileName = null;
        this.currentFileSize = 0;

        this.recvSize = 0;
        this.recvTotal = 0;

        this.connectionAlive = true;
        this.pendingCandidates = [];
        this.ackQueue = [];
        this.isRelay = false;

        this.pc = this.createPeerConnection();

        window.addEventListener("offline", () => {
            this.failTransfer("offline");
        });
    }

    createPeerConnection(forceRelay = false) {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "turns:turn.sanchaya.space:443?transport=tcp",
                        "turn:turn.sanchaya.space:3478?transport=tcp",
                        "turn:turn.sanchaya.space:3478?transport=udp"
                    ],
                    username: "priyansh",
                    credential: "myturnserver"
                },
                { urls: ["stun:stun.l.google.com:19302"] }
            ],
            iceTransportPolicy: forceRelay ? "relay" : "all"
        });

        pc.onicecandidate = (event) => {
            if (!event.candidate) return;

            const cand = event.candidate.candidate;

            // ❌ Ignore IPv6
            if (cand.includes("::")) return;

            // 🔥 Detect TURN
            if (cand.includes("relay")) {
                this.isRelay = true;
                console.log("Using TURN relay");
            }

            this.socket.emit("webrtc-candidate", {
                candidate: event.candidate,
                to: this.remoteId
            });
        };

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log("ICE state:", state);

            if (state === "connected" || state === "completed") {
                console.log("Connection stable");
            }

            if (state === "failed") {
                console.warn("ICE failed → forcing TURN");
                this.restartWithTURN();
            }

            if (state === "closed") {
                this.failTransfer("closed");
            }
        };

        return pc;
    }

    async restartWithTURN() {
        try {
            if (this.dataChannel) this.dataChannel.close();
            if (this.pc) this.pc.close();

            this.pc = this.createPeerConnection(true);
            this.setupDataChannel();

            if (this.files) {
                await this.createOffer(this.senderId, this.remoteId);
            }

        } catch (err) {
            console.error("TURN restart failed", err);
            this.failTransfer("turn-failed");
        }
    }

    setupDataChannel(channel = null) {
        this.dataChannel = channel || this.pc.createDataChannel("fileTransfer");

        this.dataChannel.onopen = () => {
            console.log("DataChannel OPEN");
            if (this.files) this.sendMetaData(this.files);
        };

        this.dataChannel.onclose = () => {
            this.failTransfer("channel-closed");
        };

        this.dataChannel.onerror = () => {
            this.failTransfer("channel-error");
        };

        this.dataChannel.onmessage = (e) => {
            this.handleIncomingMessage(e.data);
        };
    }

    async createOffer(senderId, remoteId) {
        this.senderId = senderId;
        this.remoteId = remoteId;

        this.setupDataChannel();

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        this.socket.emit("webrtc-offer", { offer, from: senderId, to: remoteId });
    }

    async handleOffer(offer, remoteId) {
        this.remoteId = remoteId;

        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

        this.pc.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };

        await this.flushCandidates();

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        this.socket.emit("webrtc-answer", { answer, to: remoteId });
    }

    async handleAnswer(answer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
        await this.flushCandidates();
    }

    async addIceCandidate(candidate) {
        try {
            if (this.pc.remoteDescription) {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                this.pendingCandidates.push(candidate);
            }
        } catch (err) {
            console.error("Candidate error:", err);
        }
    }

    async flushCandidates() {
        for (const c of this.pendingCandidates) {
            await this.pc.addIceCandidate(new RTCIceCandidate(c));
        }
        this.pendingCandidates = [];
    }

    sendMetaData(files) {
        const meta = {
            type: "meta",
            files: files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            }))
        };

        this.dataChannel.send(JSON.stringify(meta));
    }

    async handleIncomingMessage(data) {
        if (typeof data === "string") {
            try {
                const msg = JSON.parse(data);

                if (msg.type === "meta") {
                    this.receivedFileList = msg.files;
                    return;
                }

                if (msg.type === "file-name") {
                    this.currentFileName = msg.name;
                    this.currentFileSize = msg.size;
                    return;
                }

                if (msg.type === "ack") {
                    this.ackQueue.push(true);
                    return;
                }

            } catch { }
        }

        await this.handleReceiveMessage(data);
    }

    async sendFile(file) {
        const maxBuffer = 1 * 1024 * 1024;

        const chunkSizes = this.isRelay
            ? [16 * 1024, 32 * 1024]
            : [64 * 1024, 128 * 1024, 256 * 1024];

        let offset = 0;

        const waitForAck = async () => {
            let waited = 0;
            while (this.ackQueue.length === 0) {
                await new Promise(r => setTimeout(r, 10));
                waited += 10;
                if (waited > 20000) throw new Error("ACK timeout");
            }
            this.ackQueue.shift();
        };

        while (offset < file.size) {
            if (this.dataChannel.bufferedAmount > maxBuffer) {
                await new Promise(r => setTimeout(r, 50));
                continue;
            }

            const size = chunkSizes[0];
            const chunk = await file.slice(offset, offset + size).arrayBuffer();

            this.dataChannel.send(chunk);

            await waitForAck();

            offset += chunk.byteLength;
        }

        this.dataChannel.send("EOF");
    }

    async handleReceiveMessage(data) {
        if (data === "EOF") {
            await this.writableRef.current.close();
            this.recvSize = 0;
            return;
        }

        const chunk = new Uint8Array(data);
        await this.writableRef.current.write(chunk);

        this.recvSize += chunk.length;

        this.dataChannel.send(JSON.stringify({ type: "ack" }));
    }

    failTransfer(reason) {
        console.error("Transfer failed:", reason);

        this.connectionAlive = false;

        if (this.dataChannel) this.dataChannel.close();
        if (this.pc) this.pc.close();

        this.setHasError(prev => ({
            ...prev,
            [this.currentFileName || "__connection__"]: true
        }));
    }

    closeConnection() {
        if (this.dataChannel) this.dataChannel.close();
        if (this.pc) this.pc.close();
    }
}

export default WebRTCConnection;