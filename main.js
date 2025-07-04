import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui";
let particlename;
 async function showModalForm(shower) {
            const modalForm = new mcui.ModalFormData()
                .title("Worldborderの設定")
                
                .slider("サイズ",0,200,1,mc.world.scoreboard.getObjective("border/config")?.getScore("size")/100)
                .slider("パーティクル間隔（横）",-50,50,1,mc.world.scoreboard.getObjective("border/config")?.getScore("interval"))
                .slider("パーティクル間隔（縦）",-50,50,1,mc.world.scoreboard.getObjective("border/config")?.getScore("scale"))
                .slider("パーティクルの高さ",-300,300,1,mc.world.scoreboard.getObjective("border/config")?.getScore("maxhigh"))
                .textField("パーティクル名","minecraftのパーティクル名", particlename)
                .slider("ダメージ",0,100,1,mc.world.scoreboard.getObjective("border/config")?.getScore("damage"))
                .slider("クールダウン（ティック）",0,200,1,mc.world.scoreboard.getObjective("border/config")?.getScore("cooldown"))
                .slider("可視化範囲",-1,100,1,mc.world.scoreboard.getObjective("border/config")?.getScore("seein"));
            const response = await modalForm.show(shower);
            if(response.canceled) return;
            else{
                mc.world.scoreboard.getObjective("border/config").setScore("size",response.formValues[0]*100);
                mc.world.scoreboard.getObjective("border/config").setScore("interval",response.formValues[1]);
                mc.world.scoreboard.getObjective("border/config").setScore("scale",response.formValues[2]);
                mc.world.scoreboard.getObjective("border/config").setScore("maxhigh",response.formValues[3]);
                mc.world.setDynamicProperty("particlename",response.formValues[4]);
                mc.world.scoreboard.getObjective("border/config").setScore("damage",response.formValues[5]);
                mc.world.scoreboard.getObjective("border/config").setScore("cooldown",response.formValues[6]);
                mc.world.scoreboard.getObjective("border/config").setScore("seein",response.formValues[7]);
            }
        }
let timer =11;
mc.system.runInterval(() => {
    particlename = mc.world.getDynamicProperty("particlename");
    for(const shower of mc.world.getDimension('overworld').getPlayers({ tags: ["wborder:showconfig"] })){
       showModalForm(shower);
       shower.removeTag("wborder:showconfig")
    }
    mc.world.getDimension('overworld').getEntities({ tags: ["wborder:adjust"] }).map(adjust => {
        let { x: borderx, y: bordery, z: borderz } = adjust.location;
        //adjustタグを付けたエンティティが中心
        //sizeスコアはサイズ（そのまま（ただし100倍で記入））
        //damageはそのまま
        //cooldown=無敵時間
        //maxhigh＝高さ(防具立てのYを0とした場合)
        //scale高さの間隔
        //invertal=横の間隔
        let size = mc.world.scoreboard.getObjective("border/config")?.getScore("size")/100;
        let damage = mc.world.scoreboard.getObjective("border/config")?.getScore("damage") ;
        let cooldown = mc.world.scoreboard.getObjective("border/config")?.getScore("cooldown");
        let maxhigh = mc.world.scoreboard.getObjective("border/config")?.getScore("maxhigh");
        let scale = mc.world.scoreboard.getObjective("border/config")?.getScore("scale");
        let interval
        if(mc.world.scoreboard.getObjective("border/config")?.getScore("interval")>0){
            interval = mc.world.scoreboard.getObjective("border/config")?.getScore("interval")/10;
        }else if(mc.world.scoreboard.getObjective("border/config")?.getScore("interval")!=0){
            interval = Math.abs(mc.world.scoreboard.getObjective("border/config")?.getScore("interval"))*10/size;
        }
        let cansee = mc.world.scoreboard.getObjective("border/config")?.getScore("seein");
        //playerでくーるくる
        for (const player of mc.world.getPlayers()) {
            if(mc.world.scoreboard.getObjective("border/cooldown")?.getScore(player)>0){
                mc.world.scoreboard.getObjective("border/cooldown")?.addScore(player,-1);
            }
            const { x: playerx, y: playery, z: playerz } = player.location;
        
        if(size==-2||size>=0){
            if(playerx < borderx - size  || playerx > borderx + size || playerz < borderz - size  || playerz > borderz + size ||size==-2){
                if(!(player.hasTag("wborder:nodamage"))){
                if (mc.world.scoreboard.getObjective("border/cooldown")?.getScore(player)==0){
                    player.addTag("wborder:out");
                    //if (playerx < -10  || playerx > 10  || playerz < -10  || playerz > 20 ) {
                    player.applyDamage(damage);
                    mc.world.scoreboard.getObjective("border/cooldown")?.setScore(player,cooldown);
                }
            }
            }else{ 
            player.removeTag("wborder:out");
            }
        }
        let count;
        if(size!=-2&&size!=-1){
            if(timer<1){
                if(maxhigh==0){
                    for(let j=adjust.dimension.heightRange.min/scale;j<adjust.dimension.heightRange.max/scale;j++){
                        for(let i=(0-size);i<size;i=i+size/10*interval){
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz-size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz-size});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz+size});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx-size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx-size,y:j*scale,z:borderz+i});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+i});
                            }    
                        }
                        count = 0;
                        for(const player of mc.world.getPlayers()){
                            const { x: playerx, y: playery, z: playerz } = player.location;
                            if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                count++;
                            }
                        }
                        if(count>0){
                            mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+size});
                        }
                    }   
                }else if(maxhigh>0){
                    for(let j= bordery/scale;j<(bordery+maxhigh)/scale;j++){
                        for(let i=(0-size);i<size;i=i+size/10*interval){
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz-size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz-size}||cansee<0);
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz+size});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx-size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx-size,y:j*scale,z:borderz+i});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+i});
                            }    
                        }
                        count = 0;
                        for(const player of mc.world.getPlayers()){
                            const { x: playerx, y: playery, z: playerz } = player.location;
                            if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                count++;
                            }
                        }
                        if(count>0){
                            mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+size});
                        }
                    }
                }else{
                    for(let j= bordery/scale;j>(bordery-maxhigh)/scale;j--){
                        for(let i=(0-size);i<size;i=i+size/10*interval){
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz-size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz-size}||cansee<0);
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+i))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+i,y:j*scale,z:borderz+size});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx-size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx-size,y:j*scale,z:borderz+i});
                            }
                            count = 0;
                            for(const player of mc.world.getPlayers()){
                                const { x: playerx, y: playery, z: playerz } = player.location;
                                if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+i))**2)<cansee||cansee<0){
                                    count++;
                                }
                            }
                            if(count>0){
                                mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+i});
                            }    
                        }
                        count = 0;
                        for(const player of mc.world.getPlayers()){
                            const { x: playerx, y: playery, z: playerz } = player.location;
                            if(Math.sqrt(Math.abs(playerx-(borderx+size))**2+Math.abs(playery-(j*scale))**2+Math.abs(playerz-(borderz+size))**2)<cansee||cansee<0){
                                count++;
                            }
                        }
                        if(count>0){
                            mc.world.getDimension('overworld').spawnParticle(particlename,{x:borderx+size,y:j*scale,z:borderz+size});
                        }
                    }
                }
                timer = 11;
            }
        }
        timer--;
        let debug = mc.world.scoreboard.getObjective("border/debug");
        debug.setScore("borderx",borderx);
        debug.setScore("bordery",bordery);
        debug.setScore("borderz",borderz);
        debug.setScore("size",size);
        debug.setScore("damage",damage);
        debug.setScore("cooldown",cooldown);
        debug.setScore("particlereltime",timer);
        debug.setScore("scale",scale);
        debug.setScore("maxhigh",maxhigh);
        debug.setScore("interval",interval);
        debug.setScore("seein",cansee);
    }
    });
}, 1);
