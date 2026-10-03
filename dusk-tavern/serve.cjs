'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../sv_tavern.html'),port=Number(process.env.PORT)||8765;
http.createServer((req,res)=>{let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}if(url!=='/'&&url!=='/sv_tavern.html'){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);}).listen(port,'127.0.0.1',()=>console.log('幻境酒馆: http://127.0.0.1:'+port));
