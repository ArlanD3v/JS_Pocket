const { select, input, checkbox } = require("@inquirer/prompts");
const { stringify } = require("querystring");
const fs = require("fs").promises;

let mensagem = "Bem vindo ao App de Metas";

//
let metas;
// Carregar e escrever as metas para metas.json
const carregarMetas = async () => {
  try {
    const dados = await fs.readFile("metas.json", "utf-8");
    metas = JSON.parse(dados);
  } catch (erro) {
    metas = [];
  }
};
const salvarMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2));
};
//Cadastrando metas com a função criada abaixo, usando o async junto com await
const cadastrarMeta = async () => {
  const meta = await input({ message: "Digite a meta: " });

  if (meta.length == 0) {
    mensagem = "A meta não pode ser vazia.";
    return;
  }

  metas.push({ value: meta, checked: false });

  mensagem = "Meta cadastrada com Sucesso! ";
};

// Listando metas
const listarMetas = async () => {
  if (metas.length == 0) {
    mensagem = "Não existem metas!";
    return;
  }
  const respostas = await checkbox({
    message:
      "Use as setas para mudar de meta, o espaço para marcar/ desmarcar e o Enter para finalizar essa etapa: ",
    choices: [...metas],
    instructions: false,
  });
  //Marca todas as metas como false
  metas.forEach((m) => {
    m.checked = false;
  });
  //Se nenhuma meta for selecionada ele retornar a mensagem abaixo
  if (respostas.length == 0) {
    mensagem = "Nenhuma meta selecionada.";
    return;
  }
  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta;
    });
    meta.checked = true;
  });
  mensagem = "Meta(s) marcadas como concluida(s): ";
};
// Listando metas realizadas
const metasRealizadas = async () => {
  const realizadas = metas.filter((meta) => {
    return meta.checked;
  });
  if (realizadas.length == 0) {
    mensagem = "Não existem metas realizadas :( ";
    return;
  }
  await select({
    message: "Metas Realizadas: " + realizadas.length,
    choices: [...realizadas],
  });
  console.log(realizadas);
};
// Listando metas em aberto
const metasAbertas = async () => {
  const abertas = metas.filter((meta) => {
    return meta.checked != true;
  });
  if (abertas.length == 0) {
    mensagem = "Não existem metas abertas! :)";
    return;
  }
  await select({
    message: "Metas Abertas: " + abertas.length,
    choices: [...abertas],
  });
};
//Deletar Metas
const deletarMetas = async () => {
  if (metas.length == 0) {
    mensagem = "Não existem metas para deletar";
    return;
  }
  const metasDesmacadas = metas.map((meta) => {
    return { value: meta.value, checked: false };
  });
  const itemsADeletar = await checkbox({
    message: "Selecione a(s) meta(s) que deseja deletar: ",
    choices: [...metasDesmacadas],
    instructions: false,
  });
  if (itemsADeletar.length == 0) {
    mensagem = "Nenhum item para deletar!";
    return;
  }

  itemsADeletar.forEach((item) => {
    metas = metas.filter((meta) => {
      return meta.value != item;
    });
  });
  mensagem = "Meta(s) deletada(s) com sucesso!";
};
// Mostrar mensagem
const mostrarMensagem = () => {
  console.clear();
  if (mensagem != "") {
    console.log(mensagem);
    console.log("");
    mensagem = "";
  }
};
//Arvore do Menu :
const start = async () => {
  await carregarMetas();
  while (true) {
    mostrarMensagem();
    await salvarMetas();
    const opcao = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar metas: ",
          value: "cadastrar",
        },
        {
          name: "Lista de metas: ",
          value: "listar",
        },
        {
          name: "Metas concluidas: ",
          value: "realizadas",
        },
        {
          name: "Metas pendentes :",
          value: "abertas",
        },
        {
          name: "Deletar metas :",
          value: "deletar",
        },
        {
          name: "Sair: ",
          value: "sair",
        },
      ],
    });

    switch (opcao) {
      case "cadastrar":
        await cadastrarMeta();
        break;
      case "listar":
        await listarMetas();
        break;
      case "realizadas":
        await metasRealizadas();
        break;
      case "abertas":
        await metasAbertas();
        break;
      case "deletar":
        await deletarMetas();
        break;
      case "sair":
        console.log("Até a proxima!");
        return;
    }
  }
};
start();
