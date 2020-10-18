class Vector{
    constructor(x,y){
      this.x = x;
      this.y = y;
    } //:v 
    clone() {
          return new this.constructor(this.x, this.y);
      }
      add(v) {
          this.x += v.x;
          this.y += v.y;
          return this;
      }
      sub(v) {
          this.x = this.x - v.x;
          this.y = this.y - v.y;
          return this;
      }
      mul(x) {
          this.x *= x;
          this.y *= x;
          return this;
      }
      div(x) {
          this.x /= x;
          this.y /= x;
          return this;
      }
      get mag() {//magnitud
          return Math.sqrt(this.x * this.x + this.y * this.y);
      } 
      norm() {//normal
          var mag = this.mag;
          if (mag > 0) {
              this.div(mag);
          }
          return this;
      }
}

class Charge{
  constructor(vector, carga){
    this.vPos = vector;
    this.carga = carga;
    this.radius = 5;
  }

  dibujar (contexto){
    contexto.beginPath();
    contexto.arc(this.vPos.x*step, this.vPos.y*step*-1,5,0,Math.PI*2);
    contexto.fillStyle = (this.carga>0)?'blue':(this.carga<0)?'red':'grey';
    contexto.fill();
  }
}

function getEforce(distancia,carga){
  if(distancia==0){console.log("division entre 0"); return 0;}
    let f = k*carga/Math.pow(distancia,2);
    return f;
}

function getVForce(x,y){
  let temp_v = new Vector(x,y);
  let sumx = 0;
  let sumy = 0;
  for(let c of arrCargas){
    let vd =temp_v.clone().sub(c.vPos) 
    let F = getEforce(vd.mag,c.carga);
    sumx+=F*vd.clone().norm().x;
    sumy+=F*vd.clone().norm().y;
  }
  return new Vector(sumx,sumy);
}

function addCarga(x,y,q){
  arrCargas.push(new Charge(new Vector(x,y),q));
  arrCargas[arrCargas.length-1].dibujar(ctx);
}



function drawArrowhead(context, from, to, radius) {
	var x_center = to.x;
	var y_center = to.y;

	var angle;
	var x;
	var y;

	context.beginPath();
  context.fillStyle = "black";
	angle = Math.atan2(to.y - from.y, to.x - from.x)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;

	context.moveTo(x, y);

	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;

	context.lineTo(x, y);

	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius *Math.cos(angle) + x_center;
	y = radius *Math.sin(angle) + y_center;

	context.lineTo(x, y);
	context.closePath();
	context.fill();
}

function drawVectors(){
  const width = 2;
  const line_color = '#101010';
  for(let v of vectores){
    let temp_v = getVForce(v.x,v.y).norm().div(2);
    ctx.beginPath();
    ctx.moveTo(v.x*step,v.y*step*-1);
    ctx.lineTo((v.x-temp_v.x)*step,(v.y-temp_v.y)*step*-1)
    ctx.strokeStyle = line_color;
    ctx.stroke();
    ctx.closePath();
    drawArrowhead(ctx, {x: (v.x-temp_v.x)*step ,y: (v.y-temp_v.y)*step*-1} , {x: v.x*step ,y: v.y*step*-1},3)
  }
}

function setVectors(){
  const x_step = cvs.width/step;
  const y_step = cvs.height/step;
  for(let x = x0*-1;x<=x0;x+=step){
    for(let y = y0*-1;y<=y0;y+=step){
      vectores.push(new Vector(x/step,y/step));
    }  
  }
}

function drawPlane(){
  ctx.beginPath();
  ctx.fillStyle = "White";
  ctx.fillRect(-x0,-y0,2*x0,2*y0);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#CBCBCB';
  for(let i=0;i<=y0;i+=step){
    for(let j=0;j<=x0;j+=step){
      ctx.moveTo(j,-y0);
      ctx.lineTo(j,y0);
      ctx.moveTo(-j,-y0);
      ctx.lineTo(-j,y0);
      ctx.moveTo(-x0,i);
      ctx.lineTo(x0,i);
      ctx.moveTo(-x0,-i);
      ctx.lineTo(x0,-i);
    }
  }
  ctx.stroke();
  ctx.closePath();
//console.log("dibujando");
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.moveTo(-x0,0);
  ctx.lineTo(x0,0);
  ctx.stroke();
  ctx.moveTo(0,-y0);
  ctx.lineTo(0,y0);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
}

function resetCanvas(){
  ctx.clearRect(x0*-1,y0*-1,cvs.width,cvs.height);
  drawPlane();
  drawVectors();
  for(let carga of arrCargas){
    carga.dibujar(ctx);
  }
}

function cvsHandleClick (e) {
  requestAnimationFrame(()=>resetCanvas());
  jsinputsContainter.style.top = `${e.clientY - 8}px`
  jsinputsContainter.style.left = `${e.clientX + 9}px`
  jsinputsText.value = `${arrCargas[arrCargas.length - 1].carga} C`;
  jsinputsContainter.style.display = "block";
  cvs.removeEventListener('click',cvsHandleClick);
  cvs.removeEventListener('mousemove',cvsHandleMouseMove);
}

function cvsHandleMouseMove({layerX:x , layerY:y}){
  arrCargas[arrCargas.length-1].vPos.x = (x-x0)/step;
  arrCargas[arrCargas.length-1].vPos.y = (y0-y)/step;
  requestAnimationFrame(()=>resetCanvas());
  x-=x0;
  y-=y0;
  resetCanvas();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.arc(x,y,5,0,Math.PI*2);
  ctx.fill();
}

/*async*/ function tstrHandleMouseMove({layerX:x , layerY:y}){
  x-=x0;
  y-=y0;
  //await requestAnimationFrame(()=>resetCanvas());
  resetCanvas();
  ctx.beginPath();
  ctx.arc(x,y,10,0,Math.PI*2);
  ctx.strokeStyle="#DD0000";
  ctx.stroke();
  ctx.strokeStyle="black";
  ctx.moveTo(x-12,y);
  ctx.lineTo(x-4,y);
  ctx.moveTo(x+12,y);
  ctx.lineTo(x+4,y);
  ctx.moveTo(x,y-12);
  ctx.lineTo(x,y-4);
  ctx.moveTo(x,y+12);
  ctx.lineTo(x,y+4);
  ctx.stroke();
  ctx.closePath();
}

function tstrHandleMouseClick({layerX:x , layerY:y}){
  x-=x0;
  y-=y0;
  resetCanvas();
  ctx.beginPath();
  ctx.arc(x,y,3,0,Math.PI*2);
  ctx.strokeStyle='black'
  ctx.stroke();
  ctx.arc(x,y,2,0,Math.PI*2);
  ctx.fillStyle="#DDEE00";
  ctx.fill();
  ctx.fillStyle="black";
  ctx.font = "bold 12px arial";
  ctx.fillText("Tester",x+5,y+10);
  cvs.removeEventListener('mousemove',tstrHandleMouseMove);
  cvs.removeEventListener('click',tstrHandleMouseClick);
  cvs.style.cursor='crosshair';

  txtIntE.value = getVForce(x,y).mag;
  txtPotE.value = "En proceso"//getVForce(x,y).mag*new Vector
  testerPnl.style.display = 'flex';
}

    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext('2d');
    const contenedor = document.getElementById('simulacion');
    contenedor.appendChild(cvs);
    //cvs.width = cvs.height = 500;
    cvs.width = contenedor.clientWidth;
    cvs.height = contenedor.clientHeight;

    //update charges inputs
    const jsinputsContainter = document.getElementById("data");
    const jsinputsText = document.getElementById("jsinputText");
    const jsinputsbtn = document.getElementById("jsinputButton");
    jsinputsbtn.addEventListener('click',ev=>{
      let tC = arrCargas[arrCargas.length -1 ];
      //console.log(tC);
      tC.carga= parseFloat(jsinputsText.value.split(" ")[0]);  
      jsinputsContainter.style.display = "none";
      //console.log(`Q${arrCargas.length} added: Q(${tC.vPos.x};${tC.vPos.y})=${tC.carga} C`);
      resetCanvas();
    })

    //add charges
    const btnAgregar = document.getElementById('addCarga');
    btnAgregar.addEventListener('click',(ev)=>{
      addCarga(0,0,1);
      cvs.addEventListener('mousemove',cvsHandleMouseMove);
      cvs.addEventListener('click',cvsHandleClick)
    })
    //put Tester
    const btnTester = document.getElementById("putTester");
    btnTester.addEventListener('click', (ev)=>{
      cvs.style.cursor='none';
      cvs.addEventListener('mousemove', tstrHandleMouseMove);
      cvs.addEventListener('click',tstrHandleMouseClick);
      testerPnl.style.display="none";
    })

    //tester HUD
    const testerPnl = document.getElementById('testerPanel');
    const txtIntE = document.getElementById('intentsidadE');
    const txtPotE = document.getElementById('potencialE');
    //para hallar los equipotenciales
    // function equipotential(voltage){
    //   let testvalues = [];
    //   let arrpoints = []
    //   for(i = -x0; i<=x0;i++){
    //     let arrrow = []
    //     for(j=-y0;j<=y0;j++){
    //       arrrow.push({px:(i/step),py:(j/step)});
          
    //       volt = getVForce(i/step,-j/step).mag
    //       //console.log(volt);
    //       if(Math.round(volt) == Math.round(voltage)){
    //         testvalues.push({px:i,py:j});
    //       }
    //     }
    //     arrpoints.push(arrrow);
        
    //   }
    //   console.log(arrpoints);
    //   tester = testvalues;
    //   console.log(testvalues);
    //   console.log(testvalues.length)
    //   ctx.beginPath();
    //       ctx.moveTo(testvalues[0].px,testvalues[0].py)
    //       for (const p of testvalues) {
    //         ctx.lineTo(p.px,p.py);
    //       }
    //       ctx.stroke();
    // }

    const k = 8.9875517873681764*Math.pow(10,9)

    var arrCargas = [];
    var vectores = [];

    const x0 = cvs.width/2;
    const y0 = cvs.height/2;
    ctx.translate(x0,y0);

    var step = 20;

    function debuggVoltage(){
      cvs.addEventListener('mousemove', (ev)=>{
        if(ev.target = cvs){
          let y = y0-ev.layerY;
          let px = ev.layerX-x0 ;
        
          console.clear();
          console.log(`(${px/step};${y/step})`)
          console.log(getVForce(px/step,y/step).mag);
          }
        })
      cvs.addEventListener('click',(ev)=>{
        if(ev.target = cvs){
          let y = y0-ev.layerY;
          let px = ev.layerX-x0 ;          
          equipotential(getVForce(px,y).mag);
          }
        })
    }


    setVectors();

    drawPlane();
    