 const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const arena = createMatrix(12, 20); 
let dropCounter = 0;
let dropInterval = 1000; 
let lastTime = 0;

const player = {
  pos: { x: 5, y: 0 },
  matrix: createPiece('T'),
};

const colors = {
    1: 'purple',  
    2: 'yellow',  
    3: 'orange',  
    4: 'cyan',    
    5: 'red',    
  };
  


function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}


function createPiece(type) {
    switch (type) {
      case 'T': return [[0, 1, 0], [1, 1, 1], [0, 0, 0]]; 
      case 'O': return [[2, 2], [2, 2]];                 
      case 'L': return [[0, 0, 3], [3, 3, 3], [0, 0, 0]]; 
      case 'I': return [[0, 4, 0, 0], [0, 4, 0, 0], [0, 4, 0, 0], [0, 4, 0, 0]]; 
      case 'Z': return [[5, 5, 0], [0, 5, 5], [0, 0, 0]]; 
      default: return [[0]];
    }
  }
  


function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}


function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value]; 
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
  


  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player); 
      arenaSweep(); 
      playerReset(); 
    }
    dropCounter = 0;
  }
  


function playerReset() {
    const pieces = 'TOLIZ'; 
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    player.matrix = createPiece(randomPiece);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  
    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0)); 
      alert('Game Over!'); 
    }
  }


  function arenaSweep() {
    let rowCount = 1; 
    for (let y = arena.length - 1; y >= 0; --y) {
      if (arena[y].every(value => value !== 0)) {
        arena.splice(y, 1); 
        arena.unshift(new Array(arena[0].length).fill(0)); 
        y++; 
      }
    }
  }
  

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();

  draw();
  requestAnimationFrame(update);
}


function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}


function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}


function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, true);
      player.pos.x = pos;
      return;
    }
  }
}


function rotate(matrix, reverse = false) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  reverse ? matrix.forEach(row => row.reverse()) : matrix.reverse();
}


document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'ArrowUp') playerRotate();
});

update();
