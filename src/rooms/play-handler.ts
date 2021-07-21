import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("string")
    choice = ''

    @type("number")
    score = 0;

    @type("boolean")
    ready = false
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    updatePlayer (sessionId: string, data: any) {
        
        this.players.get(sessionId).choice = data.choice;
        this.players.get(sessionId).score += 1;
        this.players.get(sessionId).ready = data.ready
    
    }  
    
}

export class PlayHanderRoom extends Room<State> {
    maxClients = 2;
    
    onCreate (options) {
        const { gameId } = options
        this.roomId = gameId
        this.setState(new State());
        
        this.clock.setInterval(()=>{
            
            var s_ids = []
            this.clients.forEach(client => {
                s_ids.push(client["sessionId"])
            });
            if (s_ids.length >= 2){
                console.log(this.state.players.get(s_ids[0]).ready)
                if (this.state.players.get(s_ids[0]).ready && this.state.players.get(s_ids[1]).ready) {
                    var uid = 1
                    var s_ids = []
                    this.clients.forEach(client => {
                        s_ids.push(client["sessionId"])
                        console.log(this.state.players.get(client.sessionId).choice)
                    });
                    
                    if (s_ids.length < 2){
                        console.log("not ready", s_ids.length) 
                    }
                    else{
                        // this.clock.clear()
                        var results = {}
                        s_ids.forEach(session_id =>{
                            results[session_id] = this.state.players.get(session_id).choice
                        })
                        var player1 = results[Object.keys(results)[0]]
                        var player2 = results[Object.keys(results)[1]]
                        var winner;
                        if (player1 === player2) {
                            winner = null
                          } else if (player1 === "Rock") {
                            if (player2 === "Scissors") {
                              winner = Object.keys(results)[0];
                            } else {
                              winner = Object.keys(results)[1];
                            }
                          } else if (player1 === "Paper") {
                            if (player2 === "Rock") {
                              winner = Object.keys(results)[0];
                            } else {
                              winner = Object.keys(results)[1];
                            }
                          } else if (player1 === "Scissors") {
                            if (player2 === "Rock") {
                              winner = Object.keys(results)[1];
                            } else {
                              winner = Object.keys(results)[0];
                            }
                          }  
                        
                        this.clients.forEach(client =>{
                            var opponentChoice = null
                            client.send("result", {winner, opponentChoice, results, s_ids})
                        })
                    }         
                }                
            }
            else{
                console.log("You need 2 people to play this game")
            }
            

          

        },700)

        this.onMessage("update-player", (client, data) => {
            console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
            this.state.updatePlayer(client.sessionId, data);
        });

    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
