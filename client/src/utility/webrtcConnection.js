class WebRTCConnection {

    constructor(socket, files = null, setCompleted, setChunkData, writableRef = null, updatePercent) {
        this.socket = socket;
        this.files = files;
        this.setChunkData = setChunkData;
        this.writableRef = writableRef
        this.currentFileSize = 0
        this.updatePercent = updatePercent
        this.currentFileName = null;
        this.recvSize = 0;
        this.recvTotal = 0;


        this.pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                        "turn:openrelay.metered.ca:80",
                        "turn:openrelay.metered.ca:443",
                        "turn:openrelay.metered.ca:443?transport=tcp",
                        "turns:openrelay.metered.ca:443?transport=tcp"
                    ],
                    username: "openrelayproject",
                    credential: "openrelayproject"
                },
                {
                    urls: "turn:relay1.expressturn.com:3480",
                    username: "174815294428829333",
                    credential: "TbGkxhTPVSbF87HXi3Pe1sDqnlo="
                }
            ]

        });

        this.dataChannel = null;
        // this.receivedBuffers = [];
        this.remoteDescriptionSet = false;
        this.pendingCandidates = [];

        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit("webrtc-candidate", { candidate: event.candidate, to: this.remoteId });
            }
        };

        this.pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", this.pc.iceConnectionState);

            if (
                this.pc.iceConnectionState === "connected" ||
                this.pc.iceConnectionState === "completed"
            ) {
                setCompleted(true)
                console.log("user connected")
            }
        };
    }

    async handleIncomingMessage(data) {
        try {
            // Try to parse JSON (for control messages)
            const msg = JSON.parse(data);
            console.log(msg)


            if (msg?.type === "meta") {
                console.log("📦 Metadata received");
                return this.receiveMetaData(data);
            } else if (msg?.type === "file-name") {
                console.log("📥 File name received:", msg);
                this.currentFileName = msg.name
                this.currentFileSize = msg.size

                return this.handleAcceptName(msg); // <-- Automatically called here
            }
            // Add more types here as needed
        } catch {

            console.log("🔸Binary chunk received", this.currentFileSize);
            await this.handleReceiveMessage(data, this.writableRef, this.currentFileSize, (p) => this.updatePercent(this.currentFileName, p))

        }
    }


    async createOffer(senderId, remoteId) {
        this.remoteId = remoteId;
        this.dataChannel = this.pc.createDataChannel("fileTransfer");

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.dataChannel.onopen = () => {
            console.log("Sender data channel OPEN");
            if (this.files) {
                this.sendMetaData(this.files);
            }
        };

        this.dataChannel.onmessage = (e) => {
            this.handleIncomingMessage(e.data);
        };

        this.socket.emit("webrtc-offer", { offer, from: senderId, to: remoteId });
    }

    async handleOffer(offer, remoteId) {

        this.remoteId = remoteId;
        console.log(this.remoteId)
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        this.remoteDescriptionSet = true;

        this.pendingCandidates.forEach(candidate => this.pc.addIceCandidate(candidate));
        this.pendingCandidates = [];

        const messagePromise = new Promise((resolve) => {
            this.pc.ondatachannel = (event) => {
                this.dataChannel = event.channel;

                this.dataChannel.onopen = () => {
                    console.log("Receiver data channel OPEN");
                };

                this.dataChannel.onmessage = (e) => {
                    const data = this.handleIncomingMessage(e.data)
                    console.log("Received metadata:", data);
                    resolve(data);
                };
            };
        });

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        this.socket.emit("webrtc-answer", { answer, to: remoteId });

        const receivedFileList = await messagePromise;
        return receivedFileList;
    }

    async handleAnswer(answer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
        this.remoteDescriptionSet = true;

        // Process pending candidates
        this.pendingCandidates.forEach(candidate => this.pc.addIceCandidate(candidate));
        this.pendingCandidates = [];
    }


    async addIceCandidate(candidate) {
        console.log("Adding ICE candidate:", candidate);
        if (this.remoteDescriptionSet) {
            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Candidate added successfully.");
        } else {
            console.log("Remote description not set yet, queuing candidate.");
            this.pendingCandidates.push(new RTCIceCandidate(candidate));
        }
    }

    sendMetaData(files) {
        if (this.dataChannel && this.dataChannel.readyState === "open") {
            const metaArray = files.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }));

            const metaMessage = {
                type: "meta",
                files: metaArray
            };

            this.dataChannel.send(JSON.stringify(metaMessage));
            console.log("Metadata sent:", metaMessage);

        } else {
            console.log("DataChannel not open. Cannot send metadata yet.");
        }
    }


    async acceptFileName(file) {
        const msg = JSON.parse(file)
        this.currentFileName = msg?.name
        this.currentFileSize = msg?.size

        this.dataChannel.send(file);
    }

    async handleAcceptName(filename) {
        console.log(this.files)
        console.log(filename)

        const file = this.files.find(item => item.name === filename.name);
        console.log(file)
        if (file) {
            this.currentFileName = file.name
            this.currentFileSize = file.size
            this.sendFile(file.file, (p) => this.updatePercent(file.name, p));
        } else {
            console.warn("Requested file not found:", filename);
        }
    }


    async sendFile(file, setPercent) {
        this.currentFileSize = file.size;
        const chunkSize = 256 * 1024; // 512 KB chunks
        const maxBuffer = 16 * 1024 * 1024; // 16 MB max DataChannel buffer
        let offset = 0;

        const waitForBuffer = () => new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.dataChannel.bufferedAmount < maxBuffer) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50); // check every 50ms
        });

        // Start sending
        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);        // Create file chunk
            await waitForBuffer();                                       // Wait for DataChannel buffer to clear
            const buffer = await chunk.arrayBuffer(); 
            console.log(this.dataChannel.bufferedAmountLowThreshold)  
            console.log(this.dataChannel.bufferedAmount)                     // Read chunk into buffer

            if (this.dataChannel.readyState !== "open") {
                console.error("DataChannel is closed. Aborting.");
                return;
            }

            this.dataChannel.send(buffer);                               // Send buffer over WebRTC
            offset += buffer.byteLength;

            // Update progress
            const percent = Math.round((offset / file.size) * 100);
            setPercent(percent);
            console.log(`Sending: ${percent}%`);
        }

        // End-of-file signal
        if (this.dataChannel.readyState === "open") {
            this.dataChannel.send("EOF");
            console.log("✅ File transfer complete");
        }
    }


    receiveMetaData(filesArray) {
        const data = JSON.parse(filesArray)

        if (Array.isArray(data?.files)) {
            this.receivedFileList = data?.files;
            return data?.files;
        } else {
            console.error("Invalid files array received in receiveMetaData");
            return null;
        }
    }


    async handleReceiveMessage(data, writableRef = null, fileSize, setPercent) {
        try {
            let percent = 0
            console.log(fileSize)
            if (data === "EOF") {
                if (writableRef?.current) {
                    await writableRef.current.close();
                    console.log("Writable stream closed after receiving file.");
                    this.updatePercent(this.currentFileName, 100);
                }

                this.recvSize = 0;
                this.recvTotal = 0;
                this.currentFileName = null;

                return;
            }

            if (writableRef?.current) {
                const binaryChunk = new Uint8Array(data);

                await writableRef.current.write(binaryChunk);
                console.log(data.byteLength)
                this.recvSize += data.byteLength || data.size;


                if (!this.recvTotal && fileSize) {
                    this.recvTotal = fileSize;
                    console.log(this.recvTotal, fileSize)
                }


                console.log(this.recvTotal)
                if (this.recvTotal > 0) {
                    console.log(this.recvTotal)
                    percent = Math.round((this.recvSize / this.recvTotal) * 100);

                    setPercent(percent);

                    console.log(`Receiving progress: ${percent}%`);
                }
            } else {
                console.warn("WritableRef not provided. Chunk not saved.");
            }
        } catch (error) {
            console.error("Error handling received message:", error);
        }
    }

    closeConnection() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        this.pc.close();
        console.log("WebRTC connection closed");
    }
}

export default WebRTCConnection;