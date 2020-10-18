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
      static add(vector1, vector2){
        return new Vector(vector1.x+vector2.x,vector1.y+vector2.y)
      }
      static sub(vector1,vector2){
        return new Vector(vector1.x-vector2.x,vector1.y-vector2.y)
      }
      static mult(vector, scalar){
        return new Vector(vector.x*scalar,vector.y*scalar)
      }
      static div(vector, scalar){
        return new Vector(vector.x/scalar,vector.y/scalar)
      }
      dot(vector){
        return this.x * vector.x + this.y * vector.y;
      }
      getTangent(){
        return new Vector(-this.y, this.x);
      }
}

class Casilla{

}

class Carga{
    constructor(x,y,q, canMove){
        this.position = new Vector(x,y);
        this.velocity = new Vector(0,0);
        this.aceleration = new Vector(0,0);
        this.carga = q;
        this.movable = canMove;
        this.radius = (this.carga>0)?10:5;
    }

    applyForce(force){
        this.aceleration.add(force);
    }

    update(){
        if(this.movable==true){
            this.position.add(this.velocity);
            this.velocity.add(this.aceleration);
            this.aceleration.mul(0);
        }
    }

    checkCollision(particle){
        const v = Vector.sub(this.position,particle.position);
        const dist = v.mag;
        //console.log(dist)
        if(dist<=this.radius + particle.radius){
          console.log("colision");
          const unitNormal = Vector.div(v,v.mag);
          const unitTangent = unitNormal.getTangent();
          
          const correction = Vector.mult(unitNormal,this.radius+particle.radius);
          const newV = Vector.add(particle.position, correction);
          this.pos = newV;
    
          const a = this.velocity;
          const b = particle.velocity;
          const a_n = a.dot(unitNormal);
          const b_n = b.dot(unitNormal);
          const a_t = a.dot(unitTangent);
          const b_t = b.dot(unitTangent);
    
          const a_n_final = (a_n*(this.radius-particle.radius) + 2 * particle.radius*b_n)/(this.radius+particle.radius);
          const b_n_final = (b_n*(this.radius-particle.radius) + 2 * particle.radius*a_n)/(this.radius+particle.radius);
    
          const a_n_after = Vector.mult(unitNormal, a_n_final);
          const b_n_after = Vector.mult(unitNormal, b_n_final);
          const a_t_after = Vector.mult(unitTangent, a_t);
          const b_t_after = Vector.mult(unitTangent, b_t);
          const a_after = Vector.add(a_n_after,a_t_after);
          const b_after = Vector.add(b_n_after,b_t_after);
    
          this.velocity = a_after;
          particle.velocity = b_after;
        }
      }

    dibujar(){
        ctx.beginPath();
        ctx.fillStyle = (this.carga>0)?'red':'blue';
        ctx.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
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

const E = new Vector(1e15,0);

const cargas = [];
const electrones = [];

function createElectron(x,y){
    cargas.push(new Carga(x,y,qe,true));
}
function createProton(x,y){
    cargas.push(new Carga(x,y,-qe,false));
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

function applyColision(ct){
    for(particle of cargas){
        if(ct!=particle){
            ct.checkCollision(particle);
        }
    }
}

function update(){
    ctx.clearRect(0,0,cvs.width,cvs.height);
    drawPlane();
    for(c of cargas){
        if(c.position.x<=x0 && c.position.x>=-x0 
            && c.position.y <=y0 && c.position.y>=-y0){
            c.dibujar();
            c.applyForce(E.clone().mul(c.carga));
            //c.applyForce(getEFieldnX(c));
            //c.applyForce(getTotalElectricForce(c));
            c.aceleration.mul(1);
            applyColision(c);
            c.update();
        }
        else{cargas.splice(cargas.indexOf(c),1)}
    }
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

function start(){
    createProton(0,0);
    for(let i = 200; i >= 50; i-=50){
        createProton(i,0);
        createProton(-i,0);
        createProton(0,i);
        createProton(0,-i);
    }
    for(let i = 200;i>=50;i-=50){
        for(let j = 200; j>=50; j-=50){
            createProton(i,j);    
            createProton(-i,-j);
            createProton(-i,j);
            createProton(i,-j);
        }
    }
}

start();