class Vector{
    /**
     * @param x : int
     * @param y : int
     */
    constructor(x,y){
      this.x = x;
      this.y = y;
    } //:v 
    clone() {
          return new this.constructor(this.x, this.y);
      }
    /**
     * @param v : Vector
     */
      add(v) {
          this.x += v.x;
          this.y += v.y;
          return this;
      }
    /**
     * @param v : Vector
     */
      sub(v) {
          this.x = this.x - v.x;
          this.y = this.y - v.y;
          return this;
      }
    /**
     * @param x : double
     */
      mul(x) {
          this.x *= x;
          this.y *= x;
          return this;
      }
    /**
     * @param x : double
     */  
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

class Casilla{

}

class Carga{
    constructor(x,y,q){
        this.position = new Vector(x,y);
        this.velocity = new Vector(0,0);
        this.aceleration = new Vector(0,0);
        this.carga = q;
    }

    applyForce(force){
        this.aceleration.add(force);
    }

    update(){
        this.position.add(this.velocity);
        this.velocity.add(this.aceleration);
        this.aceleration.mul(0);
    }

    dibujar(){
        ctx.beginPath();
        ctx.fillStyle = (this.carga>0)?'red':'blue';
        ctx.arc(this.position.x,this.position.y,5,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}

const cvs = document.createElement("canvas");
const ctx = cvs.getContext('2d');

const simContainer = document.getElementById("simulacion");
simContainer.appendChild(cvs);

cvs.width = cvs.height = 500;

const x0 = cvs.width/2;
const y0 = cvs.height/2;
ctx.translate(x0,y0);

function drawPlane(){
    ctx.fillStyle = "#393949"
    ctx.fillRect(-x0,-y0,2*x0,2*y0);

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#AFAFAF"
    for(let y = -y0; y<=y0; y+=30){
        ctx.moveTo(0,y);
        ctx.lineTo(0,y+23);
    }
    ctx.stroke();
    ctx.closePath();
}

const qe = -1*1.6 * Math.pow(10,-19);
const k = 8.9875517873681764*Math.pow(10,9);

const E = new Vector(1e16,0);

const cargas = [];

function createElectron(x,y){
    cargas.push(new Carga(x,y,qe));
}
function createProton(x,y){
    cargas.push(new Carga(x,y,-qe));
}

function getEFieldnX(t_carga){
    let v_temp = new Vector(0,0);
    for(let c of cargas){
        let distancia = t_carga.position.clone().sub(c.position);
        if(c!=t_carga){
            let tE = distancia.clone().norm().mul(k*c.carga/Math.pow(distancia.mag,2))
            v_temp.add(tE);
        }
    }
    return v_temp;
}

function getTotalElectricForce(q1){
    let toltalEF = new Vector(0,0);
    for(let c of cargas){
        if(c!=q1){
            let distancia = q1.position.clone().sub(c.position);
            if(distancia.mag != 0){
                let f = distancia.clone().norm().mul(k*q1.carga*c.carga/Math.pow(distancia.mag,2));
                toltalEF.add(f);
            }
        }
    }
    //console.log(toltalEF);
    return toltalEF;
}

function update(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    drawPlane();
    for(c of cargas){
        if(c.position.x<=x0 && c.position.x>=-x0 
            && c.position.y <=y0 && c.position.y>=-y0){
            c.dibujar();
            //c.applyForce(E.clone().mul(c.carga));
            c.applyForce(getEFieldnX(c));
            c.applyForce(getTotalElectricForce(c));
            c.aceleration.mul(1e10);
            c.update();
        }
        else{cargas.splice(cargas.indexOf(c),1)}
    }
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function start(){
    for(let i = 250;i>=50;i-=50){
        createProton(50,-i);
        createProton(50, i);
        createElectron(-50,-i);
        createElectron(-50, i);
        createProton(-100,-i);
        createProton(-100, i);
        createElectron(100,-i);
        createElectron(100, i);
    }
}