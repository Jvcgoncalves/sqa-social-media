import { isPasswordValid } from "@/utils/password";

describe("isPasswordValid", () => {
  it("accepts an 8-character strong password", () => {
    expect(isPasswordValid("Aa1!aaaa")).toBe(true);
  });
});
