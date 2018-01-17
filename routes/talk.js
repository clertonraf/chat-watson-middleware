var express = require('express');
var router = express.Router();

var watson = require('watson-developer-cloud');
var axios = require("axios");

const TOKEN = "45b8a93b-840c-4340-bfe3-b2f674b3f084";
const URL = "http://soft031-081:8081/cpa-integracao-sma-sp/consulta-processo";

const config = {
  headers: { 'Content-Type': 'application/json', "authorization": "Bearer " + TOKEN }
};

var conversation = watson.conversation({
  username: '0a2588e8-c11f-4894-841c-e1e42942ee31',
  password: 'p2gRziEi6Bai',
  version: 'v1',
  url: 'https://gateway-fra.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});
var context = {};

var result = "";

var cpa = (txt,res) => {
  axios.post(URL, {
    "cpfInteressado": txt,
    "numeroProcesso": null
  }, config
  ).then((response) => {
    const size = response.data.length;
    if (!response.data || response.data == '' || size === 0) {
      res.send({"text": "Não encontramos processos para o seu cpf", "entity": "BOT"});
    } else {
      var retorno = response.data;
      if (size > 1) {
        res.send({"text": "Encontramos " + size + " processos. Qual deseja consultar?", "entity": "BOT","data": response.data});
      } else {
        var text = "Encontramos o processo "+ retorno.numeroProcesso+ ". O status dele é: "+ retorno.status === "E" ? "Em andamento" : "Finalizado";
        res.send({"text": text, "entity": "BOT"});
      }
    }
  }
    ).catch((error) => {
      console.log(error)
      res.send({"text": "Erro interno ao executar a consulta. Por favor, repetir a operação.", "entity": "BOT"});
    });
}

router.post('/', (req, res, next) => {
  console.log("input:", req.body.text);
  conversation.message({
    workspace_id: '28ab5aba-cdf0-42f4-b882-db43df26b430',
    input: { 'text': req.body.text },
    context: context
  }, (err, response) => {
    if (err) {
      console.log('error:', err);
    } else {
      context = response.context;
      if (response.context.cpf) {
        cpa(response.context.cpf,res);
      } else {
        res.send({ "text": response.output.text[0], "entity": "BOT" });
      }
    }
  });

});

module.exports = router;
