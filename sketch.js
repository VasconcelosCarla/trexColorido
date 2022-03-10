//Variável de estado de jogo
var JOGAR = 1;
var ENCERRAR = 0;
var estadoJogo = JOGAR;

//Variaveis do jogo
var trex, trex_correndo, trex_colidiu;
var solo, soloInvisivel, imagemDoSolo;

var grupoDeNuvens, imagemDaNuvem;
var grupoObstaculos, obstaculo1, obstaculo2, obstaculo3, obstaculo4;
var imagemDeFundo;
var pontuacao=0;
var somDePulo, somDeColisao;

//Variável de iniciar e reiniciar jogo
var fimDeJogo, reiniciar;

//Função para carregar as imagens 
function preload(){
  somDePulo = loadSound("assets/sounds/jump.wav")
  somDeColisao = loadSound("assets/sounds/collided.wav")
  
  imagemDeFundo = loadImage("assets/backgroundImg.png")
  animacaoDeSol = loadImage("assets/sun.png");
  
  trex_correndo = loadAnimation("assets/trex_2.png","assets/trex_1.png","assets/trex_3.png");
  trex_colidiu = loadAnimation("assets/trex_collided.png");
  
  imagemDoSolo = loadImage("assets/ground.png");
  
  imagemDaNuvem = loadImage("assets/cloud.png");
  
  obstaculo1 = loadImage("assets/obstacle1.png");
  obstaculo2 = loadImage("assets/obstacle2.png");
  obstaculo3 = loadImage("assets/obstacle3.png");
  obstaculo4 = loadImage("assets/obstacle4.png");
  
  imgFimDeJogo = loadImage("assets/gameOver.png");
  imgReiniciar = loadImage("assets/restart.png");
}

function setup() {
  //tamanho da tela é a largura e a altura da janela de reprodução deixando ele responsivo, tive que criar 3 fundos como uma solução mais fácil no momento, já que o desenho do background é muuuuiiiiito pequendo na direção x.
  createCanvas(windowWidth, windowHeight);
  //sprite do fundo dividido em 3 etapas
  for (var i = 40; i < windowWidth; i=i+windowWidth/4) 
{
  var Fundo = createSprite(i, windowHeight/2, windowWidth, windowHeight);
  Fundo.addImage(imagemDeFundo);
}
  
    
  // sprite do sol
  sol = createSprite(width-50,100,10,10);
  sol.addAnimation("sun", animacaoDeSol);
  sol.scale = 0.1
  
  //criação do trex
  trex = createSprite(50,height-70,20,50); 
  trex.addAnimation("running", trex_correndo);
  trex.addAnimation("collided", trex_colidiu);
  trex.setCollider('circle',0,0,350)
  trex.scale = 0.08
  // trex.debug=true
  
  // criação do solo invisível
  soloInvisivel = createSprite(width/2,height-10,width,125);  
  soloInvisivel.shapeColor = "#f4cbaa";
  soloInvisivel.visible =false;
  
  //criação do solo
  solo = createSprite(width/2,height,width,2);
  solo.addImage("ground",imagemDoSolo);
  solo.x = width/2
  solo.velocityX = -(6 + 3*pontuacao/100);
   
  
  //criação de grupos de obstáculos
  grupoDeNuvens = new Group();
  grupoObstaculos = new Group();
  
  pontuacao = 0;
  
  //criar icones de fim de jogo e reiniciar
  fimDeJogo = createSprite(width/2,height/2- 50);
  fimDeJogo.addImage(imgFimDeJogo);
  fimDeJogo.scale = 0.5;
  fimDeJogo.visible = false;
  
  reiniciar = createSprite(width/2,height/2);
  reiniciar.addImage(imgReiniciar);
  reiniciar.scale = 0.1;
  reiniciar.visible = false;
}

function draw() {
  
  background(255);
  
  //text("Pontuação: "+ pontuacao,30,50);
  //como o fundo tem imagem, coloquei o texto do placar abaixo do drawSprites, assim ele é printado na tela após o desenho dos sprites. 
  
  //modificação do estado de jogo
  if (estadoJogo === JOGAR){
    
    //atribuição da velocidade
    solo.velocityX = -(6 + 3*pontuacao/100);
    
    //atualização do placar
    pontuacao = pontuacao + Math.round(getFrameRate()/60);
    
    //saltar quando a tecla espaço for pressionada
    if((touches.length > 0 || keyDown("SPACE")) && trex.y  >= height-110) {
      somDePulo.play( );
      trex.velocityY = -12;
       touches = [];
    }
    
    //Implementação da gravidade
    trex.velocityY = trex.velocityY + 0.8
  
    if (solo.x < 0){
      solo.x = solo.width/2;
    }
    //colisão com o solo invisível
    trex.collide(soloInvisivel);
    //função gerar nuvens sendo chamada no draw
    gerarNuvens();
    //função gerar obstáculo sendo chamada no draw
    gerarObstaculos();
  
    if(grupoObstaculos.isTouching(trex)){
        somDeColisao.play()
        estadoJogo = ENCERRAR;
    }
  }
  //quando o estádo de jogo for encerrar, fazer:
  else if (estadoJogo === ENCERRAR) {
        
    //define velocidade de cada objeto do jogo como 0
      solo.velocityX = 0;
      trex.velocityY = 0
      grupoObstaculos.setVelocityXEach(0);
      grupoDeNuvens.setVelocityXEach(0);
    
    //altera a animação do Trex
      trex.changeAnimation("collided", trex_colidiu);
    
    //icones de fim de jogo e reiniciar se tornam visíveis
      fimDeJogo.visible = true;
      reiniciar.visible = true;
    
    //define o tempo de vida dos objetos do jogo para que nunca sejam destruídos
    //Obstaculos e nuvens se mantem visiveis
     grupoObstaculos.setLifetimeEach(-1);
     grupoDeNuvens.setLifetimeEach(-1);  
    
    
    // Reiniciar ao clicar no ícone reiniciar
    if(mousePressedOver(reiniciar)){
      
      //Registrar informação no console
      console.log("Reiniciar o jogo");
      
      //Reiniciar o jogo
      reset();
      
    }
      
    
    /*if(touches.length>0 || keyDown("SPACE")) {      
      reset();
      touches = [];
    }*/
  }
  
  
  drawSprites();
  textSize(20);
  fill("black")
  text("Pontuação: "+ pontuacao,30,50);
}

function gerarNuvens() {
  //escreva o código aqui para gerar as nuvens
  if (frameCount % 60 === 0) {
    var nuvem = createSprite(width+20,height-300,40,10);
    nuvem.y = Math.round(random(100,220));
    nuvem.addImage(imagemDaNuvem);
    nuvem.scale = 0.5;
    nuvem.velocityX = -3;
    
     //atribuir tempo de duração à variável
    nuvem.lifetime = 300;
    
    //ajustando a profundidade
    nuvem.depth = trex.depth;
    trex.depth = trex.depth+1;
    
    //adicionando nuvem ao grupo
   grupoDeNuvens.add(nuvem);
  }
  
}

function gerarObstaculos(){
 if (frameCount % 60 === 0){
   var obstaculo = createSprite(600,height-95,20,30);
    obstaculo.setCollider('circle',0,0,45)
    // obstaculo.debug = true
  
    obstaculo.velocityX = -(6 + 3*pontuacao/100);
    
    //gerar obstáculos aleatórios
    var rand = Math.round(random(1,2));
    switch(rand) {
      case 1: obstaculo.addImage(obstaculo1);
              break;
      case 2: obstaculo.addImage(obstaculo2);
              break;
      default: break;
    }
    
    //atribuir escala e tempo de duração ao obstáculo         
    obstaculo.scale = 0.3;
    obstaculo.lifetime = 300;
    obstaculo.depth = trex.depth;
    trex.depth +=1;
    //adicionar cada obstáculo ao grupo
    grupoObstaculos.add(obstaculo);
 }
}

function reset(){
  estadoJogo = JOGAR;
  fimDeJogo.visible = false;
  reiniciar.visible = false;
  
  grupoObstaculos.destroyEach(-1);
  grupoDeNuvens.destroyEach(-1);
  
  trex.changeAnimation("running",trex_correndo);
  
  pontuacao = 0;

}
