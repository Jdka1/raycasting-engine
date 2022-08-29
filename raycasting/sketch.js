let walls = [];
let rays = [];

let heading = 0;

const quality = 0.2;
const fov = 60;

const sceneW = fov*23

const speed = 1.5;
const rotateSpeed = 0.05;

let vertCamAngle = 0;

let sensitivitySlider;

let checkbox2d;

let show2d = false;


// add crosshair
// fix distortion
// change to classes
// draw maze
// auto generate maze
// add circle line collision

function setup() {
  noCursor();
  createCanvas(600+sceneW, 700);

  let sensitivitySliderCaption = createElement('p', 'Sensitivity');
  sensitivitySliderCaption.style('margin-bottom', '0');
  sensitivitySlider = createSlider(0.1,2,0.8,0.05);
  checkbox = createCheckbox('Hide 2d layout', true);
  checkbox.changed(() => {
    show2d = !show2d;
  });


  walls.push(new Wall(0,0,width-sceneW,0));
  walls.push(new Wall(width-sceneW,0,width-sceneW,height));
  walls.push(new Wall(0,height,width-sceneW,height));
  walls.push(new Wall(0,0,0,height));


  for (let i=0; i<5; i++) {
    walls.push(new Wall(random(width-sceneW),random(height),random(width-sceneW),random(height)));
  }

  for (let i=0; i<fov; i+=quality) {
    rays.push(new Ray (100,200,p5.Vector.fromAngle(radians(i))));
  }
}

function draw() {
  background(0);
  if (show2d) {
    print('hi');
    resizeCanvas(600+sceneW, 700);
  } else {
    resizeCanvas(windowWidth, windowHeight-80);
  }


  if (show2d) {
    background(0);
    walls.forEach((wall) => {
      wall.show();
    })

    rays.forEach((ray) => {
      ray.show();
      // ray.pos = createVector(mouseX,mouseY);
    })
  }


  setRotateView(radians(mouseX+width-sceneW));

  if (keyIsDown(87)) {
    let v = p5.Vector.fromAngle(heading+radians(fov/2))
    v.mult(speed);
    move(v);
  }
  if (keyIsDown(83)) {
    let v = p5.Vector.fromAngle(heading+radians(fov/2))
    v.mult(-1);
    v.mult(speed);
    move(v);
  }
  if (keyIsDown(68)) {
    let v = p5.Vector.fromAngle(heading+radians(fov/2)+radians(90))
    v.mult(speed);
    move(v);
  }
  if (keyIsDown(65)) {
    let v = p5.Vector.fromAngle(heading+radians(fov/2)+radians(-90))
    v.mult(speed);
    move(v);
  }

  

  
  if (show2d) {
    fill('blue');
    rect(width-sceneW,height/2,sceneW,height/2);
    fill('black');
    rect(width-sceneW,0,sceneW,height/2);
  } else {
    fill('blue');
    rect(0,height/2,width,height/2);
    fill('black');
    rect(0,0,width,height/2);
  }

  drawScene(castRays());


}


function setGradient(x, y, w, h, c1, c2) {
  noFill();

  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}


function setRotateView(angle) {
  heading = angle*sensitivitySlider.value();
  for (let i=0; i<rays.length; i++) {
    rays[i].setDir(radians(i*quality) + heading);
  }
}


function move(dir) {
  rays.forEach((ray) => {
    ray.pos.add(dir);
  });
}



function drawScene(dists) {
  push();
  if (show2d) {
    translate(width-sceneW,0)
    stroke('red');
    strokeWeight(1);
    rect(-4,0,1,height);
  }


  rectMode(CENTER);


  let w;
  if (show2d) w = sceneW/dists.length;
  else w = width/dists.length;
  
  noStroke();
  let headingV = p5.Vector.fromAngle(heading);

  for (let i=0; i<dists.length; i++) {
    const sq = dists[i].dist*dists[i].dist;
    const wSq = (width-sceneW)*(width-sceneW);
    // const s = map(sq,0,wSq,255,0);

    const s = map(dists[i].dist,0,700,255,0);

    let h = 100000/dists[i].cosdist;
    fill(s);
    rect(i*w,height/2,w+0.5,h);
  }


  rectMode(CORNER);
  pop();
}



function castRays() {
  let dists = [];

  for (let i=0; i<rays.length; i++) {
    let closest = createVector();
    let record = {dist: Infinity, cosdist: Infinity};

    for (let j=0; j<walls.length; j++) {
      let pt = rays[i].cast(walls[j]);
      if (pt) {
        let d = p5.Vector.dist(pt,rays[i].pos)
        let a = rays[i].dir.heading() - heading;
        if (d < record.dist) {
          record.dist = d;
          d *= cos(a);
          record.cosdist = d;
          closest = pt;
        }
      }

    }

    strokeWeight(5);
    stroke(255,10);

    if (!(closest.x == 0 && closest.y == 0)) {
      if (show2d) line(rays[i].pos.x,rays[i].pos.y, closest.x,closest.y);
    }

    dists.push(record);
  }


  return dists;
}