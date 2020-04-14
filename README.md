# Politichat

CS91r project in Spring 2020

Kye Burchard and Sabrina Chern

## Organization

All frontend logic is contained within `client/`, and all backend in `server/`.

### Ports

The server technically runs on port 3000, but for development purposes, all the server paths (`/api`
and `/auth`) are proxied to port 5000, where Webpack serves the React files.

### Client

All pages (i.e., a top level React component that will be in `App.js` as a route) should be in
`src/components/pages/`. Any sub-component of those pages will go in `src/components/modules/`. Only
utilities functions shared by a variety of files should go directly in `src/`.

All CSS styling currently is in `styles.css`. The majority of styling so far is taken care of by our
UI framework, [Semantic UI](https://react.semantic-ui.com/). Icons are provided by
[Font Awesome](https://fontawesome.com/icons). An example of icon import syntax can be found in `App.js`.

### Server

All server development is currently done in `api.js`. There's definitely room for better
organization here, but we'll get to that later.

## Getting started

You'll need Node.js installed, and a `.env` file in the top level directory for the Mongo connection
string. Use `cp .env.example .env` and edit your .env file accordingly. Install the dependencies
with `npm install`.

Then, run `npm start` in one terminal to start the server, and `npm run hotloader` to serve the
client files. You should then be able to open the site in your browser at `localhost:5000`!

For code formatting, [Prettier](https://prettier.io/) works very well. Install the VSCode
extension for formatting on save.
