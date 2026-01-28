# Utilisation d'une version stable de Node.js
FROM node:20-alpine

# Création du dossier de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Exposition du port utilisé par votre API (ajustez si différent)
EXPOSE 3000

# Commande de démarrage définie dans votre package.json
CMD ["npm", "start"]