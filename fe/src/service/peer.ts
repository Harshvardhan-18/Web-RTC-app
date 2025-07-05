class PeerService {
    peer: RTCPeerConnection;
    constructor() {
      if (!this.peer) {
        this.peer = new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
              ],
            },
          ],
        });
      }
    }
    async getAnswer(offer:RTCSessionDescription){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            const answer=await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(answer));
            return answer;
        }
    }
    async getOffer(){
        if(this.peer){
            const offer =await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }
    async setLocalDescription(ans:RTCSessionDescription){
        if(this.peer){
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        }
    }
    async setRemoteDescription(desc: RTCSessionDescription) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(desc));
        }
    }
} 

export default new PeerService();