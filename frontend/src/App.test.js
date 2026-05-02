import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page title when logged out", () => {
  render(<App />);
  expect(screen.getByText(/Professional School Management System/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
});
