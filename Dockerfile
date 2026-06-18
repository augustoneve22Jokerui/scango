# Estágio de construção/execução
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Instalar dependências globais para ferramentas de build se necessário
RUN apk add --no-cache python3 make g++

# Copiar manifestos de dependências
COPY package*.json ./

# Instalar dependências (apenas produção para imagem final)
# Se precisar de ferramentas de build para bcrypt, rodamos o install antes da limpeza
RUN npm install --omit=dev

# Copiar o restante do código da aplicação
COPY . .

# Criar diretório para uploads e logs (garantindo permissões)
RUN mkdir -p src/public/uploads logs && chown -R node:node /usr/src/app

# Trocar para o usuário 'node' por segurança (evitar root)
USER node

# Expor a porta configurada no .env (default 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
