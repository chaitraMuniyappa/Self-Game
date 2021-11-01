class Block {
  constructor(x, y, img) {
    var options = {
      'restitution': 0.2,
      'friction': 0.2
    }
    this.body = Bodies.rectangle(x, y, 40, 40, options);
    this.width = 40;
    this.height = 40;
    this.visibility = 255;
    World.add(world, this.body);
    this.image = img;
  }
  display(){
    if(this.body.speed < 3){
        var angle = this.body.angle;
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.image, 0, 0, this.width, this.height);
        pop();
     }
     else{
       World.remove(world, this.body);
       push();
       this.visibility = this.visibility - 5;
       tint(255,this.visibility);
       image(this.image, this.body.position.x, this.body.position.y, 50, 50);
       pop();
     }
  }
  score() {
    if (this.visibility > -10 && this.visibility < 10) {
      score++;
    }
  }
}