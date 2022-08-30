let walls = [];
let rays = [];

let heading = 0;

const quality = 0.2;
const fov = 60;

let sceneW = fov*23

const wallDimensions = {w: 1000, h: 1000};

const speed = 1.5;
const rotateSpeed = 0.05;

let vertCamAngle = 0;

let sensitivitySlider;

let checkbox2d;

let show2d = false;


// add panning on y axis
// change to classes
// draw maze
// auto generate maze
// add circle line collision

function setup() {
  noCursor();
  createCanvas(windowWidth, windowHeight-80);

  let sensitivitySliderCaption = createElement('p', 'Sensitivity');
  sensitivitySliderCaption.style('margin-bottom', '0');
  sensitivitySlider = createSlider(0.1,2,0.65,0.05);
  checkbox = createCheckbox('Hide 2d layout', true);
  checkbox.changed(() => {
    show2d = !show2d;
    if (show2d) {
      resizeCanvas(windowWidth, wallDimensions.h);
    } else {
      resizeCanvas(windowWidth, windowHeight-80);
    }
  });


  walls.push(new Wall(0,0,wallDimensions.w,0));
  walls.push(new Wall(wallDimensions.w,0,wallDimensions.w,wallDimensions.h));
  walls.push(new Wall(0,wallDimensions.h,wallDimensions.w,wallDimensions.h));
  walls.push(new Wall(0,0,0,wallDimensions.h));


  for (let i=0; i<5; i++) {
    walls.push(new Wall(random(wallDimensions.w),random(wallDimensions.h),random(wallDimensions.w),random(wallDimensions.h)));
  }

  for (let i=0; i<fov; i+=quality) {
    rays.push(new Ray (100,200,p5.Vector.fromAngle(radians(i))));
  }
}

function draw() {
  background(0);


  if (show2d) {
    background(0);
    walls.forEach((wall) => {
      wall.show();
    })

    rays.forEach((ray) => {
      ray.show();
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
    rect(wallDimensions.w,height/2,width-wallDimensions.w,height/2);
    fill('black');
    rect(wallDimensions.w,0,width-wallDimensions.w,height/2);
  } else {
    fill('blue');
    rect(0,height/2,width,height/2);
    fill('black');
    rect(0,0,width,height/2);
  }

  drawScene(castRays());

  if (show2d) {
    fill('blue');
    rect(wallDimensions.w,height/2,width-wallDimensions.w,height/2);
    fill('black');
    rect(wallDimensions.w,0,width-wallDimensions.w,height/2);
  } else {
    stroke('red');
    strokeWeight(6.5);
    point(width/2,height/1.8);
  }
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
    translate(wallDimensions.w,0);
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
          d *= sqrt(cos(a));
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
