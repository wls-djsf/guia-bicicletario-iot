//Bibliotecas oficiais para conectividade Wi-Fi (Padrão IEEE 802.11) e Servidor HTTP no ESP8266
//Livro consultado: Internet das Coisas com ESP8266, Arduino e Raspberry Pi de Sérgio de Oliveira (Novatec, 2017, Cap. 4 e Cap. 5)
//Documentação oficial consultada em https://arduino-esp8266.readthedocs.io/
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

//Credenciais da rede sem fio IEEE 802.11 b/g/n (2,4 GHz)
//Livro consultado: Redes de Computadores de Andrew S. Tanenbaum e David J. Wetherall (6. ed., Pearson, Cap. 4)
const char* ssid = "NOME_DO_SEU_WIFI";
const char* password = "SENHA_DO_SEU_WIFI";

//Instancia o servidor Web na porta TCP 80 (porta padrão do protocolo HTTP na Camada de Aplicação)
//Livro consultado: Redes de Computadores e a Internet de James F. Kurose e Keith W. Ross (8. ed., Bookman, Cap. 2)
ESP8266WebServer server(80);

//Variáveis do tipo cadeia de caracteres (String) para armazenar o estado das vagas
//Livro consultado: Conceitos de Linguagens de Programação de Robert W. Sebesta (11. ed., Bookman, Pag. 201-205)
String ocupadas = "0";
String livres = "3";

//Função que atende requisições HTTP GET na rota principal ("/")
void handleRoot() {
  String html = "<html><head><meta charset='UTF-8'><meta http-equiv='refresh' content='2'></head>";
  html += "<body style='font-family: Arial; text-align: center; margin-top: 50px;'>";
  html += "<h1>Bicicletário Inteligente</h1>";
  html += "<h2 style='color: red;'>Vagas Ocupadas: " + ocupadas + "</h2>";
  html += "<h2 style='color: green;'>Vagas Livres: " + livres + "</h2>";
  html += "</body></html>";

  //Retorna o código de status HTTP 200 (OK) e o conteúdo MIME text/html (KUROSE; ROSS, 2021, Cap. 2)
  server.send(200, "text/html", html);
}

void setup() {
  //Inicia a UART0 do ESP8266 em 9600 bps (mesma taxa configurada no espSerial do Arduino)
  //Referência: ESP8266EX Datasheet (Espressif Systems, 2023, Seção 4.5 - UART)
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  //Exibe no Monitor Serial o endereço IPv4 atribuído via protocolo DHCP pelo roteador
  Serial.println("");
  Serial.println("Conectado com sucesso!");
  Serial.print("Acesse no navegador: http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();

  //Lê os dados vindos do Arduino pela porta serial ("ocupadas,livres\n") e separa os valores pela vírgula
  //Livro consultado: Conceitos de Linguagens de Programação de Robert W. Sebesta (11. ed., Bookman, Pag. 205 - Subcadeias)
  if (Serial.available() > 0) {
    String dados = Serial.readStringUntil('\n');
    dados.trim();
    int virgula = dados.indexOf(',');
    if (virgula > 0) {
      ocupadas = dados.substring(0, virgula);
      livres = dados.substring(virgula + 1);
    }
  }
}
