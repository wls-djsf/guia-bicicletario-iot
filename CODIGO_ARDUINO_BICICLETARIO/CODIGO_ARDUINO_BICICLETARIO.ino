//Bibliotecas
//Bibliotecas encontradas no livro Automação e Instrumentação Industrial com Arduino Teoria e Projetos(Livro Fisico) 
//Pag. 201 (ALBUQUERQUE; ALEXANDRIA, 2015)
#include <Wire.h> //Biblioteca usada pelo LCD I2C
#include <LiquidCrystal_I2C.h> //Controlar o Display I2C

//Biblioteca SoftwareSerial para comunicação serial assíncrona (UART) com o módulo ESP8266
//Livro consultado: Programação com Arduino: Começando com Sketches de Simon Monk, 2. ed. Bookman (Biblioteca Online), Cap. 11
//Documentação oficial consultada em https://docs.arduino.cc/learn/built-in-libraries/software-serial/
#include <SoftwareSerial.h>

//Inicializa o LCD, 16x2 é o tamanho do display e o 0x27 é o endereço I2C tipo "IP"
LiquidCrystal_I2C lcd(0x27, 16, 2);

//Define os pinos A0 (RX) e A1 (TX) como porta serial secundária para enviar dados ao ESP8266.
//Segundo o livro Automação e Instrumentação Industrial com Arduino Teoria e Projetos (Livro Fisico) Pag. 62,
//os pinos analógicos A0 a A5 (registrador PORTC do ATmega328P) também operam como entradas e saídas digitais.
SoftwareSerial espSerial(A0, A1);

//Vetores pinos Gatilho e Retorno ou trig e echo das vagas(Sensores)
//Livro consultado Elementos de programação de Francisco A. C. Pinheiro Pag. 235 e 236(Biblioteca Online)
//[] reserva espaço na memória {} onde fica o conteúdo as posições começam em 0 como Prof. Paulo ensinou.
const int tVagas[] = {2, 4, 6};
const int eVagas[] = {3, 5, 7};

//Vetores LEDs
const int ledsVerdes[] = {8, 10, 12};
const int ledsVermelhos[] = {9, 11, 13};

//Livro Conceitos de linguagem de programação de Robert W. Sebesta Pag, 201(Biblioteca Online)
//Segundo Prof. Rodnei, a váriavel guarda um valor. É um endereço na memória.
//Váriavel para definir limite da distância, para os sensores.
const int limite = 100;

//Váriavel numero de vagas
const int totalVagas = 3;

//Site consultado em 18 de setembro de 2026 as 23:53hs https://blog.eletrogate.com/guia-completo-do-display-lcd-arduino/
//Comando que inicializa o LCD lcd.init()  comando que ativa led de backlight lcd.backlight()
//Função que liga e testa o display
void setup(){//Configurações iniciais
  //Inicia comunicação serial com o ESP8266 em 9600 bps (bits por segundo).
  //Segundo o livro Arduino Básico de Michael McRoberts (2. ed., Novatec, Cap. 16) e Redes de Computadores
  //de Andrew S. Tanenbaum (Cap. 2), transmissor e receptor UART precisam operar na mesma taxa (baud rate).
  espSerial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);//posição cursor.
  lcd.print("TESTE LCD OK");
  lcd.setCursor(0, 1);
  lcd.print("Funcionando OK");
  delay(2000);//pausa para leitura.
  lcd.clear();//limpa a tela.

  //Livro consultado Automação e Instrumentação Industrial com Arduino Teoria e Projetos(Livro Fisico) Pag.160  
  //Laço de repetição com vetores e ponteiro
  //Isso diminui o codigo e economiza memória
  for (int i = 0; i < totalVagas; i++){
    pinMode(tVagas[i], OUTPUT);
    pinMode(eVagas[i], INPUT);
    pinMode(ledsVerdes[i], OUTPUT);
    pinMode(ledsVermelhos[i], OUTPUT);

    //Desligando LEDs no inicio
    //Livro consultado Automação e Instrumentação Industrial com Arduino Teoria e Projetos(Livro Fisico) Pag.175
    digitalWrite(ledsVerdes[i], LOW);
    digitalWrite(ledsVermelhos[i], LOW); 
  }
}

//Laço de repetição consultado em livro Elementos de programação de Francisco A. C. Pinheiro Pag. 171 em diante (Biblioteca Online)
//Laço de repetição vagas ocupadas e livres
void loop(){
  int vagasOcupadas = 0;//Aqui iniciamos com a variável em 0
  for(int i = 0; i < totalVagas; i++){//Enquanto a variável i for menor que totalVagas soma 1
    int distancia = medirDistancia(tVagas[i], eVagas[i]);//Recebe informação dos pinos
    if (distancia > 0 && distancia <= limite){
      vagasOcupadas++;//Caso a vaga esteja ocupada, apaga led verde e acende led vermelho
      digitalWrite(ledsVerdes[i], LOW);
      digitalWrite(ledsVermelhos[i], HIGH);
    } else {//Caso contrario, acende led Verde e apaga Vermelho
      digitalWrite(ledsVerdes[i], HIGH);
      digitalWrite(ledsVermelhos[i], LOW);
    }
  }

  //Calcula Vagas Disponiveis
  int vagasLivres = totalVagas - vagasOcupadas;

  //Site consultado em 18 de setembro de 2026 as 23:53hs https://blog.eletrogate.com/guia-completo-do-display-lcd-arduino/
  //Mostra no display
  lcd.setCursor(0, 0);//posiciona cursor
  lcd.print("Ocupadas: ");//Escreve Ocupadas:
  lcd.print(vagasOcupadas);
  lcd.print(" ");

  lcd.setCursor(0, 1);//posiciona cursor
  lcd.print("Livres: ");//Escreve Livres:
  lcd.print(vagasLivres);
  lcd.print(" ");

  //Envia os dados via UART para o ESP8266 separados por vírgula ("ocupadas,livres\n").
  //Livro consultado: Internet das Coisas com ESP8266, Arduino e Raspberry Pi de Sérgio de Oliveira (Novatec, 2017, Cap. 3)
  espSerial.print(vagasOcupadas);
  espSerial.print(",");
  espSerial.println(vagasLivres);

  delay(1000);//Pausa 1 segundo até próxima leitura
}

//Função medir distancia
int medirDistancia(int pinT, int pinE){
  pinMode(pinT, OUTPUT);//Define o pino como saída
  digitalWrite(pinT, LOW);//Inicia com o pino desligado
  delayMicroseconds(2);//Aguarda 2 microsegundos desligado
  digitalWrite(pinT, HIGH);//Liga o pino durante 10 microsegundos
  delayMicroseconds(10);
  digitalWrite(pinT, LOW);//desliga novamente
  pinMode(pinE, INPUT);//Definindo o pino como entrada

  //Tipos de dados Livro Automação e Instrumentação Industrial com Arduino Teoria e Projetos(Livro fisico)Pag. 157
  long duracao = pulseIn(pinE, HIGH);//Este comando pulseIn foi consultado no link https://docs.arduino.cc/language-reference/pt/fun%C3%A7%C3%B5es/advanced-io/pulseIn/ em 21 de setembro de 2026 as 16:03hs
  int distancia = duracao * 0.034 / 2; //Transforma o tempo em centimetros. Isso se confirma no capitulo 20 do ebook 13° edição física Conceitual de Paul G. Hewitt 
  return distancia; //Devolve o resultado
}
