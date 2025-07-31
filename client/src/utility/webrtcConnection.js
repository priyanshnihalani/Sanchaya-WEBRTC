class WebRTCConnection {

    constructor(socket, files = null, setCompleted, setChunkData, writableRef = null, updatePercent, setEstimatedTimes, setHasError) {
        this.socket = socket;
        this.files = files;
        this.setChunkData = setChunkData;
        this.writableRef = writableRef
        this.currentFileSize = 0
        this.updatePercent = updatePercent
        this.currentFileName = null;
        this.recvSize = 0;
        this.recvTotal = 0;
        this.setEstimatedTimes = setEstimatedTimes
        this.chunkTimeout;
        this.setHasError = setHasError

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
            ],
            iceTransportPolicy: "all"

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

    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return "Calculating...";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
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
            await this.handleReceiveMessage(data, this.writableRef, this.currentFileSize, (p) => this.updatePercent(this.currentFileName, p), this.formatTime)

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
            this.sendFile(file.file, (p) => this.updatePercent(file.name, p), this.formatTime);
        } else {
            console.warn("Requested file not found:", filename);
        }
    }





    async sendFile(file, setPercent, formatTime) {
        this.currentFileSize = file.size;

        const chunkSizes = [16 * 1024, 32 * 1024, 64 * 1024, 128 * 1024, 256 * 1024];
        let chunkIndex = 2; // Start with 64KB

        const maxBuffer = 16 * 1024 * 1024;
        const safeMargin = 256 * 1024;

        let offset = 0;
        const startTime = Date.now();
        let retryAttempts = 0;
        const maxRetries = 3;

        const waitForBuffer = () => new Promise((resolve, reject) => {
            let waited = 0;
            const timeoutLimit = 10000; // 10s max buffer wait
            const interval = setInterval(() => {
                if (this.dataChannel.bufferedAmount < (maxBuffer - safeMargin)) {
                    clearInterval(interval);
                    resolve();
                } else {
                    waited += 30;
                    if (waited > timeoutLimit) {
                        clearInterval(interval);
                        reject(new Error("Buffer stuck too long"));
                    }
                }
            }, 30);
        });

        while (offset < file.size) {
            try {
                await waitForBuffer();
            } catch (err) {
                retryAttempts++;
                console.warn(`Send buffer stuck. Retry attempt ${retryAttempts}`);
                if (retryAttempts >= maxRetries) {
                    console.error("Sending failed: buffer never drained.");
                    this.setHasError(prev => ({ ...prev, [file.name]: true }))


                    return;
                } else {
                    continue;
                }
            }

            retryAttempts = 0; // reset if buffer drained successfully

            const usageRatio = this.dataChannel.bufferedAmount / maxBuffer;

            if (usageRatio > 0.75 && chunkIndex > 0) {
                chunkIndex--;
                console.log(`🔻 Buffer high. Reducing chunk size to ${chunkSizes[chunkIndex] / 1024} KB`);
            } else if (usageRatio < 0.25 && chunkIndex < chunkSizes.length - 1) {
                chunkIndex++;
                console.log(`🔺 Buffer low. Increasing chunk size to ${chunkSizes[chunkIndex] / 1024} KB`);
            }

            const chunkSize = chunkSizes[chunkIndex];
            const chunk = file.slice(offset, offset + chunkSize);
            const buffer = await chunk.arrayBuffer();

            if (this.dataChannel.readyState !== "open") {
                console.error("DataChannel is closed. Aborting.");
                this.hasError = true;

                this.updatePercent?.(file.name, 0);
                this.setEstimatedTimes?.(prev => ({
                    ...prev,
                    [file.name]: "Connection lost",
                }));
                return;
            }

            try {
                this.dataChannel.send(buffer);
            } catch (err) {
                console.error("Send failed:", err);
                if (chunkIndex > 0) {
                    chunkIndex--;
                    console.warn(` Dropping to ${chunkSizes[chunkIndex] / 1024} KB and retrying...`);
                }
                continue;
            }

            offset += buffer.byteLength;

            const percent = Math.round((offset / file.size) * 100);
            setPercent(percent);
            console.log(`Sending: ${percent}% (${chunkSize / 1024} KB)`);

            const elapsedTime = (Date.now() - startTime) / 1000;
            const speed = offset / elapsedTime;
            const remainingBytes = file.size - offset;
            const estimatedSeconds = remainingBytes / speed;

            if (this.setEstimatedTimes) {
                this.setEstimatedTimes(prev => ({
                    ...prev,
                    [file.name]: formatTime(estimatedSeconds)
                }));
            } else {
                console.log("Estimated time remaining:", formatTime(estimatedSeconds));
            }
        }

        if (this.dataChannel.readyState === "open") {
            this.dataChannel.send("EOF");
            console.log(" File transfer complete");
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


    async handleReceiveMessage(data, writableRef = null, fileSize, setPercent, formatTime) {
        try {
            let percent = 0;

            // Reset adaptive timeout tracking
            if (this.chunkTimeout) clearTimeout(this.chunkTimeout);

            const startTime = Date.now();

            // Handle EOF: close stream and reset state
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

            // Handle binary chunk write
            if (writableRef?.current) {
                const binaryChunk = new Uint8Array(data);

                await writableRef.current.write(binaryChunk);
                console.log("Chunk size:", data.byteLength);
                this.recvSize += data.byteLength || data.size;

                // Set total file size once
                if (!this.recvTotal && fileSize) {
                    this.recvTotal = fileSize;
                    console.log("File size set:", this.recvTotal);
                }

                // Calculate progress
                if (this.recvTotal > 0) {
                    percent = Math.round((this.recvSize / this.recvTotal) * 100);
                    setPercent(percent);

                    const elapsedTime = (Date.now() - startTime) / 1000; // seconds
                    const speed = this.recvSize / elapsedTime; // bytes/sec
                    const remainingBytes = this.recvTotal - this.recvSize;
                    const estimatedSeconds = remainingBytes / speed;

                    //  Update estimated time in UI
                    if (this.setEstimatedTimes) {
                        this.setEstimatedTimes(prev => ({
                            ...prev,
                            [this.currentFileName]: formatTime(estimatedSeconds),
                        }));
                    } else {
                        console.log("Estimated time remaining:", formatTime(estimatedSeconds));
                    }


                    const adaptiveTimeout = Math.min(Math.max(estimatedSeconds * 2 * 1000, 10000), 60000); // 10–60s
                    this.chunkTimeout = setTimeout(() => {
                        console.error(" Chunk delay exceeded adaptive timeout. Transfer might be stuck.");
                        this.setHasError(prev => ({ ...prev, [this.currentFileName]: true }))

                        this.updatePercent(this.currentFileName, 0);

                        // Optional: Abort the writable stream
                        if (writableRef?.current?.abort) {
                            writableRef.current.abort();
                        }

                    }, adaptiveTimeout);

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