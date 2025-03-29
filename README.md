# Rastreabilidade de Cumaru

## Sobre o Projeto

Aplicativo de rastreabilidade para a cadeia produtiva do Cumaru, desenvolvido para facilitar o monitoramento e registro de informações desde a coleta até a comercialização. O app utiliza tecnologias modernas como React Native e integração com blockchain para garantir a transparência e autenticidade dos dados.

## Funcionalidades Principais

- **Coleta**: Registro de coletas de sementes com identificação por QR Code
- **Lotes**: Gerenciamento de lotes de produção e áreas de cultivo
- **Geolocalização**: Mapeamento de áreas e rotas de coleta
- **Relatórios**: Visualização de dados e geração de relatórios
- **Gráficos**: Análises visuais de produtividade e outros indicadores
- **Informações Institucionais**: Dados sobre o projeto e equipe

## Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- Expo Router para navegação
- Firebase (Autenticação, Firestore, Storage)
- Armazenamento local com banco de dados SQLite
- Integração com blockchain para rastreabilidade
- Geolocalização

## Pré-requisitos

- Node.js (v14 ou superior)
- Expo CLI
- Git
- Conta Firebase

## Instalação

1. Clone o repositório:
```
git clone https://github.com/wagneroficial/Rastreabilidade-de-cumaru.git
```

2. Navegue até o diretório do projeto:
```
cd Rastreabilidade-de-cumaru
```

3. Instale as dependências:
```
npm install
```

4. Inicie o projeto:
```
npx expo start
```

## Estrutura do Projeto

```
rastreabilidade-de-cumaru/
├── app/                   # Rotas e telas do aplicativo
├── assets/                # Imagens, fontes e outros recursos
├── components/            # Componentes reutilizáveis
├── constants/             # Constantes, como cores e tema
├── hooks/                 # Hooks personalizados do React
├── services/              # Serviços de API, banco de dados e blockchain
└── firebase/              # Configuração e serviços do Firebase
```

## Roadmap

- [x] Configuração inicial do projeto
- [x] Design do dashboard principal
- [ ] Implementação da tela de coleta
- [ ] Implementação do sistema de lotes
- [ ] Integração com sistema de geolocalização
- [ ] Implementação do banco de dados local
- [ ] Integração com Firebase (Autenticação e Firestore)
- [ ] Sistema de sincronização offline/online
- [ ] Integração com blockchain
- [ ] Sistema de relatórios e análises
- [ ] Testes e otimização


