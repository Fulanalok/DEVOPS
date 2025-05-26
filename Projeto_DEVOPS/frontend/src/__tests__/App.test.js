import { render, screen } from "@testing-library/react";
import App from "../App";

test("Renderiza título de login", () => {
  render(<App />);
  const title = screen.getByText(/login/i);
  expect(title).toBeInTheDocument();
});
