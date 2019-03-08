import { Cidade } from './cidade';
import { Estado } from './estado';
import { Genero } from './genero';

export class Pessoa {
    public id: Number;

    public estadoRegistroGeral: Estado;

    public cidadeNaturalidade: Cidade;

    public nome: String;

    public cpf: String;

    public registroGeral: String;

    public dataNascimento: Date;

    public nomePai: String;

    public nomeMae: String;

    public genero: Genero;

    public caminhoAnexo: String;

    public nomeAnexo: String;

}
