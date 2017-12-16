import React from "react";
import { Container, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <Container text style={{ marginTop: "2em" }}>
    <Header as="h2">Сторінка не існує!</Header>
    <p>Щось пішло не так.</p>
    <Link to="/">Повернутись на головну сторінку.</Link>
  </Container>
);
