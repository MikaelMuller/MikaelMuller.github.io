const firebaseConfig = {
  apiKey: "AIzaSyBDUWq5eqcmup1YazV7gSQTobbJdfSHEMo",
  authDomain: "grota-funda.firebaseapp.com",
  databaseURL: "https://grota-funda-default-rtdb.firebaseio.com",
  projectId: "grota-funda",
  storageBucket: "grota-funda.firebasestorage.app",
  messagingSenderId: "796815371553",
  appId: "1:796815371553:web:edf9923adaa0885e292260"
};
firebase.initializeApp(firebaseConfig);

var DB = firebase.database();
let vagasSalvas = {};

function enviarRegistro(eventId) {

  if(document.getElementById("nome").value == "" || document.getElementById("idade").value == "" || document.getElementById("enderecoEmail").value == "" || document.getElementById("telefone").value == ""){
    document.getElementById("avisoTexto").innerHTML = "Preencha todos os campos obrigatórios (*)";
    document.getElementById("avisoTexto").style = "color: #FFC32A";
  } else if (!document.getElementById("riscos").checked || !document.getElementById("lgpd").checked){
    document.getElementById("avisoTexto").innerHTML = "É necessário reconhecer os riscos e aviso de privacidade.";
    document.getElementById("avisoTexto").style = "color: #FFC32A";
  } else{
    var nome = document.getElementById("nome").value;
    var idade = document.getElementById("idade").value;
    var enderecoEmail = document.getElementById("enderecoEmail").value;
    var telefone = document.getElementById("telefone").value;
    var alergias = document.getElementById("alergias").value;
    var emergencia = document.getElementById("emergencia").value;
  
    var novoRegistro = DB.ref("eventos").child(eventId).child("participantes").push();
  
    novoRegistro.set({
      nome: nome,
      idade: idade,
      telefone: telefone,
      enderecoEmail: enderecoEmail,
      alergias: alergias,
      emergencia: emergencia
    });
  
    document.getElementById("nome").value = "";
    document.getElementById("idade").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("enderecoEmail").value = "";
    document.getElementById("alergias").value = "";
    document.getElementById("emergencia").value = "";
    
    document.getElementById("avisoTexto").style = "color: black";
    document.getElementById("avisoTexto").innerHTML = "Inscrição realizada com sucesso!";

    vagasSalvas[eventId] = vagasSalvas[eventId] - 1;
    document.getElementById("vagasTexto").innerHTML = '<p id="vagas">Vagas disponíveis: ' + vagasSalvas[eventId] + '</p>';

    if(vagasSalvas[eventId] < 1){
      vagasEsgotadas();
    }
  }
}

DB.ref("eventos").once("value").then(function(snapshot) {
  var meusEventos = '[';

  snapshot.forEach(function(childSnapshot) {
    var data = childSnapshot.val();

    var cor = data.cor;

    if(data.formulario){
      if(Date.parse(data.dia) > new Date()){
        var vagasLivres = data.limite - Object.keys(data.participantes).length;
        meusEventos = meusEventos + '{"start": "' + data.dia + '", "title": "'+ data.nome + '", "id": "' + data.id + '", "backgroundColor": "'+data.cor+'", "extendedProps": {"texto": "'+ data.texto + '", "vagas": "'+vagasLivres+'", "passou": false, "formulario": true}},'
      } else{
        meusEventos = meusEventos + '{"start": "' + data.dia + '", "title": "'+ data.nome + '", "id": "' + data.id + '", "backgroundColor": "gray","extendedProps": {"texto": "'+ data.texto + '", "vagas": "0", "passou": true, "formulario": true}},'
      }
    } else{
      meusEventos = meusEventos + '{"start": "' + data.dia + '", "title": "'+ data.nome + '", "id": "' + data.id + '", "backgroundColor": "'+data.cor+'","extendedProps": {"texto": "'+ data.texto + '", "vagas": "0", "passou": false, "formulario": false}},'
    }
  });
  meusEventos = meusEventos.slice(0, -1);
  meusEventos = meusEventos + "]"

  gerarCalendario(JSON.parse(meusEventos));
  
}).catch(function(error) {
  console.error("Erro ao ler dados:", error);
});

function gerarCalendario(eventosCalendario){
  document.getElementById("carregandoGIF").remove();

  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    headerToolbar: {
      
      left: '',
      center: 'title',
      right: 'prev,next'
    },
    titleFormat:{
      month: 'long'
    },
    height: 'auto',
    firstDay: 1,
    events: eventosCalendario,
    eventClick: function(info) {
      gerarFormulario(info.event.id, info.event.extendedProps.texto, info.event.extendedProps.vagas, info.event.extendedProps.passou, info.event.extendedProps.formulario);
    }
  });
  calendar.render();
}

function gerarFormulario(eventId, texto, vagas, passou, formulario){

  document.getElementById("formularioDiv").style.padding = "1%"; 

  if(formulario){
    if(!passou){
      if(vagasSalvas[eventId] == undefined){
        vagasSalvas[eventId] = vagas;
      }

      document.getElementById("eventoTexto").innerHTML = texto;

      if(vagasSalvas[eventId] > 0){
        document.getElementById("vagasTexto").innerHTML = '<p id="vagas">Vagas disponíveis: ' + vagasSalvas[eventId] + '</p>';
        document.getElementById("eventoDiv").innerHTML = '<h1 id="formularioTexto">Formulário de Inscrição:</h1><p id="nomeTexto">Nome: *</p><input type="text" id="nome" placeholder="Seu nome..." /><p id="idadeTexto">Idade: *</p><input type="number" id="idade" placeholder="Sua idade..." /><p id="idadeTexto">Telefone para contato: *</p><input type="number" id="telefone" placeholder="Número de telefone..." /><p id="emailTexto">E-mail para contato: *</p><input type="email" id="enderecoEmail" placeholder="Seu email..." /><p id="emergenciaTexto">Nome e telefone para caso de emergências:</p><textarea id="emergencia" cols="30" rows="5" placeholder="Contato de emergência..."></textarea><p id="alergiasTexto">Possui alergias, necessidades especiais ou restrições?</p><textarea id="alergias" cols="30" rows="5" placeholder="Alergias, necessidades especiais ou restrições..."></textarea><br><br><input type="checkbox" id="riscos" name="riscos" value="riscos"><label for="riscos" id="riscosTexto">* DECLARO que conheço e assumo os riscos inerentes à atividade de visitação em áreas naturais abertas no interior do Parque Natural Municipal Grota Funda (PNMGF) e que me responsabilizo pelos meus acompanhantes nos passeios e trilhas, isentando a PNMGF e a Prefeitura da estância de Atibaia de qualquer responsabilidade em caso de problemas de saúde, mal súbito ou acidentes pessoais eventualmente ocorridos comigo ou com meus acompanhantes. DECLARO ESTAR CIENTE DE QUE: As áreas naturais do PNMGF apresentam riscos tais como: relevo acidentado, quedas, picadas de insetos e carrapatos, animais peçonhentos, rajadas de vento, quedas de árvores e rochas, deslizamentos de terra, raios, desmoronamentos, entre outros, sendo o visitante o maior responsável pela própria segurança. DECLARO AINDA ESTAR CIENTE DE QUE: Poderei ser responsabilizado por quaisquer danos causados por mim, ou pelos visitantes que estão sob meu acompanhamento, nos patrimônios (ambientais ou históricos) existentes no PNMGF.</label><br><input type="checkbox" id="lgpd" name="lgpd" value="lgpd"><label for="lgpd" id="lgpdTexto">* Aviso de Privacidade (LGPD): As informações coletadas neste formulário serão utilizadas exclusivamente para fins de inscrição, organização e comunicação das atividades do Parque Natural Municipal da Grota Funda. Os dados não serão compartilhados com terceiros e serão armazenados de forma segura, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Você autoriza o uso dos seus dados pessoais conforme descrito acima e de acordo com a LGPD?</label><br><br><button id="botao" onclick="enviarRegistro('+"'"+eventId+"'"+')">Enviar</button><br>';
      } else{
        vagasEsgotadas();
      }
    } else{
      document.getElementById("eventoTexto").innerHTML = "Inscrições encerradas.";
      document.getElementById("vagasTexto").innerHTML = "";
      document.getElementById("eventoDiv").innerHTML = "";
    }
  } else{
    document.getElementById("eventoTexto").innerHTML = texto;
    document.getElementById("vagasTexto").innerHTML = "Não há formulário de inscrição para essa atividade.";
    document.getElementById("eventoDiv").innerHTML = "";
  }
  
  document.getElementById("eventoTexto").scrollIntoView();
}

function vagasEsgotadas(){
  document.getElementById("vagasTexto").innerHTML = '<p id="vagas">VAGAS ESGOTADAS</p>';
  document.getElementById("eventoDiv").innerHTML = '';
}