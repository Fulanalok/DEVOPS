FROM node:20-slim

RUN groupadd -r appgroup && useradd -m -r -g appgroup appuser

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm install

RUN chown -R appuser:appgroup /app/node_modules

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 5000

CMD ["npm", "run", "dev"]