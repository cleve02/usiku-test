import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import express from 'express';
import { PlayHanderRoom } from "./rooms/play-handler";

const port = Number(process.env.PORT || 2567);

export default Arena({
    getId: () => "Rock Paper Scissors",

    initializeGameServer: (gameServer) => {

        gameServer.define("state_handler", PlayHanderRoom)
            .enableRealtimeListing();


        gameServer.onShutdown(function(){
            console.log(`game server is going down.`);
          });


    },

    initializeExpress: (app) => {
        // app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))
        app.use('/', express.static(path.join(__dirname, "static")));

        app.use('/colyseus', monitor());

        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');        
        app.set('views', path.join(__dirname, 'static'));
        app.get("/", (req, res) => {
            res.render('start')
          });       

        app.use("/play", (req, res) => {
            const gameId = req.query.gameId
            const join_gameId = req.query.join_gameId

            if (gameId) {
                res.render('play', {gameId: gameId, join_gameId: null})
            } else if(join_gameId){
                res.render('play', {join_gameId: join_gameId, gameId: null})
            }

          });        
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});

