console.log("--- Iniciando script seedDb.js ---");

try {
  console.log("Tentando carregar dotenv...");
  require("dotenv").config();
  console.log("dotenv.config() executado.");

  console.log("Valor de DB_HOST:", process.env.DB_HOST);
  console.log("Valor de DB_USER:", process.env.DB_USER);
  console.log("Valor de DB_NAME:", process.env.DB_NAME);
  console.log("Valor de DB_PORT:", process.env.DB_PORT);

  const mysql = require("mysql2/promise");
  const { faker } = require("@faker-js/faker/locale/pt_BR");
  const bcrypt = require("bcrypt");

  const dbConfig = {
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "docker",
    port: parseInt(process.env.DB_PORT || "3307", 10),
  };
  console.log("Configuração do banco (dbConfig) definida:", dbConfig);

  const NUM_USERS_TO_CREATE = 15;
  const CONTACTS_PER_USER_MAX_RANGE = 6; 
  const CONTACTS_PER_USER_MIN = 2;
  const DEFAULT_PASSWORD = "password123";

  async function seedDatabase() {
    let connection;
    try {
      console.log("Tentando criar conexão com o banco de dados...");
      connection = await mysql.createConnection(dbConfig);
      console.log("Conectado ao banco de dados para seeding.");

       console.log("Limpando tabelas existentes (users, celulares)...");
       await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
       await connection.execute('TRUNCATE TABLE celulares;');
       await connection.execute('TRUNCATE TABLE users;');
       await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');
       console.log("Tabelas limpas.");

      console.log(`Criando ${NUM_USERS_TO_CREATE} usuários...`);
      const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const createdUserIds = [];

      for (let i = 0; i < NUM_USERS_TO_CREATE; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;
        const email = faker.internet
          .email({
            firstName,
            lastName,
            provider: "example.com",
            allowSpecialCharacters: false,
          })
          .toLowerCase();
        const telefone = faker.helpers.maybe(
          () => faker.phone.number("###########"),
          { probability: 0.8 }
        );

        try {
          const [userResult] = await connection.execute(
            "INSERT INTO users (name, email, password, telefone) VALUES (?, ?, ?, ?)",
            [name, email, hashedDefaultPassword, telefone]
          );
          createdUserIds.push(userResult.insertId);
          console.log(
            `- Usuário criado: ${name} (ID: ${userResult.insertId}, Email: ${email})`
          );
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            const uniqueEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${faker.number.int(
              1000
            )}@example.com`;
            try {
              const [userResultRetry] = await connection.execute(
                "INSERT INTO users (name, email, password, telefone) VALUES (?, ?, ?, ?)",
                [name, uniqueEmail, hashedDefaultPassword, telefone]
              );
              createdUserIds.push(userResultRetry.insertId);
              console.log(
                `- Usuário criado (após tentativa de email único): ${name} (ID: ${userResultRetry.insertId}, Email: ${uniqueEmail})`
              );
            } catch (retryError) {
              console.warn(
                `  Não foi possível criar usuário ${name} devido a email duplicado mesmo após tentativa: ${uniqueEmail}. Erro: ${retryError.message}`
              );
            }
          } else {
            console.warn(
              `  Não foi possível criar usuário ${name}. Erro: ${error.message}`
            );
          }
        }
      }
      console.log(`${createdUserIds.length} usuários efetivamente criados.`);
      console.log(
        `Senha padrão para todos os usuários criados: ${DEFAULT_PASSWORD}`
      );

      if (createdUserIds.length > 0) {
        console.log("\nCriando contatos pessoais...");
        for (const userId of createdUserIds) {
          const numContacts =
            Math.floor(
              Math.random() *
                (CONTACTS_PER_USER_MAX_RANGE - CONTACTS_PER_USER_MIN + 1)
            ) + CONTACTS_PER_USER_MIN;
          console.log(
            `  Criando ${numContacts} contatos para usuário ID ${userId}:`
          );
          for (let j = 0; j < numContacts; j++) {
            const contactName = faker.person.fullName();
            const contactNumber = faker.phone.number(`9########${j}`);
            const contactEmail = faker.helpers.maybe(
              () =>
                faker.internet
                  .email({
                    provider: "fakemail.dev",
                    allowSpecialCharacters: false,
                  })
                  .toLowerCase(),
              { probability: 0.6 }
            );
            const contactObservacoes = faker.helpers.maybe(
              () => faker.lorem.sentence(5),
              { probability: 0.4 }
            );

            try {
              await connection.execute(
                "INSERT INTO celulares (nome, numero, email, observacoes, user_id) VALUES (?, ?, ?, ?, ?)",
                [
                  contactName,
                  contactNumber,
                  contactEmail,
                  contactObservacoes,
                  userId,
                ]
              );
              console.log(
                `    - Contato "${contactName}" (${contactNumber}) criado para usuário ID ${userId}`
              );
            } catch (error) {
              if (error.code === "ER_DUP_ENTRY") {
                console.warn(
                  `    Número de contato duplicado para usuário ID ${userId}, pulando: ${contactNumber}`
                );
              } else {
                console.error(
                  `    Erro ao criar contato "${contactName}" para usuário ID ${userId}:`,
                  error.message
                );
              }
            }
          }
        }
        console.log("Criação de contatos pessoais finalizada.");
      }

      console.log("\nBanco de dados populado com sucesso!");
    } catch (error) {
      console.error("Erro DENTRO da função seedDatabase:", error);
    } finally {
      if (connection) {
        await connection.end();
        console.log("\nConexão com o banco de dados fechada.");
      }
    }
  }

  console.log("Chamando seedDatabase()...");
  seedDatabase();
} catch (scriptError) {
  console.error("Erro NO NÍVEL SUPERIOR do script:", scriptError);
}
