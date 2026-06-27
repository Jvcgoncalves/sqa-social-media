import { isEmailValid } from "../../src/utils/email";

describe("isEmailValid", () => {
  it("accepts a valid email", () => {
    expect(isEmailValid("student@example.com")).toBe(true);
  });
});
