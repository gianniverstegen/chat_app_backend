# Backend for a global chatroom app

The front end can be found [here](https://github.com/gianniverstegen/chat_app_webserver).

## Technologies used:

- TypeScript
- Node.js
- TypeORM
- GraphQL
- Apollo Server
- Redis
- Postgres
- Argon2

## Main functionality:

- Handle login and registration
- Store users and messages to DB
- Retrieve user info and messages from DB
- Keep track of user sessions

## ERD:

<img width="641" alt="er" src="https://user-images.githubusercontent.com/79252340/143247424-95150e17-c692-47bc-97ba-5c575bd8f176.png">

## Setting up:

- Make sure that the front end of this app is ready to go.
- Set up redis and postgres databases.
- Change the .env.example to .env, and fill in the variables.
  - SECRET is the secret used for user session.
  - DATABASE_URL is, well, the url where the database is located (postgresql://{USERNAME}:{PASSWORD}@{IP}:{PORT}/{DATABASE_NAME}).
  - REDIS_URL is where the redis database is located ({IP}:{PORT}).
  - PORT is the port on which you host the back end.
  - CORS_ORIGIN is the website url at which the front end located, this allows the front end to send API requests to the back end. 
- Run yarn to install the packages.
- Add your tsconfig.
- Run yarn build.
- Run yarn start.
