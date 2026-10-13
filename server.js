const path=require('path');
const express=require('express');
const http=require('http');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:true,credentials:false}});
const PORT=process.env.PORT||3000;
const ADMIN_CODE=process.env.ADMIN_CODE||'AULA3';
const groups={};

app.use(express.static(__dirname));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'admin.html')));

function safe(v,n=40){return String(v||'').replace(/[<>]/g,'').trim().slice(0,n)}
function snapshot(){const out={};Object.keys(groups).forEach(k=>out[k]=groups[k]);return out}
function broadcast(){io.to('admins').emit('admin:state',snapshot())}

function updateGroup(group,data,socket){
  group=safe(group,20);
  if(!group)return null;
  const prev=groups[group]||{group,online:true,completed:[],badges:[],bits:0,current:0,help:null};
  groups[group]=Object.assign(prev,data||{},{group,online:true,socketId:socket.id,lastSeen:Date.now()});
  socket.data.group=group;
  socket.join('group:'+group);
  broadcast();
  return groups[group];
}

io.on('connection',socket=>{
  socket.on('student:join',payload=>{
    const p=payload||{}, prog=p.progress||{};
    updateGroup(p.group,{
      avatar:safe(p.avatar,4)||'🚀',
      bits:Number(prog.bits)||0,
      completed:Array.isArray(prog.completed)?prog.completed.slice(0,4):[],
      badges:Array.isArray(prog.badges)?prog.badges.slice(0,8).map(x=>safe(x,40)):[],
      current:Number(prog.current)||0,
      feedback:safe(prog.feedback,180)
    },socket);
  });

  socket.on('student:progress',p=>{
    p=p||{};
    updateGroup(p.group,{
      avatar:safe(p.avatar,4)||'🚀',
      bits:Number(p.bits)||0,
      completed:Array.isArray(p.completed)?p.completed.slice(0,4):[],
      badges:Array.isArray(p.badges)?p.badges.slice(0,8).map(x=>safe(x,40)):[],
      current:Number(p.current)||0,
      feedback:safe(p.feedback,180)
    },socket);
  });

  socket.on('student:help',p=>{
    p=p||{};
    const g=updateGroup(p.group,{},socket);
    if(g){
      g.help={reason:safe(p.reason,90),mission:Number(p.mission)||0,at:Date.now()};
      broadcast();
    }
  });

  socket.on('admin:join',p=>{
    const ok=safe(p&&p.code,50)===ADMIN_CODE;
    socket.emit('admin:auth',{ok});
    if(ok){
      socket.data.admin=true;
      socket.join('admins');
      socket.emit('admin:state',snapshot());
    }
  });

  socket.on('admin:watch',p=>{
    if(!socket.data.admin)return;
    const group=safe(p&&p.group,20);
    const prev=socket.data.watchingGroup;
    if(prev&&prev!==group)io.to('group:'+prev).emit('teacher:command',{type:'watching',active:false});
    socket.data.watchingGroup=group;
    if(group)io.to('group:'+group).emit('teacher:command',{type:'watching',active:true});
  });

  socket.on('admin:unwatch',p=>{
    if(!socket.data.admin)return;
    const group=safe((p&&p.group)||socket.data.watchingGroup,20);
    if(group)io.to('group:'+group).emit('teacher:command',{type:'watching',active:false});
    socket.data.watchingGroup='';
  });

  socket.on('admin:clearHelp',p=>{
    if(!socket.data.admin)return;
    const g=groups[safe(p&&p.group,20)];
    if(g){g.help=null;broadcast();}
  });

  socket.on('admin:command',cmd=>{
    if(!socket.data.admin)return;
    cmd=cmd||{};
    const payload={type:safe(cmd.type,30),message:safe(cmd.message,180),mission:Number(cmd.mission)||0};
    if(cmd.scope==='group'){
      const g=safe(cmd.group,20);
      io.to('group:'+g).emit('teacher:command',payload);
    }else{
      io.emit('teacher:command',payload);
    }
  });

  socket.on('disconnect',()=>{
    if(socket.data.admin&&socket.data.watchingGroup)io.to('group:'+socket.data.watchingGroup).emit('teacher:command',{type:'watching',active:false});
    const g=socket.data.group;
    if(g&&groups[g]&&groups[g].socketId===socket.id){
      groups[g].online=false;
      groups[g].lastSeen=Date.now();
      broadcast();
    }
  });
});

server.listen(PORT,'0.0.0.0',()=>{
  console.log('Creativos Digitales listo en http://localhost:'+PORT);
  console.log('Panel docente: http://localhost:'+PORT+'/admin.html');
});