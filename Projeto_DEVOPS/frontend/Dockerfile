FROM node:24.0.2-slim

# Criação de usuário e grupo
RUN groupadd -r appgroup && useradd -m -r -g appgroup appuser

WORKDIR /app
COPY --chown=appuser:appgroup package*.json ./
RUN npm install
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 5000
CMD ["npm", "start"]