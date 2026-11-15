# 🚲 Bicicletário Inteligente IoT — Guia Interativo e Memorial Técnico (Arduino + ESP8266)

Este repositório contém a documentação interativa (com busca inteligente de dúvidas e fundamentação acadêmica ABNT) e os códigos-fonte do projeto **Bicicletário Inteligente IoT (CycloSpot)**, integrando **Arduino Uno** (sensores ultrassônicos HC-SR04, LEDs e LCD I2C) com o módulo **ESP8266** (Servidor Web Wi-Fi).

## 📂 Estrutura do Repositório

* `index.html`, `style.css`, `script.js` — **Portal Interativo de Documentação (UX/UI)** com busca inteligente de dúvidas, checklist de montagem, modo claro/escuro e fundamentação acadêmica expansível.
* `CODIGO_ARDUINO_BICICLETARIO/CODIGO_ARDUINO_BICICLETARIO.ino` — Código completo do Arduino com envio serial (`SoftwareSerial espSerial(A0, A1)`) e citações acadêmicas nos comentários.
* `CODIGO_ESP8266_WIFI/CODIGO_ESP8266_WIFI.ino` — Código completo do servidor Web Wi-Fi no ESP8266 com exibição do endereço IP no Monitor Serial.
